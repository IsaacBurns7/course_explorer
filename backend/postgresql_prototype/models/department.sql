DROP TABLE CourseExplorer.departments CASCADE; 
DROP TABLE CourseExplorer.department_courses CASCADE;
CREATE TABLE CourseExplorer.departments(
    id VARCHAR(255) PRIMARY KEY, -- e.g "AGEC"
    name VARCHAR(255) -- e.g "Agricultural Economics"
);

-- CREATE TABLE department_info(
--     id SERIAL PRIMARY KEY,
--     department_id INTEGER REFERENCES departments(id)
-- );

CREATE TABLE CourseExplorer.department_courses( --this may not be necessary b/c we could just directly link courses
    id SERIAL PRIMARY KEY,
    department_id VARCHAR(255) REFERENCES CourseExplorer.departments(id),
    course_number INTEGER,
    title VARCHAR(255),
    description TEXT, --very long 
    -- courseId INTEGER --REFERENCES courses(id) --probably not needed
    UNIQUE(department_id, course_number)
);

