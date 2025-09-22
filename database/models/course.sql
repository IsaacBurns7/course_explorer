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

DROP TABLE course_explorer.courses CASCADE;
-- DROP TABLE course_explorer.courses_info CASCADE;
DROP TABLE course_explorer.courses_professors CASCADE;
DROP TABLE course_explorer.courses_sections CASCADE;
DROP TABLE course_explorer.courses_section_times CASCADE;
DROP TABLE course_explorer.courses_section_info CASCADE;

CREATE TABLE course_explorer.courses(
    id TEXT PRIMARY KEY,
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

CREATE TABLE course_explorer.courses_professors(
    course_id TEXT REFERENCES course_explorer.courses(id),
    professor_id INTEGER, -- this will probably be referenced by something later
    PRIMARY KEY (course_id, professor_id)
);

CREATE TABLE course_explorer.courses_sections(
    course_id TEXT REFERENCES course_explorer.courses(id), -- e.g "AGCJ_404"
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
    hours TEXT,
    site TEXT,
    professor_id INTEGER, -- REFERENCES course_explorer.courses_professors(professor_id),
    -- check professor_id in the course_id in courses_professors
    -- times_id TEXT,
    -- does this need an ID? 
    PRIMARY KEY(course_id, semester_id, section_id)
);

-- can find all times given course and semester using the section_id. 
CREATE TABLE course_explorer.courses_section_times(
    course_id TEXT,
    semester_id TEXT, 
    section_id INTEGER, 
    day TEXT, -- M - monday, T - tuesday, W - wednesday, R - thursday, F - friday 
    start_time TEXT, -- "12:30 PM",
    end_time TEXT,
    
    FOREIGN KEY (course_id, semester_id, section_id)
        REFERENCES course_explorer.courses_sections(course_id, semester_id, section_id),
    PRIMARY KEY(course_id, semester_id, section_id, day)
);

CREATE TABLE course_explorer.courses_section_info(
    SWV_CLASS_SEARCH_TERM TEXT,
    SWV_CLASS_SEARCH_CRN TEXT PRIMARY KEY,
    SWV_CLASS_SEARCH_TITLE TEXT,
    SWV_CLASS_SEARCH_SUBJECT TEXT,
    SWV_CLASS_SEARCH_SUBJECT_DESC TEXT,
    SWV_CLASS_SEARCH_COURSE TEXT,
    SWV_CLASS_SEARCH_SECTION TEXT,
    SWV_CLASS_SEARCH_SSBSECT_HOURS NUMERIC,
    SWV_CLASS_SEARCH_HOURS_LOW NUMERIC,
    SWV_CLASS_SEARCH_HOURS_IND TEXT,
    SWV_CLASS_SEARCH_HOURS_HIGH NUMERIC,
    SWV_CLASS_SEARCH_SITE TEXT,
    SWV_CLASS_SEARCH_PTRM TEXT,
    SWV_CLASS_SEARCH_HAS_SYL_IND CHAR(1),
    STUSEAT_OPEN CHAR(1),
    SWV_CLASS_SEARCH_MAX_ENRL TEXT,
    SWV_CLASS_SEARCH_ENRL TEXT,
    SWV_CLASS_SEARCH_SEATS_AVAIL TEXT,
    SWV_WAIT_CAPACITY TEXT,
    SWV_WAIT_COUNT TEXT,
    SWV_WAIT_AVAIL TEXT,
    SWV_CLASS_SEARCH_SCHD TEXT,
    SWV_CLASS_SEARCH_INST_TYPE TEXT,
    SWV_CLASS_SEARCH_INSTRCTR_JSON JSONB,
    SWV_CLASS_SEARCH_JSON_CLOB JSONB,
    SWV_CLASS_SEARCH_ATTRIBUTES TEXT,
    SWV_CLASS_SEARCH_SESSION TEXT,
    HRS_COLUMN_FIELD NUMERIC
);


ALTER TABLE course_explorer.courses OWNER TO isaac;
ALTER TABLE course_explorer.courses_professors OWNER TO isaac;
ALTER TABLE course_explorer.courses_sections OWNER TO isaac;
ALTER TABLE course_explorer.courses_section_times OWNER TO isaac;
ALTER TABLE course_explorer.courses_section_info OWNER TO isaac;
-- ALTER TABLE course_explorer.courses_info OWNER ISAAC;