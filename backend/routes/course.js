/*
way to get courses based off professorId 
way to get courses based off professorName,
*/

const express = require('express');
const { getCourseByProfName, getCourseByProfID } = require('../controllers/course');

const router = express.Router();

router.get("/id/:id", getCourseByProfName);
router.get("/name/:name", getCourseByProfID);


module.exports = router;