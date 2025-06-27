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

// const newCourses = {
//     "CSCE120": {
//         info: {
//             //info about course
//         },
//         "professorId1": {
//             info: {
//                 //info about the professor for this class specifically
//             },
//             "FALL 2024": [
//                 //Array of Sections Objects
//                 {
//                     check DB for section object schema
//                 },
//                 {

//                 }
//             ],
//         },
//         "professorId2": {
//             "FALL 2024": [
//                 {

//                 },
//                 {

//                 }
//             ]
//         }
//     }
// };

//this function makes above 

const getCourseByDeptAndNumber = async (req, res) => {
    const { department, courseNumber } = req.params;
    const course = await Course.findOne({"info.department": department, "info.number": courseNumber});
    const professors = await Professor.find(
        {
            _id: { 
                $in: course.professors 
            }
        }
    );
    const courseObject = {
        info: course.info,
    }

    for(const professor of professors){
        const professorId = professor._id.toString();
        const professorObject = {
            info: professor.info
        }
        courseObject[professorId] = professorObject;
    }
    const sectionsMap = course.sections;
    for(const [term, sectionArray] of sectionsMap){
        for(const section of sectionArray){
            const professorId = section.prof_id.toString();
            if(!courseObject.hasOwnObject(professorId)){
                throw new Error("Course Controller - getCourseByDeptAndNumber - courseObject does not have professor with professorId: ", professorId, ". Proceeding with initialization...");
            }

            const professorData = courseObject[professorId] || {};
            const termSections = professorData[term] || {};
            
            courseObject[professorId] = {
                ...professorId,
                [term]: [...termSections, section]
            }
        }
    }
    return res.status(200).json(
        {
            [`${department} ${courseNumber}`]: courseObject
        }
    );

}

module.exports = { getCourseByProfID, getCourseByProfName, getCourseByDeptAndNumber };