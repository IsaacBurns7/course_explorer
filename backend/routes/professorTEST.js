/*
way to get professors based off courseId
way to get professors based off dept name and course number
way to get courses based off professorId 
way to get courses based off professorName,
way to get professor object only pertaining to a certain {courseId} or {deptName + courseNumber}

*/
const express = require('express');
const { getProfessorsByCourse, getProfessorByName, getProfessorByCourseAndName, getProfessorInfoById, getProfessorRatingsByIdAndCourse, getCoursesTaughtByProfessorID } = require('../controllers/professorTEST');

const router = express.Router();

/*note for future isaac:
    create middleware to select the correct function to fire - multiple functions shouldnt fire all at once.
*/
// router.get("/name/:profName", getProfessorByName);
router.get("/ratings", routeRatingsByQueryParams); 
router.get("/coursesTaught", routeCoursesTaughtByQueryParams);
router.get("/professorInfo", routeProfessorInfoByQueryParams);

function routeProfessorInfoByQueryParams(req, res, next){
    const { professorID } = req.query;
    if(professorID){
        return getProfessorInfoById(req, res, next);
    }
    return res.status(400).json({error: "Missing valid query parameters"});
}
function routeRatingsByQueryParams(req, res, next){
    const { professorID, department, courseNumber } = req.query;
    if(professorID && department && courseNumber){
        return getProfessorRatingsByIdAndCourse(req, res, next);
    }
    return res.status(400).json({error: "Missing valid query parameters"});
}
function routeCoursesTaughtByQueryParams(req, res, next){
    const { professorID } = req.query;
    if(professorID){
        return getCoursesTaughtByProfessorID(req, res, next);
    }
    return res.status(400).json({error: "Missing valid query parameters"});
}

module.exports = router;