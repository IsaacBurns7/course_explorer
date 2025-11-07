/*
Find ideal schedule given [courseId], find optimal professors and sections based on criteria (max function)
FUTURE 
- allow for designation of "fixed" professors
- allow configuration of professor_score (mv -> subquery?)
- check that sections are open before returning them 
*/

-- ARRAY['CSCE_314', 'CSCE_221', 'CSCE_312'] is $1
-- 'Spring 2026' is $2
WITH validCourseProfessorSectionPairs AS (
    SELECT cp.course_id, cp.professor_id, cs.section_id, cps.professor_score::numeric,
        ARRAY_AGG((cst.day, cst.start_time, cst.end_time)) AS schedule
    FROM 
        (
            SELECT * 
            FROM course_explorer.courses_professors
            WHERE course_id = ANY($1)
        ) cp
    JOIN 
        (
            SELECT course_id, professor_id, semester_id, section_id
            FROM course_explorer.courses_sections cs
            WHERE course_id = ANY($1)
                AND semester_id = $2
        ) cs
        ON cs.course_id = cp.course_id AND cs.professor_id = cp.professor_id
    JOIN 
        (
            SELECT course_id, semester_id, section_id, day, start_time, end_time
            FROM course_explorer.courses_section_times
            WHERE course_id = ANY($1)
        ) cst
        ON cst.course_id = cs.course_id 
            AND cst.section_id = cs.section_id
            AND cst.semester_id = cs.semester_id
    JOIN (
            SELECT professor_id, professor_score
            FROM course_explorer.courses_professors_scores 
            WHERE course_id = ANY($1)
        ) cps -- course prof score  
        ON cp.professor_id = cps.professor_id
    GROUP BY cp.course_id, cp.professor_id, cs.section_id, cps.professor_score
)
SELECT * FROM validCourseProfessorSectionPairs;

-- Fall 2024
-- ['CSCE_314', 'CSCE_221', 'CSCE_312']
-- returns the following
-- course id, professor id, section id, array_agg (day, start_time, end_time)