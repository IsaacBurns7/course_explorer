/** Types generated for queries found in "sql/getBestClasses.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'BestClasses' parameters type */
export type IBestClassesParams = void;

/** 'BestClasses' return type */
export interface IBestClassesResult {
  result: Json | null;
}

/** 'BestClasses' query type */
export interface IBestClassesQuery {
  params: IBestClassesParams;
  result: IBestClassesResult;
}

const bestClassesIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT \n(\n    jsonb_object_agg(\n        semester_id, courses\n    )\n) AS result\nFROM (\n    SELECT \n        semester_id, \n        jsonb_agg(\n            jsonb_build_object(\n                'department', department,\n                'number', number,\n                'title', title,\n                'hours', CASE WHEN hours ~ '^[0-9]+$' THEN hours::int ELSE 0 END,                        \n                'professors', professors\n            )\n        ) AS courses\n    FROM (\n        SELECT \n            c.semester_id,\n            c.department,\n            c.number,\n            c.title,\n            MAX(c.hours) AS hours,\n            jsonb_agg(\n                DISTINCT jsonb_build_object(\n                    'info', jsonb_build_object(\n                        'averageGPA', ROUND((\n                            SELECT AVG(cs.gpa)\n                            FROM course_explorer.courses_sections cs\n                            WHERE cs.course_id = c.course_id\n                            AND cs.professor_id = p.id \n                        )::numeric, 2)::text,\n                        'averageRating', COALESCE(\n                            ROUND((\n                                SELECT SUM(value * frequency) / NULLIF(SUM(frequency), 0)\n                                FROM course_explorer.professor_ratings pr\n                                WHERE pr.professor_id = p.id\n                            )::numeric, 1)::text,\n                            'N/A'\n                        ),\n                        'debugId', p.id,\n                        'debugClass', c.course_id,\n                        'classRating', COALESCE(\n                            ROUND((\n                                SELECT SUM(value * frequency) / NULLIF(SUM(frequency), 0)\n                                FROM course_explorer.professor_ratings pr\n                                WHERE (pr.professor_id = p.id AND pr.course_id = c.course_id)\n                            )::numeric, 1)::text,\n                            'N/A'\n                        ),\n                        'name', p.name,\n                        'site', c.site,\n                        'warning', CASE \n                            WHEN NOT EXISTS (\n                                SELECT 1 \n                                FROM course_explorer.courses_sections cs_history\n                                WHERE cs_history.professor_id = p.id\n                                    AND cs_history.course_id = c.course_id\n                                    AND cs_history.semester_id LIKE (\n                                        CASE\n                                            WHEN c.semester_id LIKE 'Fall%' THEN 'Fall%'\n                                            WHEN c.semester_id LIKE 'Spring%' THEN 'Spring%'\n                                            WHEN c.semester_id LIKE 'Summer%' THEN 'Summer%' \n                                        END\n                                    )\n                                    AND SUBSTRING(cs_history.semester_id FROM '\\d{4}')::int >=\n                                        SUBSTRING(c.semester_id FROM '\\d{4}')::int - 3\n                                    AND cs_history.semester_id < c.semester_id\n                            )\n                            THEN CONCAT('Doesn''t typically teach ', \n                                CASE \n                                    WHEN c.semester_id LIKE 'Fall%' THEN 'Fall'\n                                    WHEN c.semester_id LIKE 'Spring%' THEN 'Spring'\n                                    WHEN c.semester_id LIKE 'Summer%' THEN 'Summer'\n                                END\n                            )\n                            ELSE NULL\n                        END,\n                        'id', p.id::text\n                    )\n                )\n            ) AS professors\n        FROM (\n            SELECT DISTINCT \n                pairs.course_id,\n                c.department,\n                c.number,\n                c.title,\n                cs.hours,\n                cs.site,\n                pairs.semester_id,\n                cs.professor_id\n            FROM course_explorer.courses c\n            JOIN course_explorer.courses_sections cs ON cs.course_id = c.id\n            JOIN (\n                SELECT \n                    unnest($1::text[]) AS course_id,\n                    unnest($2::text[]) AS semester_id\n            ) pairs ON c.id = pairs.course_id\n        ) c\n        JOIN course_explorer.professors p ON p.id = c.professor_id\n        GROUP BY c.semester_id, c.course_id, c.department, c.number, c.title\n    ) courses_with_professors\n    GROUP BY semester_id\n) semesters"};

