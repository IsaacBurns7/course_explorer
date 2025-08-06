DROP TABLE CourseExplorer.departments CASCADE; 
DROP TABLE CourseExplorer.department_courses CASCADE;
CREATE TABLE CourseExplorer.departments(
    id TEXT PRIMARY KEY, -- e.g "AGEC"
    name TEXT -- e.g "Agricultural Economics"
);

-- CREATE TABLE department_info(
--     id SERIAL PRIMARY KEY,
--     department_id INTEGER REFERENCES departments(id)
-- );

CREATE TABLE CourseExplorer.department_courses( --this may not be necessary b/c we could just directly link courses
    id SERIAL PRIMARY KEY,
    department_id TEXT REFERENCES CourseExplorer.departments(id),
    course_number INTEGER,
    title TEXT,
    description TEXT, --very long 
    -- courseId INTEGER --REFERENCES courses(id) --probably not needed
    UNIQUE(department_id, course_number)
);

