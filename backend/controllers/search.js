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
        const professors = await Professor.find({_id: {$in: professorIds}});

        const results = {};

        for(const professor of professors){
            if(!professor.ratings || !professor.ratings[courseId]){
                //dont change anything
                results[professor._id] = {
                    ...professor.toObject()
                }
                continue;
            }

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
/*
courses: {
        DEPT_123: {
            professors: [
                id1,
                id2   
            ],
            //^^same is true of these grades variable
            averageGPA,
            averageRating,
            numStudents,
            numRatings,
            numSections
            ?prereqs: []
            ?postreqs: []
        }
    },
*/
const getCourseData = async (req, res) => {
    try { 
        const { department, courseNumber } = req.query;
        const courseId = `${department}_${courseNumber}`;
        const selectedCourse = await Course.findOne({_id: courseId});
        return res.json({[courseId]: selectedCourse});
    } catch (error) {
        console.error("Error in search controller: getCourseData");
        return res.status(500).json({error: "Internal server error"});
    }
}
/*
graph: {
        "DEPT123_id1": {
            data: [array of data]
            meta: { professorId: '100615', department: 'CSCE', courseNumber: '120'}
            name: "CSCE 120 <professorName>"
        }
    }
*/
const getGraphData = async(req, res) => {
    const { department, courseNumber } = req.query;
    const courseId = `${department}_${courseNumber}`;
    const selectedCourse = await Course.findOne({_id: courseId});
    if(!selectedCourse){
        return res.status(400).json({error: "No course found with specified department and courseNumber"});
    }

    const professorIds = selectedCourse.professors || [];
    if(professorIds.length == 0) return res.json({});

    const professors = await Professor.find({_id: { $in: professorIds}});
    const results = {};
    const categories = ["A", "B", "C", "D", "F", "I", "S", "U", "Q", "X"];
    const data = categories.map((category) => {
        return [
            category,
            0
        ]
    });
    for(const professor of professors){
        const graphId = `${department}${courseNumber}_${professor._id}`;
        results[graphId] = {
            data: JSON.parse(JSON.stringify(data)), //needs to create a deep clone
            meta: {
                professorId: professor._id,
                department: department,
                courseNumber: courseNumber,
            },
            name: `${department} ${courseNumber} ${professor.info.name}`
        };
    }
    const validProfessorIds = new Set(professorIds);
    for(const [semester, sections] of selectedCourse.sections){
        // console.log(sections);
        for(const section of sections){
            if(!section.prof_id || !validProfessorIds.has(section.prof_id)) continue;
            const graphId = `${department}${courseNumber}_${section.prof_id}`;
            // console.log(graphId);
            // console.log(results[graphId]);
            for(const category of categories){
                const value = section[category];
                if(!results[graphId] || !results[graphId].data){
                    console.log("search controller, getGraphData: result set malformed - cannot access data of graphId ", graphId);
                }
                // below vs const graphData = results[graphId].data
                const index = results[graphId].data.findIndex(item => item[0] === category);
                // console.log(index, results[graphId].data[index][1], Number(value));
                results[graphId].data[index][1] += Number(value);
            }
            // console.log(results[graphId]);
        }
    }

    return res.status(200).json(results);
}

module.exports = {
    getSemestersForCourse,
    getProfessorDataForCourse,
    getCourseData,
    getGraphData,
}