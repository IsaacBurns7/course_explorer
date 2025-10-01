/*
Find ideal schedule given [courseId], find optimal professors and sections based on criteria (max function)
FUTURE: allow for designation of "fixed" professors
*/

-- ARRAY['CSCE_314', 'CSCE_221', 'CSCE_312'] is $1
-- 'FALL 2024' is $2
WITH validCourseProfessorSectionPairs AS (
    SELECT cp.course_id, cp.professor_id, cs.section_id, 
        ARRAY_AGG(cst.day), 
        ARRAY_AGG(cst.start_time), 
        ARRAY_AGG(cst.end_time)
    FROM 
        (
            SELECT * 
            FROM course_explorer.courses_professors
            WHERE course_id = ANY(ARRAY['CSCE_314', 'CSCE_221', 'CSCE_312'])
        ) cp
    JOIN 
        (
            SELECT course_id, professor_id, semester_id, section_id
            FROM course_explorer.courses_sections cs
            WHERE course_id = ANY(ARRAY['CSCE_314', 'CSCE_221', 'CSCE_312'])
                AND semester_id = 'Fall 2024'
        ) cs
        ON cs.course_id = cp.course_id AND cs.professor_id = cp.professor_id
    JOIN 
        (
            SELECT course_id, semester_id, section_id, day, start_time, end_time
            FROM course_explorer.courses_section_times
            WHERE course_id = ANY(ARRAY['CSCE_314', 'CSCE_221', 'CSCE_312'])
        ) cst
        ON cst.course_id = cs.course_id 
            AND cst.section_id = cs.section_id
            AND cst.semester_id = cs.semester_id
    GROUP BY cp.course_id, cp.professor_id, cs.section_id
)
SELECT * FROM validCourseProfessorSectionPairs;