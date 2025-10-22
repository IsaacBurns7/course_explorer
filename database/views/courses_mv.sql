DROP MATERIALIZED VIEW IF EXISTS course_explorer.courses_mv;

CREATE MATERIALIZED VIEW course_explorer.courses_mv AS 
WITH section_times AS (
    SELECT 
        cst.course_id, 
        cst.semester_id, 
        cst.section_id,
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
    SELECT 
        cs.course_id, 
        cs.semester_id, 
        cs.section_id, 
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
    ) AS section_json

    FROM course_explorer.courses_sections cs
    LEFT JOIN section_times st 
        ON st.course_id = cs.course_id
        AND cs.semester_id = st.semester_id
        AND cs.section_id = st.section_id
),

sections_by_semester AS (
    SELECT 
        course_id,
        semester_id,
        JSONB_AGG(section_json) AS sections_json
    FROM sections
    GROUP BY course_id, semester_id
),

sections_agg AS (
    SELECT 
        course_id,
        JSONB_OBJECT_AGG(semester_id, sections_json) AS sections
    FROM sections_by_semester
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
            SELECT JSONB_AGG(cp.professor_id)
            FROM course_explorer.courses_professors cp
            WHERE cp.course_id = c.id
        ),
        'sections', sa.sections
    ) AS course_data
FROM course_explorer.courses AS c
LEFT JOIN sections_agg sa ON sa.course_id = c.id;
