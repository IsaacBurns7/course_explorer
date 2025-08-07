const Course = require("../models/course");
const Professor = require("../models/professor");

const getSemestersForCourse = async(req, res) => {
    //fuckin do later
}

// professors: {
//         professorId1:{
//             //to make grades work with semesters would require the frontend to handle all sections 
//             averageRating: 4.8,
//             numRatings: 123, 
//             averageGPA: 1,
//             numStudents,
//             numSections,
//             name,
//         }
//     },
const getProfessorDataForCourse = async(req, res) => {
    try{
        const { department, courseNumber } = req.query;
        const courseId = `${department}_${courseNumber}`;
        const selectedCourse = await Course.findOne({_id: courseId});
        if(!selectedCourse) return res.status(404).json({error: "course not found"});

        const professorIds = selectedCourse.professors || [];
        if(professorIds.length == 0) return res.json({});
        const professors = await Professor.find({_id: {$in: professorIds}});

        const results = {};

        for(const professor of professors){
            if(!professor.ratings || !professor.ratings[courseId]) continue;
            const ratings = professor.ratings;
            const courseObj = ratings[courseId];

            const sumRatings = Object.values(courseObj.ratings).reduce((sum, value) => sum + value, 0);
            professor.info.averageRating = courseObj.averageRating;
            professor.tags = courseObj.tags;

            results[professor._id] = {
                ...professor.toObject(),
                info: {
                    ...professor.info,
                    totalRatings: sumRatings,
                    averageRating: courseObj.averageRating
                },
                tags: courseObj.tags || {}
            };
        }

        return res.json(results);
    }catch(error) {
        console.error("Error in search controller: getProfessorDataForCourse");
        return res.status(500).json({error: "Internal server error"});
    }
}

module.exports = {
    getSemestersForCourse,
    getProfessorDataForCourse,
    getCourseData,
    getGraphData,
}