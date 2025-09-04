/*
const professorSchema = new Schema({
    _id: String,
    info: {
        name: String, 
        averageGPA: Number,
        totalSections: Number,
        totalStudents: Number,
        //yearsTaught: Number,
        averageRating: Number,
        totalRatings: Number,
        wouldTakeAgain: Number,
        tags: [String]    
    },
    courses: [String], //this is courseId,
    ratings: { type: Map,
        of: {
            ratings: Object,
            tags: Object,
            averageRating: Number
        }
    }
});
*/

-- im deciding to put the info object into the original table because it is unique to the object

DROP TABLE course_explorer.professors CASCADE;
DROP TABLE course_explorer.professor_tags CASCADE;
DROP TABLE course_explorer.professor_courses CASCADE;
DROP TABLE course_explorer.professor_ratings CASCADE;

CREATE TABLE course_explorer.professors(
    id SERIAL PRIMARY KEY,
    name TEXT,
    averageGPA NUMERIC,
    totalSections INTEGER,
    totalStudents INTEGER,
    averageRating NUMERIC,
    totalRatings INTEGER,
    wouldTakeAgain NUMERIC,
    rmpLink TEXT
);

CREATE TABLE course_explorer.professor_tags(
    professor_id INTEGER,
    course_id TEXT,
    tag TEXT,
    frequency INTEGER,
    PRIMARY KEY(professor_id, course_id, tag),
    FOREIGN KEY (professor_id) REFERENCES course_explorer.professors(id),
    FOREIGN KEY (course_id) REFERENCES course_explorer.courses(id)
);

CREATE TABLE course_explorer.professor_courses(
    professor_id INTEGER,
    course_id TEXT,
    PRIMARY KEY (professor_id, course_id),
    FOREIGN KEY (professor_id) REFERENCES course_explorer.professors(id),
    FOREIGN KEY (course_id) REFERENCES course_explorer.courses(id)
    -- should course key be a foreign key on courses table?
);


-- could create extra cache table of "averageRating" for each course for each professor to speed up queries
CREATE TABLE course_explorer.professor_ratings(
    professor_id INTEGER REFERENCES course_explorer.professors(id),
    course_id TEXT REFERENCES course_explorer.courses(id),
    value TEXT,
    frequency NUMERIC,
    PRIMARY KEY(professor_id, course_id, value)
);

--courses array
--ratings map

ALTER TABLE course_explorer.professors OWNER TO isaac;
ALTER TABLE course_explorer.professor_tags OWNER TO isaac;
ALTER TABLE course_explorer.professor_courses OWNER TO isaac;
ALTER TABLE course_explorer.professor_ratings OWNER TO isaac;