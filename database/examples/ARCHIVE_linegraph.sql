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