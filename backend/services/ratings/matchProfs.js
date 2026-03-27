// Funciton to merge the ratings data with overall professor data
const profdata = require('../output/profdata-FINAL.json')
const ratings = require('../output/professors-updated-2.json')
const matchings = require('../output/third.json')
const fs = require('fs')

const valuesArray = Object.values(matchings);
const profKeys = Object.keys(profdata)
function normalizeCourseCode(code) {
  return code.replace(/^([A-Z]{4})(\d{3})$/, "$1_$2");
}

function merge(ratings, prof) {
    function mergeRatings(r1 = {}, r2 = {}) {
        const merged = { ...r1 };
        for (const key in r2) {
            merged[key] = (merged[key] || 0) + r2[key];
        }
        return merged;
    }

    function averageRating(avg1, n1, avg2, n2) {
        const total = n1 + n2;
        if (total === 0) return 0;
        return (avg1 * n1 + avg2 * n2) / total;
    }

    let courseFilter = prof.courses.map(x => x.replace("_", ""))
    for (const [rawCourseCode, courseData] of Object.entries(ratings.courses)) {
        const courseCode = normalizeCourseCode(rawCourseCode);
        if (!courseFilter.includes(courseCode.replace("_", ""))) continue;
        if (prof.ratings[courseCode]) {
            const existing = prof.ratings[courseCode];

            const ratings1 = existing.ratings || {};
            const ratings2 = courseData.ratings || {};
            const tags1 = existing.tags || {};
            const tags2 = courseData.tags || {};

            const n1 = Object.values(ratings1).reduce((a, b) => a + b, 0);
            const n2 = Object.values(ratings2).reduce((a, b) => a + b, 0);

            prof.ratings[courseCode].ratings = mergeRatings(ratings1, ratings2);
            prof.ratings[courseCode].tags = mergeRatings(tags1, tags2);
            prof.ratings[courseCode].averageRating = averageRating(
            existing.averageRating || 0,
            n1,
            courseData.averageRating || 0,
            n2
            );
        } else {
            prof.ratings[courseCode] = courseData;
        }
    }
}

for (const key of Object.keys(matchings)) {
    let rating = ratings.filter(x => x.fullName == key)[0]
    let prof = profKeys.filter(x => profdata[x].info.name == matchings[key])[0]
    console.log(rating)
    if (!prof || !rating) continue
    prof = profdata[prof]
    console.log(prof.info)
    if (!prof.info.wouldTakeAgain) {
        console.log("Found for " + prof.info.name)
        prof.info.averageRating = rating.rating
        prof.info.totalRatings = rating.numRatings
        prof.info.wouldTakeAgain = rating.wouldTakeAgainPercent
        prof.info.tags = rating.tags.map(x => x.toUpperCase())
        prof.ratings = {}
        let courseFilter = prof.courses.map(x => x.replace("_", ""))
        for (const rawCourse of Object.keys(rating.courses)) {
            const course = normalizeCourseCode(rawCourse);
            if (!courseFilter.includes(course.replace("_", ""))) continue;
            prof.ratings[course] = rating.courses[rawCourse];
        }
        //if (Object.keys(prof.ratings).length == 0) console.log(prof)
    } else {
        prof.info.averageRating = (rating.rating * rating.numRatings + prof.info.averageRating * prof.info.totalRatings) / (rating.numRatings + prof.info.totalRatings)
        prof.info.totalRatings += rating.numRatings
        prof.info.wouldTakeAgain = (rating.wouldTakeAgainPercent * rating.numRatings + prof.info.wouldTakeAgain * prof.info.totalRatings) / (rating.numRatings + prof.info.totalRatings)
        for (const tag of rating.tags.map(x => x.toUpperCase())) {
            if (!prof.info.tags.includes(tag)) {
            prof.info.tags.push(tag);
        }
        merge(rating, prof)
}
    }
}

fs.writeFileSync('professors-with-ratings.json', JSON.stringify(profdata, null, 2), 'utf-8');



