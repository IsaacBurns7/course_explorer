/*
way to get courses based off professorId 
way to get courses based off professorName,
*/

import express, {Request, Response, NextFunction } from "express";
const {
    getSemestersForCourse,
    getProfessorDataForCourse,
    getCourseData,
    getGraphData,
    getLineGraphData,
} = require('../controllers/search2');

const router = express.Router();

const validateQueryParams = (req:Request, res:Response, next:NextFunction) => {
    const { department, courseNumber } = req.query;
    if(!department || !courseNumber){
        return res.status(400).json({error: "Missing Query Parameters"});
    }
    next();
}

router.get("/graphData", validateQueryParams, getGraphData);
router.get("/courses", validateQueryParams, getCourseData);
router.get("/professors", validateQueryParams, getProfessorDataForCourse);
router.get("/lineGraphData", validateQueryParams, getLineGraphData);

module.exports = router;