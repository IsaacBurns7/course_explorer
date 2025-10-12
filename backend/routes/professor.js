/*
way to get professors based off courseId
way to get professors based off dept name and course number
way to get courses based off professorId 
way to get courses based off professorName,
way to get professor object only pertaining to a certain {courseId} or {deptName + courseNumber}

*/
const express = require('express');
const { getAllProfs } = require('../controllers/professor');

const router = express.Router();

router.get("/getAll", getAllProfs);

module.exports = router;