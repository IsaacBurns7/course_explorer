const data = require("./coursedata_FINAL.json")
const professors = {}

for (const key of Object.keys(data)) {
    for (const sem of Object.keys(data[key].sections)) {
        for (const sectKey of Object.keys(data[key].sections[sem])) {
            const section = data[key].sections[sem][sectKey]
            if (!section.prof_id) continue
            if (!professors[section.prof_id]) {
                professors[section.prof_id] = {
                    info: {
                        name: section.prof,
                        averageGPA: section.gpa,
                        totalSections: 1,
                        totalStudents: section.students,
                        averageRating: 0,
                        totalRatings: 0
                    },
                    courses: [key]
                }
            } else {
                professors[section.prof_id].info.averageGPA += section.gpa
                professors[section.prof_id].info.totalSections++
                professors[section.prof_id].info.totalStudents += section.students
                if (professors[section.prof_id].courses.includes(key)) professors[section.prof_id].courses.push(key)
            }
        }
    }
}

for (const prof of Object.keys(professors)) {
    professors[prof].info.averageGPA = parseFloat((professors[prof].info.averageGPA / professors[prof].info.totalSections).toFixed(3))
} 
