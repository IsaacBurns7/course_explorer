"use strict";
/* ---------------------------------------------------------------------------
 * TEMPORARY LOCAL DATA SOURCE — DELETE THIS FILE WHEN THE NEON TABLES EXIST.
 *
 * The course_explorer schema is owned by role 'isaac' and the app role cannot
 * CREATE in it, so course_explorer.program_requirements / core_curriculum do not
 * exist yet. Until they do, this module serves the same data straight off disk
 * from the scraper output, in exactly the shape the SQL queries return.
 *
 * It is wired in as a FALLBACK ONLY: controllers/programs.js catches the
 * "undefined table" Postgres error (42P01) and calls in here. The moment the
 * tables are created and seeded, the query succeeds, this code stops running,
 * and nothing else has to change.
 *
 * TO REMOVE (after running database/models/program_requirements.sql and
 * database/migration_tools/seedProgramRequirements.js):
 *   1. delete this file (and backend/dist/controllers/programsLocalFallback.js)
 *   2. in controllers/programs.js, delete the `require` of this module and the
 *      two `if (isMissingTableError(error))` blocks
 *   3. npx tsc
 * ------------------------------------------------------------------------- */
const fs = require('fs');
const path = require('path');
// backend/src/controllers -> repo root, and backend/dist/controllers -> repo root
// are the same depth, so this resolves correctly whether run from src or dist.
const DATA_DIR = path.join(__dirname, '../../../degree_program_reqs');
const REQS_PATH = path.join(DATA_DIR, 'program_requirements_clean.json');
const CORE_PATH = path.join(DATA_DIR, 'core_curriculum.json');
// Postgres: undefined_table. This is the only error we fall back on — a genuine
// connection/permission failure must still surface as a 500.
const UNDEFINED_TABLE = '42P01';
function isMissingTableError(error) {
    return Boolean(error) && error.code === UNDEFINED_TABLE;
}
// Same slug rule as database/migration_tools/seedProgramRequirements.js, so the
// program_ids the client caches now stay valid after the switch to the DB.
function slugify(name) {
    return String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
// The files are a few hundred KB; parse once and keep them in memory.
let _cache = null;
function load() {
    if (_cache)
        return _cache;
    if (!fs.existsSync(REQS_PATH) || !fs.existsSync(CORE_PATH)) {
        throw new Error(`local program data not found — expected ${REQS_PATH} and ${CORE_PATH}. ` +
            `Run degree_program_reqs/scrape_programs.py and scrape_core_curriculum.py.`);
    }
    const rawPrograms = JSON.parse(fs.readFileSync(REQS_PATH, 'utf-8'));
    const rawCore = JSON.parse(fs.readFileSync(CORE_PATH, 'utf-8'));
    // Mirror the seed script: skip programs with no requirements, last slug wins.
    const byId = new Map();
    for (const program of rawPrograms) {
        if (!Array.isArray(program.requirements) || program.requirements.length === 0)
            continue;
        const programId = slugify(program.desc_name);
        byId.set(programId, {
            program_id: programId,
            desc_name: program.desc_name,
            kind: program.kind === 'minor' ? 'minor' : 'major',
            url: program.url || null,
            requirements: program.requirements || [],
            footnotes: program.footnotes || {},
            intro: program.intro || [],
        });
    }
    const core = rawCore
        .filter(category => Array.isArray(category.areas) && category.areas.length > 0)
        .map(category => ({
        category: category.category,
        name: category.name || category.category,
        areas: category.areas,
        footnotes: category.footnotes || {},
    }));
    _cache = { byId, core };
    return _cache;
}
/** Same payload as listPrograms' DB path. */
function listProgramsLocal() {
    const { byId, core } = load();
    const majors = [];
    const minors = [];
    for (const program of byId.values()) {
        const entry = { program_id: program.program_id, desc_name: program.desc_name };
        (program.kind === 'minor' ? minors : majors).push(entry);
    }
    const byName = (a, b) => a.desc_name.localeCompare(b.desc_name);
    majors.sort(byName);
    minors.sort(byName);
    return { majors, minors, core };
}
/** Same row shape as getProgramRequirements' DB path, or null if unknown. */
function getProgramRequirementsLocal(programId) {
    const { byId } = load();
    return byId.get(programId) || null;
}
module.exports = { isMissingTableError, listProgramsLocal, getProgramRequirementsLocal };
