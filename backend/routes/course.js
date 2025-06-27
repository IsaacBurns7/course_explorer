/*
way to get courses based off professorId 
way to get courses based off professorName,
*/

const express = require('express');
const { getCourseByProfName, getCourseByProfID, getCourseByDeptAndNumber } = require('../controllers/course');

const router = express.Router();

router.get("/id/:id", getCourseByProfName);
router.get("/name/:name", getCourseByProfID);
router.get("", routeByQueryParams); 

//middleware - essentially a map(params -> controller func)
function routeByQueryParams(req, res, next){
    const { department, courseNumber } = req.query;
    console.log(req.query);
    if(department && courseNumber){
        return getCourseByDeptAndNumber(req, res, next);
    }
    
    return res.status(400).json({error: "Missing valid query parameters"});
}


module.exports = router;