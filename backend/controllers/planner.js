const {parseDegreePlanPDF, parseDegreePlanText} = require('../services/parseData');
const Course = require('../models/course');
const Professor = require('../models/professor');

/*
NOTES 9/26/2025
  a lot of these functions are NOT related to controllers. 
  They are data handling functions. not inherently wrong, but ensure they are tightly coupled, and if overlap arises between 
  other controllers, add to services.

*/

const getSiteByProfessor = (course, professorName) => {
  for (const [semester, sections] of course.sections) {
    for (const section of sections) {
      if (section.prof === professorName && section.site != "") {
        return section.site;
      }
    }
  }
  return null; // If no matching section is found
};

const profTeachesSemester = (semester, prof, course) => {
  if (prof == null || course == null) return null;

  const type = semester.split(" ")[0]; // "Fall" or "Spring"
  const findSem = [...course.sections.keys()].filter((x) => x.startsWith(type));
  if (findSem.length === 0) return "Course rarely taught this term";

  let latest = 0;
  let found = false;

  for (const sem of findSem) {
    const year = Number.parseInt(sem.split(" ")[1]);
    if (year > latest) latest = year;

    const sections = course.sections.get(sem);
    const profFound = sections.filter((x) => x.prof === prof.info.name);

    if (profFound.length > 0) {
      found = true;
    }
  }

  if (latest <= new Date().getFullYear() - 2) return `Hasn't taught in 2+ years`;
  if (found) return null;

  return `Doesn't typically teach ${type}`;
};

const getProfCodes = (courses) => {
  const allProfessors = new Set();

  for (const course of courses) {
    if (Array.isArray(course.professors)) {
      for (const profId of course.professors) {
        allProfessors.add(profId);
      }
    }
  }

  return [...allProfessors];
}

const getBestClassesPDF = async(req, res) => {
  const parsed = await parseDegreePlanPDF(req.body);
  if (parsed.error) return res.status(500).json(parsed);
  return getBestClasses(parsed, req, res)
}

const getBestClassesText = async(req, res) => {
  const parsed = await parseDegreePlanText(req.body.content);
  if (parsed.error) return res.status(500).json(parsed);
  return getBestClasses(parsed, req, res)
}


const getBestClasses = async (parsed, req, res) => {
    console.time("Total");
    const courseCodes = Object.values(parsed).flat().map(course => `${course.department}_${course.number}`);
    const courses = await Course.find({ "_id": { $in: courseCodes } });

    const profCodes = getProfCodes(courses);
    const allProfessors = await Professor.find({ "_id": { $in: profCodes } });
    // return res.status(200).json(require('../output.json'))
    try {
        for (const sem of Object.keys(parsed)) {
            for (let i = 0; i < parsed[sem].length; i++) {
                const courseData = parsed[sem][i];
                courseData.title = courseData.title.trim();
                courseData.hours = parseInt(courseData.hours)

                const course = courses.find(x => x._id == `${courseData.department}_${courseData.number}`)

                if (!course) {
                    continue
                }

                const professors = course.professors

                if (!professors || professors.length === 0) {
                    continue
                }
                
                let profInfo = []
                for (let i = 0; i < professors.length; i++) {
                    const p = allProfessors.find(x => x._id == professors[i])
                    if (!p) continue
                    profInfo.push({info: {averageGPA: p.info.averageGPA.toFixed(2), averageRating: p.info.averageRating.toFixed(1), name: p.info.name, site: getSiteByProfessor(course, p.info.name), classRating: p.ratings?.[`${courseData.department}_${courseData.number}`]?.averageRating?.toFixed(1), warning: profTeachesSemester(sem, p, course), id: p._id}})
                }
                
                profInfo.sort((a, b) => (b.info.averageGPA + b.info.averageRating) - (a.info.averageGPA + a.info.averageRating));

                parsed[sem][i].professors = profInfo;
            }
        }
        console.timeEnd("Total")
        return res.status(200).json(parsed);
    } catch (err) {
        console.error("Planner error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getClassInfo = async (req, res) => {
  try {
    const parsed = req.body.class;
    const courseData = parsed.split(" ")
    const course = await Course.findOne({
        "info.department": courseData[0],
        "info.number": courseData[1]
    });

    if (!course) {
        return res.status(404).json({error: `Class not found`})
    }

    const semesters = Array.from(course.sections.keys());
    if (semesters.length == 0) {
        return res.status(404).json({ error: `No professors found for ${courseData.department} ${courseData.number}` });
    }
    
    let hours = "N/A"
    for (const key of semesters) {
        for (const cl of course.sections.get(key)) {
            if (cl.hours) {
                hours = parseInt(cl.hours)
                break;
            }
        }
        if (hours != "N/A") break
    }
    const professors = await Professor.find({ "_id": { $in: course.professors } });

    if (!professors || professors.length === 0) {
        return res.status(404).json({ error: `No professors found for ${courseData.department} ${courseData.number}` });
    }

    professors.sort((a, b) => (b.info.averageGPA + b.info.averageRating) - (a.info.averageGPA + a.info.averageRating));

    return res.status(200).json({department: courseData[0], number: courseData[1], title: course.info.title, hours: hours, info: course, professors: professors})
  } catch (err) {
      console.error("Planner error:", err);
      return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {getBestClassesPDF, getBestClassesText, getClassInfo}