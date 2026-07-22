/*
Degree program requirements + the university-wide core curriculum.

Both tables are reference data scraped from the TAMU CourseLeaf catalog
(degree_program_reqs/scrape_programs.py and scrape_core_curriculum.py) and loaded by
database/migration_tools/seedProgramRequirements.js. They are read-whole and served
whole, so the scraped structures are kept intact in JSONB rather than normalized.

program_requirements.requirements is the array of requirement objects:
    [{ "course": "CSCE 120", "alternatives": [], "footnotes": ["1"] }, ...]
  - `course` is the primary; `alternatives` are interchangeable (inline "A or B" and
    "Select one of the following:" groups both collapse to primary + alternatives).
  - A cross-listed course stays one token, e.g. "ENGR 216/PHYS 216".
  - A `course` that is not a course code (e.g. "Science elective") is an elective slot:
    informational only, resolved by the student against `footnotes`.
  - University Core Curriculum rows are intentionally absent — core is tracked by the
    core_curriculum table and satisfied by classifying the student's planned courses.

core_curriculum.data is that category's array of areas:
    [{ "name": "Mathematics", "hours_required": 6, "courses": [{code, cross_listed, ...}] }]
*/

CREATE TABLE IF NOT EXISTS course_explorer.program_requirements (
    program_id    TEXT PRIMARY KEY,               -- slug of desc_name, e.g. 'bachelor-of-science-in-computer-science'
    desc_name     TEXT NOT NULL,                  -- 'Bachelor of Science in Computer Science'
    kind          TEXT NOT NULL CHECK (kind IN ('major', 'minor')),
    url           TEXT,                           -- source catalog page
    requirements  JSONB NOT NULL DEFAULT '[]'::jsonb,
    footnotes     JSONB NOT NULL DEFAULT '{}'::jsonb,
    intro         JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- The program pick-lists are always filtered by kind, and there are ~800 rows.
CREATE INDEX IF NOT EXISTS program_requirements_kind_idx
    ON course_explorer.program_requirements (kind);

CREATE TABLE IF NOT EXISTS course_explorer.core_curriculum (
    category      TEXT PRIMARY KEY,               -- 'university_core_curriculum' | 'international_cultural_diversity' | 'cultural_discourse'
    name          TEXT NOT NULL,
    url           TEXT,
    data          JSONB NOT NULL DEFAULT '[]'::jsonb,   -- the areas array
    footnotes     JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Credit-by-examination equivalency (AP / IB / SAT II / DANTES), scraped from
-- testing.tamu.edu by degree_program_reqs/scrape_credit_equivalency.py. One row per
-- method; `exams` is that method's array of {exam, tiers:[{score, courses, hours, ...}]}.
CREATE TABLE IF NOT EXISTS course_explorer.credit_equivalency (
    method        TEXT PRIMARY KEY,               -- 'ap' | 'ib' | 'sat_ii' | 'dantes'
    name          TEXT NOT NULL,
    exams         JSONB NOT NULL DEFAULT '[]'::jsonb
);
