"use strict";
const { Request, Response } = require("express");
const { z } = require("zod");
const path = require("path");
const fs = require("fs");
const { Client } = require("pg");
const pool = require("../db.js");
const getSemestersForCourse = async (req, res) => {
    //fuckin do later
};
const ProfessorDataForCourseInputSchema = z.object({
    department: z.string(),
    courseNumber: z.string()
});
const getProfessorDataForCourse = async (req, res) => {
    const parsed = ProfessorDataForCourseInputSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ "error": "failed to parse input. see api docs" });
    }
    const { department, courseNumber } = parsed.data;
    const courseId = `${department}_${courseNumber}`;
    const client = await pool.connect();
    try {
        const sqlFilePath = path.join(__dirname, '../../sql/getProfessorDataForCourse.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');
        const result = await client.query(sql, [courseId]);
        // Validate and transform data
        const professors = result.rows.reduce((acc, row) => {
            acc[row.professorid] = row.professor_data;
            return acc;
        }, {}) || {};
        return res.json(professors);
    }
    catch (error) {
        console.error("Error in search controller: getProfessorDataForCourse", error);
        return res.status(500).json({ error: "Internal server error", message: error.message });
    }
    finally {
        client.release();
    }
};
const getCourseData = async (req, res) => {
    const { department, courseNumber } = req.query;
    const courseId = `${department}_${courseNumber}`;
    const client = await pool.connect();
    try {
        const sql5 = `
            SELECT course_data
            FROM course_explorer.courses_mv 
            WHERE course_id = $1
        `;
        const result = await client.query(sql5, [courseId]);
        const courses = result.rows.reduce((acc, row) => {
            acc[courseId] = row.course_data;
            return acc;
        }, {}) || {};
        return res.json(courses);
    }
    catch (error) {
        console.error("Error in search controller: getCourseData", error);
        return res.status(500).json({ error: "Internal server error", message: error.message });
    }
    finally {
        client.release();
    }
};
const getGraphData = async (req, res) => {
    const { department, courseNumber } = req.query;
    const courseId = `${department}_${courseNumber}`;
    const client = await pool.connect();
    try {
        const sql = `
            WITH valid_sections AS (
                SELECT * 
                FROM course_explorer.courses_sections cs
                WHERE cs.course_id = $1
            )
            SELECT cp.professor_id,
                json_build_object(
                    'data', (ARRAY[
                        json_build_array('A', SUM(vs.A)),
                        json_build_array('B', SUM(vs.B)),
                        json_build_array('C', SUM(vs.C)),
                        json_build_array('D', SUM(vs.D)),
                        json_build_array('F', SUM(vs.F)),
                        json_build_array('I', SUM(vs.I)),
                        json_build_array('S', SUM(vs.S)),
                        json_build_array('U', SUM(vs.U)),
                        json_build_array('Q', SUM(vs.Q)),
                        json_build_array('X', SUM(vs.X))
                    ]),
                    'meta', json_build_object(
                        'courseNumber', $2::text,
                        'department', $3::text,
                        'professorId', cp.professor_id
                    ),
                    'name', vs.prof
                ) AS graph_data
            FROM course_explorer.courses_professors cp
            JOIN valid_sections vs
                ON vs.professor_id = cp.professor_id
            WHERE cp.course_id = $1
            GROUP BY cp.course_id, cp.professor_id, vs.prof;
        `;
        const result = await client.query(sql, [courseId, courseNumber, department]);
        const graphData = result.rows.reduce((acc, row) => {
            acc[`${department}${courseNumber}_${row.professor_id}`] = row.graph_data;
            return acc;
        }, {});
        return res.json(graphData);
    }
    catch (error) {
        console.error("error in getGraphData: ", error);
        return res.status(500).json({ error: "Internal server error", message: error.message });
    }
    finally {
        client.release();
    }
};
const getLineGraphData = async (req, res) => {
    const { department, courseNumber } = req.query;
    const courseId = `${department}_${courseNumber}`;
    const client = await pool.connect();
    try {
        const sql = `
            WITH course_professor AS (
                SELECT DISTINCT course_id, professor_id
                FROM course_explorer.courses_professors
                WHERE course_id = $1
            ),
            semesters AS (
                SELECT DISTINCT semester_id
                FROM course_explorer.courses_sections
                WHERE course_id = $1
            ),
            all_combinations AS (
                SELECT course_id, professor_id, s.semester_id
                FROM course_professor
                CROSS JOIN semesters s
            ),
            gpa_by_semester AS (
                SELECT
                    ac.course_id,
                    ac.professor_id,
                    ac.semester_id,
                    MAX(cs.prof) AS professor_name,
                    SUM(
                        (cs.A * 4) + 
                        (cs.B * 3) + 
                        (cs.C * 2) +
                        (cs.D * 1)
                    )::numeric 
                    / NULLIF( SUM(cs.A + cs.B + cs.C + cs.D + cs.F), 0) AS gpa
                FROM all_combinations ac
                LEFT OUTER JOIN course_explorer.courses_sections cs
                    ON cs.course_id = ac.course_id
                    AND cs.professor_id = ac.professor_id
                    AND cs.semester_id = ac.semester_id
                GROUP BY ac.course_id, ac.professor_id, ac.semester_id
                ORDER BY ac.course_id, ac.professor_id, ac.semester_id
            ),
            gpa_by_course_and_professor AS (
                SELECT 
                    course_id,
                    professor_id,
                    MAX(professor_name) AS professor_name,
                    JSON_AGG(gpa) AS gpas
                FROM gpa_by_semester gbs
                GROUP BY course_id, professor_id
            ),
            line_graphs AS (
                SELECT 
                    JSON_OBJECT_AGG(
                        COALESCE($3::text, '') || COALESCE($2::text, '') || '_' || COALESCE(gcp.professor_id::text, 'unknown'),
                        json_build_object(
                            'data', gcp.gpas,
                            'meta', json_build_object(
                                'courseNumber', $2,
                                'department', $3,
                                'professorId', gcp.professor_id
                            ),
                            'name', ($3 || ' ' || $2 || ' ' || gcp.professor_name)::text
                        )
                    ) AS line_graph_data
                FROM gpa_by_course_and_professor gcp 
                WHERE gcp.course_id = $1
                GROUP BY gcp.course_id, gcp.professor_id
            )
            SELECT 
                JSON_OBJECT_AGG(key, value) AS transformed
            FROM (
                SELECT key, value
                FROM line_graphs, json_each(line_graph_data)
            ) AS final;
        `;
        const sql3 = `
            SELECT JSON_AGG(DISTINCT semester_id) AS semesters
            FROM course_explorer.courses_sections
            WHERE course_id = $1;
        `;
        const result = await client.query(sql, [courseId, courseNumber, department]);
        const lineGraphData = result.rows[0].transformed;
        const result2 = await client.query(sql3, [courseId]);
        const semesters = result2.rows[0].semesters;
        return res.status(200).json({
            lineGraphData: lineGraphData,
            semesters: semesters
        });
    }
    catch (error) {
        console.error("error in getLineGraphData: ", error);
        return res.status(500).json({ error: "Internal server error", message: error.message });
    }
    finally {
        client.release();
    }
};
module.exports = {
    getSemestersForCourse,
    getProfessorDataForCourse,
    getCourseData,
    getGraphData,
    getLineGraphData
};
