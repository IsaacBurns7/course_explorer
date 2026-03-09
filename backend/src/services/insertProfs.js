const fs = require('fs')
const readline = require('readline')
const {Pool} = require('pg') // assume this exports a configured pg Pool
require('dotenv').config({path: "../.env"})

const pool = new Pool({
        connectionString: process.env.NEON_DB_URL,
        ssl: process.env.NEON_DB_URL && process.env.NEON_DB_URL.includes('neon.tech') ? {
            require: true,
            rejectUnauthorized: false
        } : false,
        // Add connection pool settings
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    // Handle pool errors to prevent application crashes
    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err);
        // Don't exit the process, just log the error
    });

    pool.connect()
        .then(() => {
        console.log("Global setup: DB Connection established successfully.");
        })
        .catch((err) => {
        console.error('Connection error', err);
        // Don't exit the process, allow retry on next request
        });

async function importProfessors() {

  const fileStream = fs.createReadStream("./prof.json");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    lineCount++;

    const prof = JSON.parse(line);
    const id = parseInt(prof._id);
    const info = prof.info || {};
    const courses = prof.courses || [];
    const ratings = prof.ratings || {};

    // --- 1️⃣ Insert professor record ---
    await pool.query(
      `
      INSERT INTO course_explorer.professors
      (id, name, averageGPA, totalSections, totalStudents,
       averageRating, totalRatings, wouldTakeAgain, difficulty, rmpLink)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        averageGPA = EXCLUDED.averageGPA,
        totalSections = EXCLUDED.totalSections,
        totalStudents = EXCLUDED.totalStudents,
        averageRating = EXCLUDED.averageRating,
        totalRatings = EXCLUDED.totalRatings,
        wouldTakeAgain = EXCLUDED.wouldTakeAgain,
        difficulty = EXCLUDED.difficulty,
        rmpLink = EXCLUDED.rmpLink;
      `,
      [
        id,
        info.name,
        info.averageGPA,
        info.totalSections,
        info.totalStudents,
        info.averageRating,
        info.totalRatings,
        info.wouldTakeAgain,
        info.difficulty,
        info.rmpLink,
      ]
    );

    // --- 2️⃣ Insert professor_courses ---
    for (const courseId of courses) {
      await pool.query(
        `
        INSERT INTO course_explorer.professor_courses (professor_id, course_id)
        VALUES ($1, $2)
        ON CONFLICT (professor_id, course_id) DO NOTHING;
        `,
        [id, courseId]
      );
    }

    // --- 3️⃣ Insert professor_ratings and professor_tags ---
    for (const [courseId, courseData] of Object.entries(ratings)) {
      const ratingValues = courseData.ratings || {};
      const tagValues = courseData.tags || {};

      // Ratings per value (e.g. {"5": 2, "4": 10, "3": 3})
      for (const [ratingValue, frequency] of Object.entries(ratingValues)) {
        await pool.query(
          `
          INSERT INTO course_explorer.professor_ratings
            (professor_id, course_id, value, frequency)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (professor_id, course_id, value) DO UPDATE SET
            frequency = EXCLUDED.frequency;

          `,
          [id, courseId, parseFloat(ratingValue), frequency]
        );
      }

      // Tags per course (e.g. {"TOUGH GRADER": 2, "CARING": 4})
      for (const [tag, freq] of Object.entries(tagValues)) {
        await pool.query(
          `
          INSERT INTO course_explorer.professor_tags
  (professor_id, course_id, tag, frequency)
VALUES ($1, $2, $3, $4)
ON CONFLICT (professor_id, course_id, tag) DO UPDATE SET
  frequency = EXCLUDED.frequency;

          `,
          [id, courseId, tag, freq]
        );
      }
    }

    if (lineCount % 50 === 0) {
      console.log(`Inserted ${lineCount} professors...`);
    }
  }

  console.log(`✅ Done. Imported ${lineCount} professors total.`);
  await pool.end();
}

importProfessors().catch((err) => {
  console.error("❌ Error importing data:", err);
  pool.end();
});
