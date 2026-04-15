const pool = require("../db.js");
const copyFrom = require("pg-copy-streams").from;
const { Readable, pipeline } = require("stream");
const { pipeline: pipelinePromise } = require("stream/promises");
require("dotenv").config({ path: "../.env" });

/**
 * Convert rows → CSV stream
 * Properly handles backpressure and nulls
 */
function createCSVStream(rows) {
  return Readable.from(
    rows.map(row => 
      row.map(v => {
        if (v === null || v === undefined) return "";
        // Escape quotes by doubling them
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(",") + "\n"
    )
  );
}

/**
 * COPY helper using pipeline to handle stream completion correctly
 */
async function copyTable(client, table, columns, rows) {
  if (rows.length === 0) return;

  console.log(`🚀 COPY ${table} (${rows.length} rows)`);

  const pgStream = client.query(
    copyFrom(`COPY ${table} (${columns.join(",")}) FROM STDIN WITH CSV`)
  );

  const readable = createCSVStream(rows);

  // pipelinePromise ensures the stream is fully drained and closed
  await pipelinePromise(readable, pgStream);
}

function dedupeSectionTimes(rows) {
  const seen = new Set();
  return rows.filter(r => {
    const key = `${r[0]}|${r[1]}|${r[2]}|${r[3]}|${r[4]}|${r[5]}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * COPY + MERGE (UPSERT)
 * Uses ON COMMIT DROP to ensure temp tables don't collide on subsequent runs
 */
/**
 * COPY + MERGE (UPSERT)
 * Uses DISTINCT ON to prevent "affect row a second time" errors
 */
async function copyAndMerge(client, tempTable, realTable, columns, rows, conflictCols, updateCols) {
  if (rows.length === 0) return;

  // 1. Drop if exists and create temp table
  await client.query(`DROP TABLE IF EXISTS ${tempTable};`);
  await client.query(`
    CREATE TEMP TABLE ${tempTable} ON COMMIT DROP
    AS SELECT * FROM ${realTable} WHERE false;
  `);

  // 2. COPY into temp
  await copyTable(client, tempTable, columns, rows);

  // 3. Merge into real table using DISTINCT ON to handle duplicates in the temp table
  const conflictStr = conflictCols.join(",");
  const columnsStr = columns.join(",");

  if (tempTable === "tmp_section_times") {
    await client.query(`
      INSERT INTO ${realTable} (${columnsStr})
      SELECT DISTINCT ON (${conflictStr}) ${columnsStr} 
      FROM ${tempTable}
      ON CONFLICT (${conflictStr}) DO NOTHING;
    `);
  } else {
    await client.query(`
      INSERT INTO ${realTable} (${columnsStr})
      SELECT DISTINCT ON (${conflictStr}) ${columnsStr} 
      FROM ${tempTable}
      ORDER BY ${conflictStr} -- ORDER BY is required when using DISTINCT ON
      ON CONFLICT (${conflictStr}) DO UPDATE SET
        ${updateCols.map(col => `${col} = EXCLUDED.${col}`).join(",")}
    `);
  }
}

/**
 * Flatten JSON → rows
 */
function buildAllRows(courseInfo) {
  const courses = [];
  const courseAttrs = [];
  const courseProfs = [];
  const sections = [];
  const sectionTimes = [];
  const sectionAttrs = [];

  for (const [courseId, courseObj] of Object.entries(courseInfo)) {
    const c = courseObj.info;

    courses.push([
      courseId, c.department, c.number, c.title, c.description,
      c.averageGPA, c.totalSections, c.totalStudents,
      c.averageRating, c.totalRatings
    ]);

    for (const attr of c.attributes || []) {
      courseAttrs.push([courseId, attr]);
    }

    for (const profId of courseObj.professors || []) {
      courseProfs.push([courseId, profId]);
    }

    for (const [semesterKey, secs] of Object.entries(courseObj.sections || {})) {
      // Note: Removed the "Spring 2026" filter so Fall 2026 data actually processes
      const parts = semesterKey.split("_");
      const term = parts[0] || semesterKey;
      const year = parts[1] || null;

      for (const sec of secs) {
        if (sec.section == null || isNaN(sec.section)) continue;

        sections.push([
          courseId, semesterKey, sec.section,
          sec.A, sec.B, sec.C, sec.D, sec.F,
          sec.I, sec.S, sec.U, sec.Q, sec.X,
          sec.prof, year, term, sec.gpa,
          sec.crn, sec.hours, sec.site, sec.prof_id
        ]);

        if (sec.times) {
          for (const [day, times] of Object.entries(sec.times)) {
            for (let i = 0; i < times.length; i += 2) {
              if (times[i] === undefined || times[i + 1] === undefined) continue;
              if (!times[i] || !times[i + 1]) continue;
              sectionTimes.push([
                courseId, semesterKey, sec.section,
                day, times[i], times[i + 1]
              ]);
            }
          }
        }

        for (const attr of sec.attributes || []) {
          sectionAttrs.push([courseId, semesterKey, sec.section, attr]);
        }
      }
    }
  }

  return {
    courses,
    courseAttrs,
    courseProfs,
    sections,
    sectionTimes: dedupeSectionTimes(sectionTimes),
    sectionAttrs
  };
}

async function removeStaleData(client, courseInfo) {
  const sections = [];
  for (const [courseId, courseObj] of Object.entries(courseInfo)) {
    for (const [semesterKey, secs] of Object.entries(courseObj.sections || {})) {
      for (const sec of secs) {
        if (sec.section == null || isNaN(sec.section)) continue;
        sections.push({ course_id: courseId, semester_id: semesterKey, section_id: sec.section });
      }
    }
  }

  if (sections.length === 0) return;
  console.log("🧹 Removing stale data...");

  const jsonSections = JSON.stringify(sections);

  await client.query(`
    DELETE FROM course_explorer.courses_section_times t
    WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_to_recordset($1::jsonb)
      AS x(course_id text, semester_id text, section_id int)
      WHERE x.course_id = t.course_id
        AND x.semester_id = t.semester_id
        AND x.section_id = t.section_id
    );
  `, [jsonSections]);

  await client.query(`
    DELETE FROM course_explorer.courses_sections cs
    WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_to_recordset($1::jsonb)
      AS x(course_id text, semester_id text, section_id int)
      WHERE x.course_id = cs.course_id
        AND x.semester_id = cs.semester_id
        AND x.section_id = cs.section_id
    );
  `, [jsonSections]);
}

/**
 * MAIN
 */
async function runAllQueries(courseInfo) {
  const client = await pool.connect();

  try {
    console.log("DB connected");
    await client.query("BEGIN");

    const {
      courses,
      courseAttrs,
      courseProfs,
      sections,
      sectionTimes,
      sectionAttrs
    } = buildAllRows(courseInfo);

    await removeStaleData(client, courseInfo);

    // ---------------------------
    // COPY + MERGE ALL TABLES
    // ---------------------------

    await copyAndMerge(client, "tmp_courses", "course_explorer.courses",
      ["id","department","number","title","description","averagegpa","totalsections","totalstudents","averagerating","totalratings"],
      courses, ["id"], ["department","number","title","description","averagegpa","totalsections","totalstudents","averagerating","totalratings"]
    );

    await copyAndMerge(client, "tmp_course_attrs", "course_explorer.courses_attributes",
      ["course_id","attribute"], courseAttrs, ["course_id","attribute"], ["attribute"]
    );

    await copyAndMerge(client, "tmp_course_profs", "course_explorer.courses_professors",
      ["course_id","professor_id"], courseProfs, ["course_id","professor_id"], ["professor_id"]
    );

    await copyAndMerge(client, "tmp_sections", "course_explorer.courses_sections",
      ["course_id","semester_id","section_id","a","b","c","d","f","i","s","u","q","x","prof","year","semester","gpa","crn","hours","site","professor_id"],
      sections, ["course_id","semester_id","section_id"], ["a","b","c","d","f","i","s","u","q","x","prof","year","semester","gpa","crn","hours","site","professor_id"]
    );

    await copyAndMerge(client, "tmp_section_times", "course_explorer.courses_section_times",
      ["course_id","semester_id","section_id","day","start_time","end_time"],
      sectionTimes, ["course_id","semester_id","section_id","day","start_time"], ["end_time"]
    );

    await copyAndMerge(client, "tmp_section_attrs", "course_explorer.courses_section_attributes",
      ["course_id","semester_id","section_id","attribute"], sectionAttrs, ["course_id","semester_id","section_id","attribute"], ["attribute"]
    );

    await client.query("COMMIT");
    console.log("✅ FULL SYNC COMPLETE 🚀");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error during sync:", err);
  } finally {
    client.release();
  }
}

// Execution
//const data = require("./data_Fall2026.json");
//runAllQueries(data);

module.exports = { runAllQueries };