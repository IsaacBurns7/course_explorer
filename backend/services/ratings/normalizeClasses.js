// Helper function after everything else is called, normalizes classes so that classes can have fixed and consistent class tags 
// (ex: Nutr302 -> NUTR302, PSYC101 -> PBSI101)

const fs = require('fs');

// Load professors JSON
const professors = JSON.parse(fs.readFileSync('../output/professors-enriched-5.json', 'utf-8'));
// Load OLD-NEW course map from txt
const mapping = fs.readFileSync('fixed.txt', 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)
  .map(line => {
    const [oldCourse, newCourse] = line.split('-').map(str => str.trim().toUpperCase());
    return { oldCourse, newCourse };
  });

// Helper function to merge two ratings objects
function mergeRatings(r1 = {}, r2 = {}) {
  const result = { ...r1 };
  for (const key in r2) {
    result[key] = (result[key] || 0) + r2[key];
  }
  return result;
}

// Helper to compute new average
function averageRating(r1, c1, r2, c2) {
  return ((r1 * c1) + (r2 * c2)) / (c1 + c2);
}



// Update professors
for (const prof of professors) {
  const courses = prof.courses;
  if (prof.lastName == "Shell") console.log(prof)
  if (!courses) continue;
  prof.fullName = `${prof.firstName} ${prof.lastName}`;
  const newCourses = { ...courses };

  // Handle PSYC → PBSI
  for (const courseCode of Object.keys(courses)) {
    let newCode = courseCode.replace(/^PSYC/, 'PBSI').replace(/^([A-Z]{4})H(\d{3})$/, "$1$2").toUpperCase();
    if (newCode !== courseCode) {
      if (newCourses[newCode]) {
        // Merge with existing PBSI course
        newCourses[newCode].ratings = mergeRatings(newCourses[newCode].ratings, courses[courseCode].ratings);
        newCourses[newCode].tags = mergeRatings(newCourses[newCode].tags, courses[courseCode].tags);

        const oldCount = Object.values(courses[courseCode].ratings || {}).reduce((a, b) => a + b, 0);
        const newCount = Object.values(newCourses[newCode].ratings || {}).reduce((a, b) => a + b, 0);

        newCourses[newCode].averageRating = averageRating(
          newCourses[newCode].averageRating || 0, newCount,
          courses[courseCode].averageRating || 0, oldCount
        );
      } else {
        // Rename to PBSI
        newCourses[newCode] = courses[courseCode];
      }

      delete newCourses[courseCode];
    }
  }

  // Handle OLD → NEW replacements
  for (const { oldCourse, newCourse } of mapping) {
    if (!newCourses[oldCourse]) continue;

    const oldData = newCourses[oldCourse];
    const existing = newCourses[newCourse];

    if (existing) {
      existing.ratings = mergeRatings(existing.ratings, oldData.ratings);
      existing.tags = mergeRatings(existing.tags, oldData.tags);

      const oldCount = Object.values(oldData.ratings || {}).reduce((a, b) => a + b, 0);
      const newCount = Object.values(existing.ratings || {}).reduce((a, b) => a + b, 0);

      existing.averageRating = averageRating(
        existing.averageRating || 0, newCount,
        oldData.averageRating || 0, oldCount
      );
    } else {
      newCourses[newCourse] = oldData;
    }

    delete newCourses[oldCourse];
  }

  prof.courses = newCourses;
}
// Write updated file
fs.writeFileSync('professors-updated.json', JSON.stringify(professors, null, 2), 'utf-8');

console.log('✅ Professors file updated.');