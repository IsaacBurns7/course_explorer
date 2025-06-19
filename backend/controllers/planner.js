
const {parseDegreePlan} = require('../services/parseData');
const Course = require('../models/course');
const Professor = require('../models/professor');

const getBestClasses = async (req, res) => {
    const parsed = parseDegreePlan(req.body.data)
    Object.keys(parsed).forEach(async (sem) => { // loop thru semesters
        parsed[sem].forEach(async (courses, i) => { // loop thru classes
            parsed[sem][i].title = parsed[sem][i].title.trim() // would be a good idea to sanitize the string

            const course = await Course.find({"info.department": courses.dept, "info.number": courses.course}) // find the identified course
            // might want to switch this out, some might be taking classes that not exist anymore or newer classes not in database
            if(!course) { 
                return res.status(404).json({error: `Class ${courses.dept} ${courses.course} not found.`});
            }

            const professors = await Professor.find({"_id": {$in: course.professors}}) // find the entire list of professors that teach the course
            if(!professors) { 
                return res.status(404).json({error: `No Professors Found`});
            }
            professors.sort((a, b) => (a.info.averageGPA + a.info.averageRating) - (b.info.averageGPA + b.info.averageRating)) // sort by a combination of average GPA + rating
            parsed[sem][i].professors = professors // add to parsed info
        })
    })
    return res.status(200).json(parsed);
}

module.exports = { getBestClasses };