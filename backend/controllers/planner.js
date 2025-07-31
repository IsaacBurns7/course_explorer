
const {parseDegreePlan} = require('../services/parseData');
const Course = require('../models/course');
const Professor = require('../models/professor');

const getBestClasses = async (req, res) => {
    const parsed = req.body;
    return res.status(200).json(require('../output.json'))

    const conditions = parsed[sem].map(course => ({
        "info.department": course.department,
        "info.number": course.number
    }));
    const courses = await Course.find({ $or: conditions });
    try {
        const allPairs = [];
        for(const sem of Object.keys(parsed)){
            for(const course of parsed[sem]){
                const key = `${course.department}_${course.number}`;
            }
        }

        const uniquePairs = [...new Set(allPairs)];
        const queryConditions = uniquePairs.map(pair => {
            const [department, number] = pair.split("_");
            return { "info.department": department, "info.name": name};
        })
        const allMatchingCourses = await Course.find({$or: queryConditions});
        const courseMap = new Map();
        allMatchingCourses.forEach(course => {
            const key = `${course.info.department}_${course.info.number}`;
            courseMap.set(key, course);
        })
        for (const sem of Object.keys(parsed)) {
            for(const courseData of parsed[sem]){
                const key = `${courseData.department}_${courseData.number}`;
                const course = courseMap.get(key);
                courseData.title.trim();

                const professors = await Professor.find({ "_id": { $in: courseData.professors } });

                if (!professors || professors.length === 0) {
                    return res.status(404).json({ error: `No professors found for ${course.department} ${course.number}` });
                }

                professors.sort((a, b) => (b.info.averageGPA + b.info.averageRating) - (a.info.averageGPA + a.info.averageRating));

                parsed[sem][i].info = course;
                parsed[sem][i].professors = professors;

            }
        }
        console.log(parsed)
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
                hours = cl.hours
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


module.exports = { getBestClasses, getClassInfo };