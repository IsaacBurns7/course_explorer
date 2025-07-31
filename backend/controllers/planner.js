
const {parseDegreePlan} = require('../services/parseData');
const Course = require('../models/course');
const Professor = require('../models/professor');

const getBestClasses = async (req, res) => {
    const parsed = req.body;
    // return res.status(200).json(require('../output.json'))
    try {
        for (const sem of Object.keys(parsed)) {
            for (let i = 0; i < parsed[sem].length; i++) {
                const courseData = parsed[sem][i];
                courseData.title = courseData.title.trim();

                const course = await Course.findOne({
                    "info.department": courseData.department,
                    "info.number": courseData.number
                });

                if (!course) {
                    continue
                }

                const professors = await Professor.find({ "_id": { $in: course.professors } });

                if (!professors || professors.length === 0) {
                    return res.status(404).json({ error: `No professors found for ${courseData.department} ${courseData.number}` });
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

module.exports = { getBestClasses };