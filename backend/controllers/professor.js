const Professor = require('../models/professor');
const Course = require('../models/course');

const getProfessorByName = async (req, res) => {
    const { profName } = req.params;
    const professor = await Professor.find({"info.name" : profName});
    if(!professor){
        return res.status(404).json({error: `Professor with name ${profName} not found.`});
    }
    return res.status(200).json(professor);
}

//have to make actual courses schema for this one 
const getProfessorsByCourse = async (req, res) => {
    const { dept, number } = req.params;
    const course = await Course.find({"info.department": dept, "info.number": number});
    if (!course) {
        return res.status(404).json({error: `Course ${dept} ${number} not found.`});
    }
    return res.status(200).json(course.professors)
}

// //have to use both course and professor schema for this one.
// const getProfessorByCourseAndName = async (req, res) => {
//     const { dept, number, profName} = req.query;
//     const course = await Course.findOne({"info.department": dept, "info.number": number});
//     if (!course) {
//         return res.status(404).json({error: `Course ${dept} ${number} not found.`});
//     }
//     const professor = await Professor.findOne({"info.name" : profName});
//     if (!professor) {
//         return res.status(404).json({error: `Professor with name ${profName} not found.`});
//     }

//     const findClass = professor.courses.find((id) => id == course._id)
//     if (!findClass) {
//         return res.status(404).json({ error: `Professor ${profName} does not teach ${dept} ${number}.` });
//     }

//     return res.status(200).json(professor);
// }

const getProfessorRatingsByIdAndCourse = async (req, res) => {
    const { professorID, department, courseNumber } = req.query;
    const professor = await Professor.findOne({_id: professorID});
    if(!professor){
        return res.status(404).json({error: `Professor with ID ${professorID} does not exist.`});
    }
    const ratings = professor.ratings;
    if(!ratings){
        return res.status(404).json({error: `Professor with ID ${professorID} does not have ratings object`});
    }
    // console.log(ratings);
    const classString = `${department}_${courseNumber}`;
    const classRatings = ratings.get(classString);
    if(!classRatings){
        return res.status(404).json({error: `Professor with ID ${professorID} does not have ratings for class ${classString}`});
    }
    return res.status(200).json(classRatings);
}

const getCoursesTaughtByProfessorID = async(req, res) => {
    const { professorID } = req.query;
    const professor = await Professor.findOne({_id: professorID});

    if(!professor){
        return res.status(404).json({error: `Professor with ID ${professorID} does not exist.`});
    }
    const data = professor.courses;
    if(!data){
        return res.status(404).json({error: `Professor with ID ${professorID} does not have a courses array`});
    }

    return res.status(200).json(data);
} 
const getProfessorInfoById = async (req, res) => {
    const { professorID } = req.query;
    
    try {
        const professor = await Professor.findOne(
            {_id: professorID },
            { info: 1, _id: 0}
        );
        if (!professor) {
        return res.status(404).json({ error: `Professor with ID ${professorID} does not exist.` });
        }

        if (!professor.info) {
            return res.status(404).json({ error: `Professor with ID ${professorID} does not have an info object` });
        }

        return res.status(200).json(professor.info);
    } catch (error) {
        return res.status(500).json({ error: "Server error while fetching professor data."});
    }
}

const getAllProfs = async (req, res) => {
    const data = await Professor.distinct("info.name");
    return res.status(200).json(data);
}

module.exports = { getProfessorByName, getProfessorsByCourse, getProfessorRatingsByIdAndCourse, getCoursesTaughtByProfessorID, getProfessorInfoById, getAllProfs };