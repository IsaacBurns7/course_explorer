/*
Find ideal schedule given [courseId], find optimal professors and sections based on criteria (max function)
FUTURE 
- allow for designation of "fixed" professors
- allow configuration of professor_score (mv -> subquery?)
- check that sections are open before returning them 
*/

-- ARRAY['CSCE_314', 'CSCE_221', 'CSCE_312'] is $1
-- 'Spring 2026' is $2

/*
$1 -> courses: String[]
$2 -> semester: String
$3 -> min_rating: Number
$4 -> min_gpa: Number
$5 -> professor_list: {
    [courseId]: String -> Integer[] (actual professor ids)
    }
    example: {
        "CSCE_221": [1234, 12345]
    }
$6 -> course_weights: {
        courseId: String -> {
            "course_weight" -> float,
            "gpa_percentage" -> float,
            "rating_percentage" -> float
        }
    }
    Example: {
    "CSCE_314": { "course_weight": 2.0, "gpa_weight": 0.7, "rating_weight": 0.3 },
    "CSCE_312": { "course_weight": 1.0, "gpa_weight": 0.5, "rating_weight": 0.5 }
    }
$7 -> preferences: {
        "no_classes_before": {
            "time" -> <date_time>,
            "penalty" -> float
        },
        "no_classes_after": {
            "time" -> date_time,
            "penalty" -> float
        },
        "no_classes_friday": {
            "penalty" -> float
        }
    }
    Example: {
        "no_classes_before": { "time": "09:00:00", "penalty": 0.8 },
        "no_classes_after": { "time": "17:00:00", "penalty": 0.7 },
        "no_classes_on_friday": { "penalty": 0.5 }
    }
*/

/*
friday: search in schedule for cst.day is friday
no classes before <x>: search in schedule for cst.start_time is before <x>
no classes after <y>: search in schedule for cst.end_time is after <y>
*/
WITH validCourseProfessorSectionPairs AS (
    SELECT cp.course_id, cp.professor_id, cs.section_id, cs.crn,
        ARRAY_AGG((cst.day, cst.start_time, cst.end_time)) AS schedule,
        -- Compute the dynamic weighted score
        COALESCE(
            (
                -- COALESCE((($6 -> cp.course_id ->> 'course_weight')::numeric), 1.0) 
                -- *
                (
                --     COALESCE((($6 -> cp.course_id ->> 'gpa_weight')::numeric), 0.5) *
                    COALESCE(cps.average_gpa, 0)
                    +
                --     COALESCE((($6 -> cp.course_id ->> 'rating_weight')::numeric), 0.5) * 
                    COALESCE(cps.average_rating, 0)
                )
                -- *
                -- COALESCE(, 1.0)
                -- *
                -- CASE WHEN BOOL_OR(cst.day = 'F')
                --     THEN COALESCE((($7 -> 'no_classes_friday' ->> penalty)::numeric), 1.0)
                --     ELSE 1.0 END
                -- *
                -- CASE WHEN BOOL_OR(cst.start_time < ($7 -> 'no_classes_before' ->> 'time')::time)
                --     THEN COALESCE((($7 -> 'no_classes_before' ->> penalty)::numeric), 1.0)
                --     ELSE 1.0 END
                -- *
                -- CASE WHEN BOOL_OR(cst.end_time > ($7 -> 'no_classes_after' ->> 'time')::time)
                --     THEN COALESCE((($7 -> 'no_classes_after' ->> penalty)::numeric), 1.0)
                --     ELSE 1.0 END
            )
        , 0) AS professor_score
    FROM 
        (
            SELECT * 
            FROM course_explorer.courses_professors
            WHERE course_id = ANY($1)
                AND (
                    CASE 
                        WHEN $5 ? course_id THEN professor_id = ANY(
                            SELECT jsonb_array_elements_text($5->course_id)::INTEGER
                        )
                        ELSE TRUE
                    END
                )
        ) cp
    JOIN 
        (
            SELECT course_id, professor_id, semester_id, section_id, crn
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
            SELECT professor_id, professor_score, average_gpa, average_rating
            FROM course_explorer.courses_professors_scores 
            WHERE course_id = ANY($1)
                AND (average_gpa >= $3 OR $3 IS NULL)
                AND (average_rating >= $4 OR $4 IS NULL)
        ) cps -- course prof score  
        ON cp.professor_id = cps.professor_id
    GROUP BY cp.course_id, cp.professor_id, cs.section_id, cps.professor_score, cs.crn, cps.average_gpa, cps.average_rating
)
SELECT * FROM validCourseProfessorSectionPairs;

-- Fall 2024
-- ['CSCE_314', 'CSCE_221', 'CSCE_312']
-- returns the following
-- course id, professor id, section id, array_agg (day, start_time, end_time)