/**
 * Query generated from SQL:
 * ```
 * SELECT 
 * (
 *     jsonb_object_agg(
 *         semester_id, courses
 *     )
 * ) AS result
 * FROM (
 *     SELECT 
 *         semester_id, 
 *         jsonb_agg(
 *             jsonb_build_object(
 *                 'department', department,
 *                 'number', number,
 *                 'title', title,
 *                 'hours', CASE WHEN hours ~ '^[0-9]+$' THEN hours::int ELSE 0 END,                        
 *                 'professors', professors
 *             )
 *         ) AS courses
 *     FROM (
 *         SELECT 
 *             c.semester_id,
 *             c.department,
 *             c.number,
 *             c.title,
 *             MAX(c.hours) AS hours,
 *             jsonb_agg(
 *                 DISTINCT jsonb_build_object(
 *                     'info', jsonb_build_object(
 *                         'averageGPA', ROUND((
 *                             SELECT AVG(cs.gpa)
 *                             FROM course_explorer.courses_sections cs
 *                             WHERE cs.course_id = c.course_id
 *                             AND cs.professor_id = p.id 
 *                         )::numeric, 2)::text,
 *                         'averageRating', COALESCE(
 *                             ROUND((
 *                                 SELECT SUM(value * frequency) / NULLIF(SUM(frequency), 0)
 *                                 FROM course_explorer.professor_ratings pr
 *                                 WHERE pr.professor_id = p.id
 *                             )::numeric, 1)::text,
 *                             'N/A'
 *                         ),
 *                         'debugId', p.id,
 *                         'debugClass', c.course_id,
 *                         'classRating', COALESCE(
 *                             ROUND((
 *                                 SELECT SUM(value * frequency) / NULLIF(SUM(frequency), 0)
 *                                 FROM course_explorer.professor_ratings pr
 *                                 WHERE (pr.professor_id = p.id AND pr.course_id = c.course_id)
 *                             )::numeric, 1)::text,
 *                             'N/A'
 *                         ),
 *                         'name', p.name,
 *                         'site', c.site,
 *                         'warning', CASE 
 *                             WHEN NOT EXISTS (
 *                                 SELECT 1 
 *                                 FROM course_explorer.courses_sections cs_history
 *                                 WHERE cs_history.professor_id = p.id
 *                                     AND cs_history.course_id = c.course_id
 *                                     AND cs_history.semester_id LIKE (
 *                                         CASE
 *                                             WHEN c.semester_id LIKE 'Fall%' THEN 'Fall%'
 *                                             WHEN c.semester_id LIKE 'Spring%' THEN 'Spring%'
 *                                             WHEN c.semester_id LIKE 'Summer%' THEN 'Summer%' 
 *                                         END
 *                                     )
 *                                     AND SUBSTRING(cs_history.semester_id FROM '\d{4}')::int >=
 *                                         SUBSTRING(c.semester_id FROM '\d{4}')::int - 3
 *                                     AND cs_history.semester_id < c.semester_id
 *                             )
 *                             THEN CONCAT('Doesn''t typically teach ', 
 *                                 CASE 
 *                                     WHEN c.semester_id LIKE 'Fall%' THEN 'Fall'
 *                                     WHEN c.semester_id LIKE 'Spring%' THEN 'Spring'
 *                                     WHEN c.semester_id LIKE 'Summer%' THEN 'Summer'
 *                                 END
 *                             )
 *                             ELSE NULL
 *                         END,
 *                         'id', p.id::text
 *                     )
 *                 )
 *             ) AS professors
 *         FROM (
 *             SELECT DISTINCT 
 *                 pairs.course_id,
 *                 c.department,
 *                 c.number,
 *                 c.title,
 *                 cs.hours,
 *                 cs.site,
 *                 pairs.semester_id,
 *                 cs.professor_id
 *             FROM course_explorer.courses c
 *             JOIN course_explorer.courses_sections cs ON cs.course_id = c.id
 *             JOIN (
 *                 SELECT 
 *                     unnest($1::text[]) AS course_id,
 *                     unnest($2::text[]) AS semester_id
 *             ) pairs ON c.id = pairs.course_id
 *         ) c
 *         JOIN course_explorer.professors p ON p.id = c.professor_id
 *         GROUP BY c.semester_id, c.course_id, c.department, c.number, c.title
 *     ) courses_with_professors
 *     GROUP BY semester_id
 * ) semesters
 * ```
 */
export const bestClasses = new PreparedQuery<IBestClassesParams,IBestClassesResult>(bestClassesIR);


