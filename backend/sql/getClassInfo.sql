/* @name ClassInfo */
WITH professor_data AS (
  SELECT
    cs.course_id,
    p.id as professor_id,
    p.name,
    MAX(cs.site) AS site,
    ROUND(AVG(cs.gpa)::numeric, 2)::text AS averageGPA,
    COALESCE(
      ROUND((
        SELECT SUM(value * frequency) / NULLIF(SUM(frequency), 0)
        FROM course_explorer.professor_ratings pr
        WHERE pr.professor_id = p.id
      )::numeric, 1)::text,
      'N/A'
    ) AS averageRating,
    COALESCE(
      ROUND((
          SELECT SUM(value * frequency) / NULLIF(SUM(frequency), 0)
          FROM course_explorer.professor_ratings pr2
          WHERE pr2.professor_id = p.id
          AND pr2.course_id = cs.course_id
      )::numeric, 1)::text,
      'N/A'
    ) AS classRating,
    MAX(
    CASE
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
    END
    ) AS warning
  FROM course_explorer.courses_sections cs
  JOIN course_explorer.professors p ON p.id = cs.professor_id
  GROUP BY cs.course_id, p.id, p.name 
)
SELECT
  jsonb_build_object(
    'department', c.department,
    'number', c.number,
    'title', c.title,
    'hours', (
        SELECT MAX(
            CASE 
              WHEN cs2.hours ~ '^[0-9]+$' THEN cs2.hours::int 
              ELSE 0 
            END
          ) 
        FROM course_explorer.courses_sections cs2 
        WHERE c.id = cs2.course_id
        GROUP BY cs2.hours
    ),
    'info', jsonb_build_object(
      'id', c.id::text,
      'title', c.title,
      'department', c.department,
      'number', c.number,
      'hours', (
        SELECT MAX(
            CASE 
              WHEN cs2.hours ~ '^[0-9]+$' THEN cs2.hours::int 
              ELSE 0 
            END
          ) 
        FROM course_explorer.courses_sections cs2 
        WHERE c.id = cs2.course_id
        GROUP BY cs2.hours
      )
    ),
    'professors', jsonb_agg(
      jsonb_build_object(
        'info', jsonb_build_object(
          'averageGPA', pd.averageGPA,
          'averageRating', pd.averageRating,
          'name', pd.name,
          'site', pd.site,
          'classRating', pd.classRating,
          'warning', pd.warning,
          'id', pd.professor_id::text
        )
      )
    )
  ) AS result
FROM course_explorer.courses c
JOIN professor_data pd ON pd.course_id = c.id
WHERE c.id = $1
GROUP BY c.id, c.department, c.number, c.title;
