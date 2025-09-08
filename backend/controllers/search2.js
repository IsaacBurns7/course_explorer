const { Pool } = require("pg");
const course = require("../models/course");
const pgPool = new Pool({
        user: process.env.DB_USERNAME,
        host: "localhost",
        database: "mydb",
        password: process.env.DB_PASSWORD,
        port: 5432
    });

const getSemestersForCourse = async(req, res) => {
    //fuckin do later
}

// professors: {
//         professorId1:{
//             //to make grades work with semesters would require the frontend to handle all sections 
//             averageRating: 4.8,
//             numRatings: 123, 
//             averageGPA: 1,
//             numStudents,
//             numSections,
//             name,
//         }
//     },
const getProfessorDataForCourse = async(req, res) => {
    const { department, courseNumber } = req.query;
    const client = await pgPool.connect();
    const courseId = `${department}_${courseNumber}`;
    // console.log(courseId);


    try{
        const sql3 = `
            SELECT 
                p.id AS professorid,
                json_build_object(
                    'info', json_build_object(
                        'tags', JSON_AGG(pt.tag),
                        'name', p.name,
                        'averageGPA', p.averageGPA,
                        'difficulty', p.difficulty,
                        'totalSections', p.totalSections,
                        'totalStudents', p.totalStudents,
                        'wouldTakeAgain', p.wouldTakeAgain,
                        'totalRatings', SUM(pr.frequency),
                        'averageRating', SUM(pr.value * pr.frequency) * 1.0 / NULLIF(SUM(pr.frequency), 0)
                    ),
                    'courses', (
                        SELECT JSON_AGG(course_id) 
                        FROM course_explorer.courses_professors cp 
                        WHERE cp.professor_id = p.id
                    ),
                    'ratings', '{}'::jsonb
                ) AS professor_data
            FROM course_explorer.professor_courses AS pc
            JOIN course_explorer.professors AS p ON pc.professor_id = p.id 
            LEFT JOIN course_explorer.professor_ratings AS pr ON pr.professor_id = p.id AND pr.course_id = $1
            LEFT JOIN course_explorer.professor_tags AS pt ON pt.professor_id = p.id AND pt.course_id = $1
            WHERE pc.course_id = $1
            GROUP BY pc.course_id, p.id; 
        `;
        // console.log(sql3);
        const result3 = await client.query(sql3, [courseId]);
        if (!result3.rows.length) {
            return res.status(404).json({ error: `No professors found for course with ID ${courseId}.` });
        }
        const professors = result3.rows.reduce((acc, row) => {
            acc[row.professorid] = row.professor_data;
            return acc;
        }, {}) || {}; //js object, professor_id -> info

        return res.json(professors);
    }catch(error) {
        console.error("Error in search controller: getProfessorDataForCourse");
        return res.status(500).json({error: "Internal server error", message: error});
    }
}
/*
courses: {
        DEPT_123: {
            professors: [
                id1,
                id2   
            ],
            //^^same is true of these grades variable
            averageGPA,
            averageRating,
            numStudents,
            numRatings,
            numSections
            ?prereqs: []
            ?postreqs: []
        }
    },
*/
const getCourseData = async (req, res) => {
    const { department, courseNumber } = req.query;
    const client = await pgPool.connect();
    const courseId = `${department}_${courseNumber}`;

    client.on('notice', msg => {
        console.log('NOTICE: ', msg.message);
    })

    try { 

        // const sql2 = `
        //     WITH section_times AS (
        //         SELECT cst.course_id, cst.semester_id, cst.section_id,
        //             JSON_AGG(
        //                 json_build_object(
        //                     'day', cst.day,
        //                     'start', cst.start_time,
        //                     'end', cst.end_time
        //                 )
        //             ) AS times
        //         FROM course_explorer.courses_section_times cst
        //         GROUP BY cst.course_id, cst.semester_id, cst.section_id
        //     ),
        //     sections AS (
        //         SELECT cs.course_id, cs.semester_id, cst.section_id,
        //             JSON_AGG(
        //                 json_build_object(
        //                     'section', cs.section_id,
        //                     'A', cs.A,
        //                     'B', cs.B,
        //                     'C', cs.C,
        //                     'D', cs.D,
        //                     'F', cs.F,
        //                     'I', cs.I,
        //                     'S', cs.S,
        //                     'U', cs.U,
        //                     'Q', cs.Q,
        //                     'X', cs.X,
        //                     'prof', cs.prof,
        //                     'year', cs.year,
        //                     'semester', cs.semester,
        //                     'gpa', cs.gpa,
        //                     'crn', cs.crn,
        //                     'hours', cs.hours,
        //                     'site', cs.site,
        //                     'prof_id', cs.professor_id,
        //                     'times', st.times
        //                 )
        //             ) AS sections_json
        //         FROM course_explorer.courses_sections cs
        //         LEFT JOIN section_times st
        //             ON st.course_id = cs.course_id
        //             AND st.semester_id = cs.semester_id
        //             AND st.section_id = cs.section_id
        //         GROUP BY cs.course_id, cs.semester_id
        //     ),
        //     sections_by_semester AS (
        //         SELECT course_id, 
        //             JSON_OBJECT_AGG(semester_id, sections_json) AS sections
        //             FROM sections
        //             GROUP BY course_id
        //     )
        //     SELECT 
        //         json_build_object(
        //             'info', json_build_object(
        //                 'department', c.department,
        //                 'number', c.number,
        //                 'title', c.title,
        //                 'description', c.description,
        //                 'averageGPA', c.averageGPA,
        //                 'averageRating', c.averageRating,
        //                 'totalStudents', c.totalStudents,
        //                 'totalRatings', c.totalRatings,
        //                 'totalSections', c.totalSections
        //             ),
        //             'professors', (
        //                 SELECT JSON_AGG(cp.professor_id)
        //                 FROM course_explorer.courses_professors cp
        //                 WHERE cp.course_id = c.id
        //             ),
        //             'sections', sb.sections
        //         )
        //     FROM course_explorer.courses AS c
        //     LEFT JOIN sections_by_semester sb ON sb.course_id = c.id
        //     WHERE c.id = $1
        //     GROUP BY c.id, sb.sections;
        // `;
/*
WITH section_times AS (
                SELECT cst.course_id, cst.semester_id, cst.course_id
                FROM course_explorer.courses_section_times cst 
                GROUP BY cst.course_id, cst.semester_id, cst.course_id
            )
            SELECT 
                c.id, cst.semster_id, cst.course_id
            FROM course_explorer.courses AS c
            LEFT JOIN section_times st ON st.course_id = c.id
            WHERE c.id = $1 
            GROUP BY c.id, st.sections;
// */
//         const sql3 = `
//             DO $$
//                 DECLARE 
//                     _c text;
//                 BEGIN
//                     BEGIN
//                         PERFORM (
//                             WITH section_times AS (
//                                 SELECT course_id, semester_id, section_id
//                                 FROM course_explorer.courses_section_times cst 
//                                 GROUP BY cst.course_id, cst.semester_id, cst.section_id
//                             )
//                             SELECT 
//                                 c.id, st.semester_id, st.section_id
//                             FROM course_explorer.courses AS c
//                             LEFT JOIN section_times st ON st.course_id = c.id
//                             WHERE c.id = $1;
//                         );
//                     EXCEPTION WHEN OTHERS THEN
//                         GET STACKED DIAGNOSTICS _c = PG_EXCEPTION_CONTEXT;
//                         RAISE NOTICE 'context: >>%<<', _c;
//                     END;
//                 END;
//             $$;
//         `;

/*
sections AS (
                SELECT cs.course_id, cs.semester_id, cs.section_id, 
                    JSON_AGG(
                        json_build_object(
                            'A', cs.A,
                            'times', st.times
                        )
                    ) AS sections_json
                FROM course_explorer.courses_sections cs
                LEFT JOIN section_times st 
                    ON st.course_id = cs.course_id
                    AND st.semester_id = st.semester_id
                    AND st.section_id = st.section_id
            )
*/

            //CREATE MATERIALIZED VIEW courses_mv AS 

        const sql4 = `
            CREATE MATERIALIZED VIEW courses_mv AS 
            WITH section_times AS (
                SELECT cst.course_id, cst.semester_id, cst.section_id,
                    JSONB_AGG(
                        jsonb_build_object(
                            'day', cst.day,
                            'start_time', cst.start_time,
                            'end_time', cst.end_time
                        )
                    ) AS times
                FROM course_explorer.courses_section_times cst 
                GROUP BY cst.course_id, cst.semester_id, cst.section_id
            ),
            sections AS (
                SELECT cs.course_id, cs.semester_id, cs.section_id, 
                    JSONB_AGG(
                        jsonb_build_object(
                            'section', cs.section_id,
                            'A', cs.A,
                            'B', cs.B,
                            'C', cs.C,
                            'D', cs.D,
                            'F', cs.F,
                            'I', cs.I,
                            'S', cs.S,
                            'U', cs.U,
                            'Q', cs.Q,
                            'X', cs.X,
                            'prof', cs.prof,
                            'year', cs.year,
                            'semester', cs.semester,
                            'gpa', cs.gpa,
                            'crn', cs.crn,
                            'hours', cs.hours,
                            'site', cs.site,
                            'prof_id', cs.professor_id,
                            'times', st.times
                        )
                    ) AS sections_json
                FROM course_explorer.courses_sections cs
                LEFT JOIN section_times st 
                    ON st.course_id = cs.course_id
                    AND cs.semester_id = st.semester_id
                    AND cs.section_id = st.section_id
                GROUP BY cs.course_id, cs.semester_id, cs.section_id
            ),
            sections_by_semester AS (
                SELECT 
                    course_id,
                    JSONB_OBJECT_AGG(semester_id, sections_json) AS sections
                FROM sections
                GROUP BY course_id
            )
            SELECT 
                c.id AS course_id,
                jsonb_build_object(
                    'info', jsonb_build_object(
                        'department', c.department,
                        'number', c.number,
                        'title', c.title,
                        'description', c.description,
                        'averageGPA', c.averageGPA,
                        'totalSections', c.totalSections,
                        'totalStudents', c.totalStudents,
                        'averageRating', c.averageRating,
                        'totalRatings', c.totalRatings
                    ),
                    'professors', (
                        SELECT JSONB_AGG(professor_id)
                        FROM course_explorer.courses_professors cs
                        WHERE cs.course_id = c.id
                    ),
                    'sections', sb.sections
                ) AS course_data
            FROM course_explorer.courses AS c
            LEFT JOIN sections_by_semester sb ON sb.course_id = c.id
        `;

        // const sql = `
        //     SELECT 
        //         json_build_object(
        //             'info', json_build_object(
        //                 'department', c.department,
        //                 'number', c.number,
        //                 'title', c.title,
        //                 'description', c.description,
        //                 'averageGPA', c.averageGPA,
        //                 'averageRating', c.averageRating,
        //                 'totalStudents', c.totalStudents,
        //                 'totalRatings', c.totalRatings,
        //                 'totalSections', c.totalSections
        //             ),
        //             'professors', (
        //                 SELECT JSON_AGG(cp.professor_id)
        //                 FROM course_explorer.courses_professors cp
        //                 WHERE cp.course_id = c.id
        //             ),
        //             'sections', (SELECT JSON_OBJECT_AGG(
        //                     cs.semester_id, 
        //                     JSON_AGG(
        //                             json_build_object(
        //                                 'section', cs.section_id,
        //                                 'A', cs.A,
        //                                 'B', cs.B,
        //                                 'C', cs.C,
        //                                 'D', cs.D,
        //                                 'F', cs.F,
        //                                 'I', cs.I,
        //                                 'S', cs.S,
        //                                 'U', cs.U,
        //                                 'Q', cs.Q,
        //                                 'X', cs.X,
        //                                 'prof', cs.prof,
        //                                 'year', cs.year,
        //                                 'semester', cs.semester,
        //                                 'gpa', cs.gpa,
        //                                 'crn', cs.crn,
        //                                 'hours', cs.hours,
        //                                 'site', cs.site,
        //                                 'prof_id', cs.professor_id,
        //                                 'times', (
        //                                     SELECT JSON_AGG (
        //                                         json_build_object(
        //                                             'day', cst.day,
        //                                             'start', cst.start_time,
        //                                             'end', cst.end_time
        //                                         )
        //                                     )
        //                                     FROM course_explorer.courses_section_times cst
        //                                     WHERE cst.course_id = cs.course_id
        //                                         AND cst.semester_id = cs.semester_id
        //                                         AND cst.section_id = cs.section_id
        //                                 )
        //                             )
        //                         )
        //                     )
        //                     FROM course_explorer.courses_sections cs
        //                     WHERE cs.course_id = c.id
        //             )
        //         ) AS course_data
        //     FROM course_explorer.courses AS c
        //     WHERE c.id = $1
        //     GROUP BY c.id;
        // `;

        const sql5 = `
            SELECT course_data
            FROM courses_mv 
            WHERE course_id = $1
        `

        const result = await client.query(sql5, [courseId]);
        const courses = result.rows.reduce((acc, row) => {
            acc[courseId] = row.course_data;
            return acc;
        }, {}) || {};

        return res.json(courses);
    } catch (error) {
        console.error("Error in search controller: getCourseData");
        return res.status(500).json({error: "Internal server error", message: error});
    } finally {
        client.release();
    }
}
/*
graph: {
        "DEPT123_id1": {
            data: [array of data]
            meta: { professorId: '100615', department: 'CSCE', courseNumber: '120'}
            name: "CSCE 120 <professorName>"
        }
    }
*/

