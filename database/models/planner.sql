CREATE TABLE course_explorer.degree_prereqs(
    course_id TEXT PRIMARY KEY,
    prereqs JSONB
);

ALTER TABLE course_explorer.degree_prereqs OWNER TO isaac;