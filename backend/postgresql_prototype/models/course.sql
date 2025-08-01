-- const courseSchema = new Schema({
--     _id: String,
--     info: {
--         department: String,
--         number: Number,
--         title: String,
--         description: String,
--         averageGPA: Number,
--         totalSections: Number,
--         totalStudents: Number,
--         averageRating: Number,
--         totalRatings: Number,
--     },
--     professors: [String], //professorId
--     sections: { //key is semester
--         type: Map,
--         of: [{
--             section: Number,
--             A: Number,
--             B: Number,
--             C: Number,
--             D: Number,
--             F: Number,
--             I: Number,
--             S: Number,
--             U: Number,
--             Q: Number,
--             X: Number,
--             prof: String,
--             year: Number,
--             semester: String,
--             gpa: Number,
--             crn: String,
--             hours: String,
--             site: String,
--             times: Object,
--             prof_id: String,
--             students: Number
--         }]
--     }
-- });

DROP TABLE CourseExplorer.courses CASCADE;
DROP TABLE CourseExplorer.courses_info CASCADE;
DROP TABLE CourseExplorer.courses_professors CASCADE;

CREATE TABLE CourseExplorer.courses( 
    id  VARCHAR(255) PRIMARY KEY
);

CREATE TABLE CourseExplorer.courses_info(
    id  SERIAL PRIMARY KEY,
    department VARCHAR(255), --should this reference department id ? 
    number numeric,
    title VARCHAR(255),
    description TEXT,
    averageGPA numeric,
    totalSections numeric,
    totalStudents numeric,
    averageRating numeric,
    totalRatings numeric
);

CREATE TABLE CourseExplorer.courses_professors(
    id VARCHAR(255) REFERENCES CourseExplorer.courses(id),
    professor_id VARCHAR(255), -- this will probably be referenced by something later
    PRIMARY KEY (id, professor_id)
)