SELECT 
    p.id AS professorid,
    json_build_object(
        'info', json_build_object(
            'tags', JSON_AGG(pt.tag),
            'name', p.name,
            'averageGPA', p.averageGPA,
            'difficulty', p.difficulty,
            'totalSections', p.totalSections,
            'totalStudents', p.totalStudents,
            'wouldTakeAgain', p.wouldTakeAgain,
            'totalRatings', SUM(pr.frequency),
            'averageRating', SUM(pr.value * pr.frequency) * 1.0 / NULLIF(SUM(pr.frequency), 0),
            'rmpLink', p.rmpLink
        ),
        'courses', (
            SELECT JSON_AGG(course_id) 
            FROM course_explorer.courses_professors cp 
            WHERE cp.professor_id = p.id
        ),
        'ratings', '{}'::jsonb
    ) AS professor_data
FROM course_explorer.professor_courses AS pc
JOIN course_explorer.professors AS p ON pc.professor_id = p.id 
LEFT JOIN course_explorer.professor_ratings AS pr ON pr.professor_id = p.id AND pr.course_id = $1
LEFT JOIN course_explorer.professor_tags AS pt ON pt.professor_id = p.id AND pt.course_id = $1
WHERE pc.course_id = $1
GROUP BY pc.course_id, p.id; 