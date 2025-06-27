const Course = require('../models/course');
const Professor = require('../models/professor');

const getCourseByProfName = async (req, res) => {
    const { profName } = req.params;

    const professor = await Professor.find({"info.name": profName}) // doing it this way since I'm not sure if the sections.name will be consistent format
    if (!professor) {
        return res.status(404).json({error: `Professor with name ${profName} not found`});
    }
    const courses = await Course.find({ "professors": professor._id });

    if(!courses){
        return res.status(404).json({error: `Professor with name ${profName} not found to teach any class.`});
    }
    return res.status(200).json(courses);
}

const getCourseByProfID = async (req, res) => {
    const { profID } = req.params;
    const courses = await Course.find({ "professors": profID }); // apparently this still works even if its an array
    if(!courses){
        return res.status(404).json({error: `Professor with ID ${profID} not found to teach any class.`});
    }
    return res.status(200).json(courses);
}

module.exports = { getCourseByProfID, getCourseByProfName };