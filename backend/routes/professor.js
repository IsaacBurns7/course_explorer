/*
way to get professors based off courseId
way to get professors based off dept name and course number
way to get courses based off professorId 
way to get courses based off professorName,
way to get professor object only pertaining to a certain {courseId} or {deptName + courseNumber}

*/
const express = require('express');
const { getProfessorsByCourse, getProfessorByName, getProfessorByCourseAndName } = require('../controllers/professor');

const router = express.Router();

router.get("/:dept/:number", getProfessorsByCourse);
router.get("/:profName", getProfessorByName);
router.get("/:dept/:number/:profName", getProfessorByCourseAndName );

module.exports = router;