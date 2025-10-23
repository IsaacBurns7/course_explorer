const courseInfo = require('./data_Spring2026.json');
const { Pool} = require('pg');
require('dotenv').config({path: '../.env'});
/**
 * Generate all SQL insert statements for a single course
 */
function generateCourseSQL(courseId, courseObj) {
  const sqlStatements = [];

  // ---------------------------
  // 1. Courses Table
  // ---------------------------
  const c = courseObj.info;
  
  sqlStatements.push({
    table: "course_explorer.courses",
    text: `INSERT INTO course_explorer.courses 
      (id, department, number, title, description, averagegpa, totalsections, totalstudents, averagerating, totalratings)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (id) DO UPDATE SET
        department = EXCLUDED.department,
        number = EXCLUDED.number,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        averagegpa = EXCLUDED.averagegpa,
        totalsections = EXCLUDED.totalsections,
        totalstudents = EXCLUDED.totalstudents,
        averagerating = EXCLUDED.averagerating,
        totalratings = EXCLUDED.totalratings;`,
    values: [courseId, c.department, c.number, c.title, c.description, c.averageGPA, c.totalSections, c.totalStudents, c.averageRating, c.totalRatings]
  });

  // ---------------------------
  // 2. Course Attributes
  // ---------------------------
  /*
  for (const attr of c.attributes || []) {
    sqlStatements.push({
      table: "course_explorer.courses_attributes",
      text: `INSERT INTO course_explorer.courses_attributes (course_id, attribute)
             VALUES ($1,$2)
             ON CONFLICT (course_id, attribute) DO UPDATE SET
               attribute = EXCLUDED.attribute;`,
      values: [courseId, attr]
    });
  }
  */
  // ---------------------------
  // 3. Professors
  // ---------------------------
  for (const profId of courseObj.professors) {
    sqlStatements.push({
      table: "course_explorer.courses_professors",
      text: `INSERT INTO course_explorer.courses_professors (course_id, professor_id)
             VALUES ($1,$2)
             ON CONFLICT (course_id, professor_id) DO UPDATE SET
               professor_id = EXCLUDED.professor_id;`,
      values: [courseId, profId]
    });
  }

  // ---------------------------
  // 4. Sections & related tables
  // ---------------------------
  for (const [semesterKey, sections] of Object.entries(courseObj.sections)) {
    for (const sec of sections) {
      const semId = `${semesterKey}`;
      if (semId != "Spring 2026") continue;
      if (semId == `undefined undefined`) {
        console.log("UNDEFINED UNDEFINED FOUND!")
        process.exit(0)
      }
      if (sec.section == null) continue;

      let year = semesterKey.split("_")[1];
      let term = semesterKey.split("_")[0];
      // Sections table
      sqlStatements.push({
        table: "course_explorer.courses_sections",
        text: `INSERT INTO course_explorer.courses_sections
          (course_id, semester_id, section_id, a, b, c, d, f, i, s, u, q, x, prof, year, semester, gpa, crn, hours, site, professor_id)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, $18, $19, $20, $21)
          ON CONFLICT (course_id, semester_id, section_id) DO UPDATE SET
            a = EXCLUDED.a,
            b = EXCLUDED.b,
            c = EXCLUDED.c,
            d = EXCLUDED.d,
            f = EXCLUDED.f,
            i = EXCLUDED.i,
            s = EXCLUDED.s,
            u = EXCLUDED.u,
            q = EXCLUDED.q,
            x = EXCLUDED.x,
            prof = EXCLUDED.prof,
            year = EXCLUDED.year,
            semester = EXCLUDED.semester,
            gpa = EXCLUDED.gpa,
            crn = EXCLUDED.crn,
            hours = EXCLUDED.hours,
            site = EXCLUDED.site,
            professor_id = EXCLUDED.professor_id;`,
        values: [
          courseId, semId, sec.section,
          sec.A || null, sec.B || null, sec.C || null,
          sec.D || null, sec.F || null, sec.I || null,
          sec.S || null, sec.U || null, sec.Q || null, sec.X || null,
          sec.prof || null,  year || null, term || null, null, sec.crn || null, sec.hours || null, sec.site || null,
          sec.prof_id || null
        ]
      });

     
      // Section Times
      if (sec.times) {
        for (const [day, [start, end]] of Object.entries(sec.times)) {
          sqlStatements.push({
            table: "course_explorer.courses_section_times",
            text: `INSERT INTO course_explorer.courses_section_times (course_id, semester_id, section_id, day, start_time, end_time)
                   VALUES ($1,$2,$3,$4,$5,$6)
                   ON CONFLICT (course_id, semester_id, section_id, day) DO UPDATE SET
                     start_time = EXCLUDED.start_time,
                     end_time = EXCLUDED.end_time;`,
            values: [courseId, semId, sec.section, day, start, end]
          });
        }
      }

      // Section Attributes
      for (const attr of sec.attributes || []) {
        sqlStatements.push({
          table: "course_explorer.courses_section_attributes",
          text: `INSERT INTO course_explorer.courses_section_attributes (course_id, semester_id, section_id, attribute)
                 VALUES ($1,$2,$3,$4)
                 ON CONFLICT (course_id, semester_id, section_id, attribute) DO UPDATE SET
                   attribute = EXCLUDED.attribute;`,
          values: [courseId, semId, sec.section, attr]
        });
      }
      
    }
  }

  return sqlStatements;
}

const allSQLStatements = [];

for (const [courseId, courseObj] of Object.entries(courseInfo)) {
  const statements = generateCourseSQL(courseId, courseObj);
  allSQLStatements.push(...statements);
}

console.log(`Generated ${allSQLStatements.length} SQL statements.`);

(async () => {
  const pool = new Pool({
       connectionString: process.env.NEON_DB_URL,
       ssl: {
           require: true
       }
  });
  

  try {
    await pool.connect();
    console.log("DB Connection established successfully.");

    let count = 1;
    for (const stmt of allSQLStatements) {
      process.stdout.write(`\r(${count}/${allSQLStatements.length}) Inserting into ${stmt.table}...`);
      count++;
      await pool.query(stmt.text, stmt.values);
    }
    console.log("✅ All inserts completed!");
  } catch (err) {
    console.error("❌ Error inserting:", err);
  } finally {

  }
})();
