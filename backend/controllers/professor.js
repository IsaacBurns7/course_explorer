const Professor = require('../models/professor');

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
    const professors = await Professor.find({});
}

//have to use both course and professor schema for this one.
const getProfessorByCourseAndName = async (req, res) => {
    const { dept, number, profName} = req.params;
    return {};
}


module.exports = { getProfessorByName, getProfessorsByCourse, getProfessorByCourseAndName };