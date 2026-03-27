import { Request, Response } from "express";
import { z } from "zod";

const pool = require("../db.js");

const ProfessorNameRowSchema = z.object({ name: z.string() });
const ProfessorNameRowsSchema = z.array(ProfessorNameRowSchema);

type ProfessorNameRows = z.infer<typeof ProfessorNameRowsSchema>;
type DbQueryResult = { rows: unknown };

const getAllProfs = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const sql: string = `
            SELECT DISTINCT name FROM course_explorer.professors
        `;
        const result: DbQueryResult = await client.query(sql); // unknown-ish at runtime
        const parsed: z.SafeParseReturnType<unknown, ProfessorNameRows> =
            ProfessorNameRowsSchema.safeParse(result.rows);
        if (!parsed.success) {
            throw new Error("DB contract violated: " + parsed.error.message);
        }

        const rows: string[] = parsed.data.map((r) => r.name);
        return res.status(200).json(rows);
    } catch (error){
        return res.status(500).json({error: error});
    } finally {
        client.release();
    }
}

module.exports = { getAllProfs };