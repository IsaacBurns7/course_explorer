/*
course -> semesters -> find hours -> if can't find, give up, 
find professors from course -> sort by criteria 
return 
{
    department: courseData[0], 
    number: courseData[1], 
    title: course.info.title, 
    hours: hours, 
    info: course, 
    professors: professors (hes also using its length ?)
}
*/

WITH professor_ids AS (
    SELECT professor_id
    FROM course_explorer.courses_professors
    WHERE course_id = 'CSCE_314'
),
professor_names AS (
    SELECT name
    FROM course_explorer.professors
    WHERE id IN (SELECT professor_id FROM professor_ids)
)
SELECT department, number, title, 
    (
        SELECT array_agg(p.name)
        FROM professor_names AS p
    ) AS professors,
    (
        SELECT hours 
        FROM course_explorer.courses_sections cs
        WHERE cs.course_id = 'CSCE_314'
        LIMIT 1
    )
    AS hours
FROM course_explorer.courses AS c
WHERE c.id = 'CSCE_314';