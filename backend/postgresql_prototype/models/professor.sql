-- im deciding to put the info object into the original table because it is unique to the object
CREATE TABLE CourseExplorer.professors(
    id SERIAL PRIMARY KEY,
    name TEXT,
    averageGPA NUMERIC,
    totalSections INTEGER,
    totalStudents INTEGER,
    averageRating NUMERIC,
    totalRatings INTEGER,
    wouldTakeAgain INTEGER,
);

CREATE TABLE CourseExplorer.professor_tags(
    professor_id INTEGER,
    tag TEXT
    FOREIGN KEY (professor_id) REFERENCES CourseExplorer.professors(id)
);

--courses array
--ratings map