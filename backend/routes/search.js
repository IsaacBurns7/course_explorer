/*
way to get courses based off professorId 
way to get courses based off professorName,
*/

const express = require('express');
const {
    getSemestersForCourse,
    getProfessorDataForCourse,
    getCourseData,
    getGraphData,
} = require('../controllers/search');

const router = express.Router();

router.get("/graphData", getGraphData);
router.get("/courses", getCourseData);
router.get("/professors", getProfessorDataForCourse);

module.exports = router;