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
const getGraphData = async(req, res) => {
    const { department, courseNumber } = req.query;
    if(!department || !courseNumber){
        return res.status(400).json({error: "Missing Query Parameters"});
    }
    const courseId = `${department}_${courseNumber}`;
    const selectedCourse = await Course.findOne({_id: courseId});
    if(!selectedCourse){
        return res.status(400).json({error: "No course found with specified department and courseNumber"});
    }

    const professorIds = selectedCourse.professors || [];
    if(professorIds.length == 0) return res.json({});

    const professors = await Professor.find({_id: { $in: professorIds}});
    const results = {};
    const categories = ["A", "B", "C", "D", "F", "I", "S", "U", "Q", "X"];
    const data = categories.map((category) => {
        return [
            category,
            0
        ]
    });
    for(const professor of professors){
        const graphId = `${department}${courseNumber}_${professor._id}`;
        results[graphId] = {
            data: JSON.parse(JSON.stringify(data)), //needs to create a deep clone
            meta: {
                professorId: professor._id,
                department: department,
                courseNumber: courseNumber,
            },
            name: `${department} ${courseNumber} ${professor.info.name}`
        };
    }
    const validProfessorIds = new Set(professorIds);
    for(const [semester, sections] of selectedCourse.sections){
        // console.log(sections);
        for(const section of sections){
            if(!section.prof_id || !validProfessorIds.has(section.prof_id)) continue;
            const graphId = `${department}${courseNumber}_${section.prof_id}`;
            // console.log(graphId);
            // console.log(results[graphId]);
            for(const category of categories){
                const value = section[category];
                if(!results[graphId] || !results[graphId].data){
                    console.log("search controller, getGraphData: result set malformed - cannot access data of graphId ", graphId);
                }
                // below vs const graphData = results[graphId].data
                const index = results[graphId].data.findIndex(item => item[0] === category);
                // console.log(index, results[graphId].data[index][1], Number(value));
                results[graphId].data[index][1] += Number(value);
            }
            // console.log(results[graphId]);
        }
    }

    return res.status(200).json(results);
}

const getLineGraphData = async(req, res) => {
    const { department, courseNumber } = req.query;
    if(!department || !courseNumber){
        return res.status(400).json({error: "Missing Query Parameters"});
    }
    const courseId = `${department}_${courseNumber}`;
    const selectedCourse = await Course.findOne({_id: courseId});
    if(!selectedCourse){
        return res.status(400).json({error: "No course found with specified department and courseNumber"});
    }

    const professorIds = selectedCourse.professors || [];
    if(professorIds.length == 0) return res.json({});

    const professors = await Professor.find({_id: { $in: professorIds}});
    // const categories = Object.keys(selectedCourse.sections.$getAllSubDocs());
    const semesters = Object.keys(selectedCourse.sections.toJSON());
    const results = {};
    //maps letterGrade to addition to GPA, and addition to studentCount
    const gradesToGPA = { 
        "A": {cumGPA: 4, headCount: 1}, //
        "B": {cumGPA: 3, headCount: 1}, 
        "C": {cumGPA: 2, headCount: 1}, 
        "D": {cumGPA: 1, headCount: 1}, 
        "F": {cumGPA: 0, headCount: 1}, 
        "I": {cumGPA: 0, headCount: 0},
        "S": {cumGPA: 0, headCount: 0}, 
        "U": {cumGPA: 0, headCount: 0}, 
        "Q": {cumGPA: 0, headCount: 0}, 
        "X": {cumGPA: 0, headCount: 0}
    };
    const data = semesters.map((semester) => {
        return {
            semester: semester,
            cumGPA: 0.00, //cumulative GPA
            headCount: 0, //student count
        }
    });

    for(const professor of professors){
        const graphId = `${department}${courseNumber}_${professor._id}`;
        results[graphId] = {
            data: JSON.parse(JSON.stringify(data)), //needs to create a deep clone
            meta: {
                professorId: professor._id,
                department: department,
                courseNumber: courseNumber,
            },
            name: `${department} ${courseNumber} ${professor.info.name}`,
        };
    }   

    const validProfessorIds = new Set(professorIds);
    for(const [semester, sections] of selectedCourse.sections){
        // console.log(sections);
        for(const section of sections){
            if(!section.prof_id || !validProfessorIds.has(section.prof_id)) continue;
            const graphId = `${department}${courseNumber}_${section.prof_id}`;
            const semesterIndex = results[graphId].data.findIndex(item => item.semester === semester);
            // console.log(graphId);
            // console.log(results[graphId]);
            for(const letterGrade of Object.keys(gradesToGPA)){
                const frequency = section[letterGrade];
                if(!results[graphId] || !results[graphId].data){
                    console.log("search controller, getGraphData: result set malformed - cannot access data of graphId ", graphId);
                }
                // below vs const graphData = results[graphId].data
                // console.log(index, results[graphId].data[index][1], Number(value));
                results[graphId].data[semesterIndex].cumGPA += Number(frequency) * gradesToGPA[letterGrade].cumGPA;
                results[graphId].data[semesterIndex].headCount += Number(frequency) * gradesToGPA[letterGrade].headCount;
            }
            // console.log(results[graphId]);
        }
    }

    /*
    idea: semesters is like [sem1,sem2,sem3]
    and then professor data is [gpa1,gpa2,gpa3], and if their headCount is 0, then gpa is set to 0.00, which then will tell 
    the frontend to NOT display it
    */
    for(const professor of professors){
        const graphId = `${department}${courseNumber}_${professor._id}`;
        for(const semester of semesters){
            const semesterIndex = results[graphId].data.findIndex(item => item.semester === semester);
            const dataPoint = results[graphId].data[semesterIndex];
            const newDataPoint = dataPoint.cumGPA / dataPoint.headCount;
            results[graphId].data[semesterIndex] = dataPoint.headCount === 0 ? 0.00 : newDataPoint;
        }
    }
    return res.status(200).json({
        lineGraphData: results,
        semesters: semesters,
    });
}

module.exports = {
    getSemestersForCourse,
    getProfessorDataForCourse,
    getCourseData,
    getGraphData,
    getLineGraphData
}