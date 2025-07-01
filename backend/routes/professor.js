/*
way to get professors based off courseId
way to get professors based off dept name and course number
way to get courses based off professorId 
way to get courses based off professorName,
way to get professor object only pertaining to a certain {courseId} or {deptName + courseNumber}

*/
const express = require('express');
const { getProfessorsByCourse, getProfessorByName, getProfessorByCourseAndName, getProfessorRatingsByIdAndCourse } = require('../controllers/professor');

const router = express.Router();

/*note for future isaac:
    create middleware to select the correct function to fire - multiple functions shouldnt fire all at once.
*/
router.get("/name/:profName", getProfessorByName);
router.get("/ratings", getProfessorRatingsByIdAndCourse); 
router.get("/:dept/:number/:profName", getProfessorByCourseAndName);
router.get("/:dept/:number", getProfessorsByCourse);

module.exports = router;