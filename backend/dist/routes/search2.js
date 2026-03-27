"use strict";
/*
way to get courses based off professorId
way to get courses based off professorName,
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getSemestersForCourse, getProfessorDataForCourse, getCourseData, getGraphData, getLineGraphData, } = require('../controllers/search2');
const router = express_1.default.Router();
const validateQueryParams = (req, res, next) => {
    const { department, courseNumber } = req.query;
    if (!department || !courseNumber) {
        return res.status(400).json({ error: "Missing Query Parameters" });
    }
    next();
};
router.get("/graphData", validateQueryParams, getGraphData);
router.get("/courses", validateQueryParams, getCourseData);
router.get("/professors", validateQueryParams, getProfessorDataForCourse);
router.get("/lineGraphData", validateQueryParams, getLineGraphData);
module.exports = router;
