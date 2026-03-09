"use strict";
/*
way to get courses based off professorId
way to get courses based off professorName,
*/
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const { getAllCourses } = require('../controllers/course');
const router = express.Router();
router.get("/getAll", getAllCourses);
module.exports = router;
