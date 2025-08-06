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
DROP TABLE CourseExplorer.courses_sections CASCADE;
DROP TABLE CourseExplorer.courses_section_times CASCADE;

CREATE TABLE CourseExplorer.courses( 
    id  TEXT PRIMARY KEY
);

CREATE TABLE CourseExplorer.courses_info(
    id  SERIAL PRIMARY KEY,
    department TEXT, --should this reference department id ? 
    number numeric,
    title TEXT,
    description TEXT,
    averageGPA numeric,
    totalSections numeric,
    totalStudents numeric,
    averageRating numeric,
    totalRatings numeric
);

CREATE TABLE CourseExplorer.courses_professors(
    course_id TEXT REFERENCES CourseExplorer.courses(id),
    professor_id TEXT, -- this will probably be referenced by something later
    PRIMARY KEY (course_id, professor_id)
);

CREATE TABLE CourseExplorer.courses_sections(
    course_id TEXT REFERENCES CourseExplorer.courses(id), -- e.g "AGCJ_404"
    semester_id TEXT, --e.g FALL 2025
    section_id INTEGER, 
    A INTEGER,
    B INTEGER,
    C INTEGER,
    D INTEGER,
    F INTEGER,
    I INTEGER,
    S INTEGER,
    U INTEGER,
    Q INTEGER,
    X INTEGER,
    prof TEXT,
    year INTEGER,
    semester TEXT,
    gpa NUMERIC,
    crn INTEGER,
    hours INTEGER,
    site TEXT,
    professor_id TEXT, --should reference professor_id, maybe make an integer.
    -- check professor_id in the course_id in courses_professors
    -- times_id TEXT,
    -- does this need an ID? 
    PRIMARY KEY(course_id, semester_id, section_id)
);

CREATE TABLE CourseExplorer.courses_section_times(
    course_id TEXT,
    semester_id TEXT, 
    section_id INTEGER, 
    times_id TEXT, -- M - monday, T - tuesday, W - wednesday, R - thursday, F - friday 
    time TEXT,
    FOREIGN KEY (course_id, semester_id, section_id)
        REFERENCES CourseExplorer.courses_sections(course_id, semester_id, section_id),
    PRIMARY KEY(course_id, semester_id, section_id, times_id, time)
);