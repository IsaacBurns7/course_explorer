/*
const departmentSchema = new Schema(
{
    _id: String, -> "CSCE" - computer science / computer engineering
    info: {
        name: String
    },
    courses: [
        {
            courseNumber: Number,
            courseTitle: String,
            courseDescription: String,
            courseId: String  
        }
    ]
    courses -> guaranteed(this is very important) -> department_id, course_number are unique 
}
(FAKEDEPT 120)
);
*/

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

-- obj1.courses.[<courses_number>]
-- FIND ME a department_courses entry WHERE dept_id = obj1 AND courses_number = <courses_number>
-- THE REASON THIS IS BETTER!!! -> BECAUSE it effectively deletes nesting. 
-- courses.obj1 
-- courses and obj1 OR I CAN SAY obj1 and courses