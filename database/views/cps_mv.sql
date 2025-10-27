CREATE MATERIALIZED VIEW course_explorer.courses_professors_scores AS 
    SELECT cp.course_id, cp.professor_id, 
        (
            COALESCE( --average rating
                ROUND((
                    SUM(pr.value * pr.frequency) / NULLIF(SUM(pr.frequency), 0)
                )::numeric, 1),
                0.0
            ) 
            + 
            COALESCE(
                ROUND((
                    AVG(cs.gpa)
                )::numeric, 2),
                0.0
            )
        )
        as professor_score
    FROM course_explorer.courses_professors cp
    LEFT JOIN course_explorer.professor_ratings pr 
        ON cp.course_id = pr.course_id
        AND cp.professor_id = pr.professor_id 
    LEFT JOIN course_explorer.courses_sections cs
        ON cs.course_id = cp.course_id
        AND cs.professor_id = cp.professor_id 
    GROUP BY cp.course_id, cp.professor_id;

