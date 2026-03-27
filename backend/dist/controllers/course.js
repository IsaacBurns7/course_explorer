"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const pool = require("../db.js");
const CourseIdRowSchema = zod_1.z.object({ id: zod_1.z.string() });
const CourseIdRowsSchema = zod_1.z.array(CourseIdRowSchema);
const getAllCourses = async (req, res) => {
    const client = await pool.connect();
    try {
        const sql = `
            SELECT id FROM course_explorer.courses
        `;
        const result = await client.query(sql); // unknown-ish at runtime
        const parsed = CourseIdRowsSchema.safeParse(result.rows);
        if (!parsed.success) {
            throw new Error("DB contract violated: " + parsed.error.message);
        }
        const rows = parsed.data.map(r => r.id);
        return res.status(200).json(rows);
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
    finally {
        client.release();
    }
};
module.exports = { getAllCourses };