/*

WITH valid_sections AS (
                SELECT * 
                FROM course_explorer.courses_sections cs
                WHERE cs.course_id = 'CSCE_120'
            )
            SELECT cp.professor_id,
                json_build_object(
                    'data', 1,
                    'meta', json_build_object(
                        'courseNumber', '120',
                        'department', 'CSCE',
                        'professorId', cp.professor_id
                    )
                ) AS graph_data
            FROM course_explorer.courses_professors cp
            JOIN valid_sections vs
                ON vs.professor_id = cp.professor_id
            WHERE cp.course_id = 'CSCE_120';

*/
const getGraphData = async(req, res) => {
    const { department, courseNumber } = req.query;
    const courseId = `${department}_${courseNumber}`;
    try{
        const client = await pgPool.connect();
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
        });
        return res.json(graphData);
    } catch (error){
        console.error("error in getGraphData: ", error);
        return res.status(500).json({error: "Internal server error", message: error});
    } finally {
        client.release();
    }
}
/*

`
            WITH gpa_by_semester AS (
                SELECT
                    cs.course_id,
                    cs.professor_id,
                    cs.semester_id,
                    SUM(
                        (cs.A * 4) + 
                        (cs.B * 3) + 
                        (cs.C * 2) +
                        (cs.D * 1)
                    )::numeric 
                    / NULLIF( SUM(cs.A + cs.B + cs.C + cs.D + cs.F), 0) AS gpa
                FROM course_explorer.courses_sections cs
                WHERE cs.course_id = 'CSCE_120'
                GROUP BY cs.course_id, cs.professor_id, cs.semester_id
            )
            SELECT 
                cs.professor_id, 
                cs.semester_id,
                JSON_OBJECT_AGG(
                    'CSCE' || '120' || '_' || cs.professor_id, 
                    json_build_object(
                        'data', gbs.gpa
                    )
                ) AS lineGraphData
            FROM course_explorer.courses_professors cp
            JOIN course_explorer.courses_sections cs
                ON cs.professor_id = cp.professor_id
                AND cp.course_id = cs.course_id
            JOIN gpa_by_semester gbs 
                ON gbs.course_id = cs.course_id
                AND gbs.professor_id = cs.professor_id 
                AND gbs.semester_id = cs.semester_id 
            WHERE cp.course_id = 'CSCE_120'
            GROUP BY cs.course_id, cs.professor_id, cs.semester_id; 
        `

*/
const getLineGraphData = async(req, res) => {
    const { department, courseNumber } = req.query;
    const courseId = `${department}_${courseNumber}`;
    const client = await pgPool.connect();
    try {
        const sql = `
            WITH course_professor AS (
                SELECT DISTINCt course_id, professor_id
                FROM course_explorer.courses_professors
                WHERE course_id = $1
            ),
            semesters AS (
                SELECT DISTINCT semester_id
                FROM course_explorer.courses_sections
                WHERE course_id = $1
            ),
            all_combinations AS (
                SELECT course_id, professor_id, semester_id, 
                    CAST(SPLIT_PART(semester_id, ' ', 2) AS INTEGER) AS year,
                    CAST(SPLIT_PART(semester_id, ' ', 1) AS TEXT) AS season
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
                LEFT JOIN course_explorer.courses_sections cs
                    ON cs.course_id = ac.course_id
                    AND cs.professor_id = ac.professor_id
                    AND cs.semester_id = ac.semester_id
                GROUP BY ac.course_id, ac.professor_id, ac.semester_id, ac.year, ac.season
                ORDER BY ac.course_id, ac.professor_id, ac.year, 
                    CASE ac.season
                        WHEN 'Spring' THEN 1
                        WHEN 'Summer' THEN 2
                        WHEN 'Fall' THEN 3
                        ELSE 4
                    END
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
            SELECT JSON_OBJECT_AGG(key, value) AS transformed
            FROM (
                SELECT key, value
                FROM line_graphs, json_each(line_graph_data)
            ) AS final;
        `;

        const sql2 = `
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
            )
            SELECT * FROM gpa_by_semester;
        `;
        
        const result = await client.query(sql, [courseId, courseNumber, department]);
        const lineGraphData = result.rows[0].transformed;

        // const result2 = await client.query(sql2, [courseId]);

        // return res.json(result2.rows);
        return res.json(lineGraphData);
    } catch (error){
        console.error("error in getGraphData: ", error);
        return res.status(500).json({error: "Internal server error", message: error});
    } finally {
        client.release();
    }
}

module.exports = {
    getSemestersForCourse,
    getProfessorDataForCourse,
    getCourseData,
    getGraphData,
    getLineGraphData
}