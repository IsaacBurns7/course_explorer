"use strict";
/*
Degree program requirements + university core curriculum.

Reference data scraped from the TAMU catalog and loaded by
database/migration_tools/seedProgramRequirements.js. Read-only here.

The degree planner calls listPrograms() once on load (pick-lists + the core curriculum,
which the client needs to classify planned courses into core areas), then
getProgramRequirements() per selected program (one major + up to two minors).
*/
// Lazy-load pool so requiring this module doesn't trigger a DB connection
let _pool = null;
function getPool() {
    if (!_pool)
        _pool = require("../db.js");
    return _pool;
}
/*
GET /api/programs
-> {
     majors: [{ program_id, desc_name }],
     minors: [{ program_id, desc_name }],
     core:   [{ category, name, areas, footnotes }]
   }
Requirements are deliberately NOT included — there are ~800 programs, and the client
fetches only the handful it needs via getProgramRequirements.
*/
const listPrograms = async (req, res) => {
    const client = await getPool().connect();
    try {
        const programs = await client.query(`SELECT program_id, desc_name, kind
               FROM course_explorer.program_requirements
              ORDER BY desc_name`);
        const core = await client.query(`SELECT category, name, data, footnotes
               FROM course_explorer.core_curriculum
              ORDER BY category`);
        const majors = [];
        const minors = [];
        for (const row of programs.rows) {
            const entry = { program_id: row.program_id, desc_name: row.desc_name };
            (row.kind === "minor" ? minors : majors).push(entry);
        }
        return res.status(200).json({
            majors,
            minors,
            core: core.rows.map(row => ({
                category: row.category,
                name: row.name,
                areas: row.data,
                footnotes: row.footnotes,
            })),
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
    finally {
        client.release();
    }
};
/*
GET /api/programs/:id/requirements
-> { program_id, desc_name, kind, url, requirements, footnotes, intro }
*/
const getProgramRequirements = async (req, res) => {
    const client = await getPool().connect();
    try {
        const programId = req.params.id;
        const result = await client.query(`SELECT program_id, desc_name, kind, url, requirements, footnotes, intro
               FROM course_explorer.program_requirements
              WHERE program_id = $1`, [programId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `no program with id '${programId}'` });
        }
        return res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
    finally {
        client.release();
    }
};
module.exports = { listPrograms, getProgramRequirements };
