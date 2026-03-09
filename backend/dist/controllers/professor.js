"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const pool = require("../db.js");
const ProfessorNameRowSchema = zod_1.z.object({ name: zod_1.z.string() });
const ProfessorNameRowsSchema = zod_1.z.array(ProfessorNameRowSchema);
const getAllProfs = async (req, res) => {
    const client = await pool.connect();
    try {
        const sql = `
            SELECT DISTINCT name FROM course_explorer.professors
        `;
        const result = await client.query(sql); // unknown-ish at runtime
        const parsed = ProfessorNameRowsSchema.safeParse(result.rows);
        if (!parsed.success) {
            throw new Error("DB contract violated: " + parsed.error.message);
        }
        const rows = parsed.data.map((r) => r.name);
        return res.status(200).json(rows);
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
    finally {
        client.release();
    }
};
module.exports = { getAllProfs };
