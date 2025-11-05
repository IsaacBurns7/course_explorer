EXPLAIN SELECT cp.course_id, cp.professor_id, COUNT(*) AS join_count,
        (
            ROUND(COALESCE( 
                (
                    SUM(pr.value * pr.frequency) / NULLIF(SUM(pr.frequency), 0)
                ),
                (
                    SELECT 
                        COALESCE(
                            SUM(pr2.value * pr2.frequency) / NULLIF(SUM(pr2.frequency), 0),
                            3.0
                        )
                    FROM course_explorer.professor_ratings pr2
                    WHERE cp.professor_id = pr2.professor_id
                )
            )::numeric, 1)
            + 
            ROUND(COALESCE(
                (
                    SUM(
                        (COALESCE(cs.A, 0) * 4.0) + 
                        (COALESCE(cs.B, 0) * 3.0) + 
                        (COALESCE(cs.C, 0) * 2.0) +
                        (COALESCE(cs.D, 0) * 1.0)
                    )/ NULLIF(SUM(
                        COALESCE(cs.A, 0) + 
                        COALESCE(cs.B, 0) + 
                        COALESCE(cs.C, 0) + 
                        COALESCE(cs.D, 0) + 
                        COALESCE(cs.F, 0)
                    ), 0)
                ),
                (
                    SELECT COALESCE(
                        (
                            SUM(
                                (COALESCE(cs2.A, 0) * 4.0) + 
                                (COALESCE(cs2.B, 0) * 3.0) + 
                                (COALESCE(cs2.C, 0) * 2.0) +
                                (COALESCE(cs2.D, 0) * 1.0)
                            )/ NULLIF(SUM(
                                COALESCE(cs2.A, 0) + 
                                COALESCE(cs2.B, 0) + 
                                COALESCE(cs2.C, 0) + 
                                COALESCE(cs2.D, 0) + 
                                COALESCE(cs2.F, 0)
                            ), 0)
                        ),
                        2.50
                    )
                    FROM course_explorer.courses_sections cs2 
                    WHERE cp.professor_id = cs2.professor_id
                )
            )::numeric, 2)
        )
        AS professor_score,
        (
            ROUND(COALESCE(
                (
                    SUM(
                        (COALESCE(cs.A, 0) * 4.0) + 
                        (COALESCE(cs.B, 0) * 3.0) + 
                        (COALESCE(cs.C, 0) * 2.0) +
                        (COALESCE(cs.D, 0) * 1.0)
                    )/ NULLIF(SUM(
                        COALESCE(cs.A, 0) + 
                        COALESCE(cs.B, 0) + 
                        COALESCE(cs.C, 0) + 
                        COALESCE(cs.D, 0) + 
                        COALESCE(cs.F, 0)
                    ), 0)
                ),
                (
                    SELECT COALESCE(
                        (
                            SUM(
                                (COALESCE(cs2.A, 0) * 4.0) + 
                                (COALESCE(cs2.B, 0) * 3.0) + 
                                (COALESCE(cs2.C, 0) * 2.0) +
                                (COALESCE(cs2.D, 0) * 1.0)
                            )/ NULLIF(SUM(
                                COALESCE(cs2.A, 0) + 
                                COALESCE(cs2.B, 0) + 
                                COALESCE(cs2.C, 0) + 
                                COALESCE(cs2.D, 0) + 
                                COALESCE(cs2.F, 0)
                            ), 0)
                        ),
                        2.50
                    )
                    FROM course_explorer.courses_sections cs2 
                    WHERE cp.professor_id = cs2.professor_id
                )
            )::numeric, 2)
        ) AS average_gpa,
        (
            ROUND(COALESCE( 
                (
                    SUM(pr.value * pr.frequency) / NULLIF(SUM(pr.frequency), 0)
                ),
                (
                    SELECT 
                        COALESCE(
                            SUM(pr2.value * pr2.frequency) / NULLIF(SUM(pr2.frequency), 0),
                            3.0
                        )
                    FROM course_explorer.professor_ratings pr2
                    WHERE cp.professor_id = pr2.professor_id
                )
            )::numeric, 1)
        ) AS average_rating
    FROM course_explorer.courses_professors cp
    LEFT JOIN course_explorer.professor_ratings pr 
        ON cp.course_id = pr.course_id
        AND cp.professor_id = pr.professor_id 
    LEFT JOIN course_explorer.courses_sections cs
        ON cs.course_id = cp.course_id
        AND cs.professor_id = cp.professor_id 
    -- LEFT JOIN section_gpas sg
    --     ON sg.course_id = cp.course_id
    --     AND sg.professor_id = cp.professor_id 
    -- WHERE cp.professor_id = '31890'
    GROUP BY cp.course_id, cp.professor_id;