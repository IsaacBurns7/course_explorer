const fs = require("fs");
const fetch = require("node-fetch");

const YEAR = 25;
const SEMESTER = 'F'; // 1 = Spring, 2 = Summer, 3 = Fall
const AMAZON_TAG = "aggiecourseex-20"; // your affiliate tag

const depts = JSON.parse(fs.readFileSync("./depts.json", "utf8")).data;
const data = JSON.parse(fs.readFileSync("../data_Fall2025.json", "utf8"));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchTextbookInfo(dept, course, section) {
  const base = `https://tamu.bncollege.com/course-material-caching/course`;
  const courseUrl = `${base}?campus=572&term=572_1_${YEAR}_${SEMESTER}&course=572_1_${YEAR}_${SEMESTER}_${dept}_${course}_1&section=${section}&oer=false`;

  console.log(`Fetching ${courseUrl}`);
  try {
    const res = await fetch(courseUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const materials = json?.courseMaterialResponse?.courses?.[0]?.courseMaterialsList || [];
    if (!materials.length) return null;

    // Pick first textbook (you can modify if multiple)
    const book = materials[0];
    const isbn = book?.isbn || book?.isbn13 || book?.isbn10 || "N/A";

    return {
      title: book?.title || "Unknown Title",
      author: book?.author || "Unknown Author",
      edition: book?.edition || "N/A",
      publisher: book?.publisher || "Unknown Publisher",
      isbn,
      required: book?.requiredMaterial || false,
      links: {
        amazon: `https://www.amazon.com/s?k=${isbn}&tag=${AMAZON_TAG}`,
        tamu: `https://tamu.bncollege.com/search?query=${isbn}&utm_source=referral&utm_medium=affiliate&utm_campaign=majesticguy`,
      },
    };
  } catch (err) {
    console.error(`Failed ${dept} ${course} ${section}: ${err.message}`);
    return null;
  }
}

async function main() {
  const FALL_SEMESTER = "Fall 2025";

  for (const courseCode in data) {
    const courseData = data[courseCode];
    const deptName = courseData.info.department; // e.g. "CSCE"

    // find the matching dept entry
    const deptEntry = depts.find(d => d.name === deptName);
    if ((deptName != "ECEN") && (courseData.info.number != 248)) {
      console.warn(`⚠️ Could not find department code for ${deptName}`);
      continue;
    }

    const deptCode = deptEntry.code; // e.g. "572_1_130"

    // iterate through semesters
    for (const semester in courseData.sections) {
      if (semester !== FALL_SEMESTER) continue;

      for (const section of courseData.sections[semester]) {
        const courseNum = courseData.info.number; // e.g. 314
        const sectionNum = section.section; // e.g. 200
        console.log(`Fetching textbook for ${deptName} ${courseNum}-${sectionNum}...`);

        // fetch textbook info using correct dept code
        let code = deptCode.split("_")[2];
        const textbook = await fetchTextbookInfo(code, courseNum, sectionNum);

        if (textbook) {
          // attach to the section
          section.textbook = textbook;
        }

        await delay(800); // polite delay to avoid rate limits
      }
    }
  }
}


main();
