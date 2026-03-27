import { Request, Response } from "express";
import { z } from "zod";
const pool = require("../db.js")


const CourseIdRowSchema = z.object({ id: z.string() });
const CourseIdRowsSchema = z.array(CourseIdRowSchema);

type CourseIdRows = z.infer<typeof CourseIdRowsSchema>;
type DbQueryResult = { rows: unknown };

const getAllCourses = async (req:Request, res:Response) => {
    const client = await pool.connect();
    try {
        const sql:String = `
            SELECT id FROM course_explorer.courses
        `;
        const result: DbQueryResult = await client.query(sql); // unknown-ish at runtime
        const parsed: z.SafeParseReturnType<unknown, CourseIdRows> = CourseIdRowsSchema.safeParse(result.rows);
        if (!parsed.success) {
            throw new Error("DB contract violated: " + parsed.error.message);
        }

        const rows:String[] = parsed.data.map(r => r.id);
        return res.status(200).json(rows);
    } catch (error){
        return res.status(500).json({error: error});
    } finally {
        client.release();
    }
}

module.exports = { getAllCourses };