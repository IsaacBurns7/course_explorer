CREATE TABLE departments(
    id VARCHAR(255) PRIMARY KEY -- e.g "AGEC"
    name VARCHAR(255) -- e.g "Agricultural Economics"
);

-- CREATE TABLE department_info(
--     id SERIAL PRIMARY KEY,
--     department_id INTEGER REFERENCES departments(id)
-- );

CREATE TABLE department_courses( --this may not be necessary b/c we could just directly link courses
    id SERIAL PRIMARY KEY,
    department_id INTEGER REFERENCES departments(id),
    course_number INTEGER,
    title VARCHAR(255),
    description VARCHAR(255),
    -- courseId INTEGER --REFERENCES courses(id) --probably not needed
    UNIQUE(department_name, course_number);
);