SELECT
  jsonb_build_object(
    'department', c.department,
    'number', c.number,
    'title', c.title,
    'hours', CASE WHEN cs.hours ~ '^[0-9]+$' THEN cs.hours::int ELSE 0 END,
    'info', jsonb_build_object(
      'id', c.id::text,
      'title', c.title,
      'department', c.department,
      'number', c.number,
      'hours', CASE WHEN cs.hours ~ '^[0-9]+$' THEN cs.hours::int ELSE 0 END
    ),
    'professors', jsonb_agg(
      DISTINCT jsonb_build_object(
        'info', jsonb_build_object(
          'averageGPA', ROUND((
            SELECT AVG(cs2.gpa)
            FROM course_explorer.courses_sections cs2
            WHERE cs2.course_id = c.id AND cs2.professor_id = p.id
          )::numeric, 2)::text,
          'averageRating', COALESCE(
            ROUND((
              SELECT SUM(value * frequency) / NULLIF(SUM(frequency), 0)
              FROM course_explorer.professor_ratings pr
              WHERE pr.professor_id = p.id
            )::numeric, 1)::text,
            'N/A'
          ),
          'name', p.name,
          'site', cs.site,
          'classRating', COALESCE(
            ROUND((
                SELECT SUM(value * frequency) / NULLIF(SUM(frequency), 0)
                FROM course_explorer.professor_ratings pr2
                WHERE pr2.professor_id = p.id
                AND pr2.course_id = c.id
            )::numeric, 1)::text,
            'N/A'
          ),
          'warning', CASE 
                        WHEN NOT EXISTS (
                            SELECT 1 
                            FROM course_explorer.courses_sections cs_history
                            WHERE cs_history.professor_id = p.id
                                AND cs_history.course_id = cs.course_id
                                AND cs_history.semester_id LIKE (
                                    CASE
                                        WHEN cs.semester_id LIKE 'Fall%' THEN 'Fall%'
                                        WHEN cs.semester_id LIKE 'Spring%' THEN 'Spring%'
                                        WHEN cs.semester_id LIKE 'Summer%' THEN 'Summer%' 
                                    END
                                )
                                AND SUBSTRING(cs_history.semester_id FROM '\d{4}')::int >=
                                    SUBSTRING(cs.semester_id FROM '\d{4}')::int - 3
                                AND cs_history.semester_id < cs.semester_id
                        )
                        THEN CONCAT('Doesn''t typically teach ', 
                            CASE 
                                WHEN cs.semester_id LIKE 'Fall%' THEN 'Fall'
                                WHEN cs.semester_id LIKE 'Spring%' THEN 'Spring'
                                WHEN cs.semester_id LIKE 'Summer%' THEN 'Summer'
                            END
                        )
                        ELSE NULL
                    END,
          'id', p.id::text
        )
      )
    )
  ) AS result
FROM course_explorer.courses c
JOIN course_explorer.courses_sections cs ON cs.course_id = c.id
JOIN course_explorer.professors p ON p.id = cs.professor_id
WHERE c.id = $1
GROUP BY c.id, c.department, c.number, c.title, cs.hours;
