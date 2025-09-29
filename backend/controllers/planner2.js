const pool = require("../db.js");
const fs = require('fs');
const path = require('path');

const getBestClassesPDF = async(req, res) => {
  
}

const getBestClassesText = async(req, res) => {

}

const getBestClasses = async (parsed, req, res) => {

}

/*
course -> semesters -> find hours -> if can't find, give up, 
find professors from course -> sort by criteria 
return 
{
    department: courseData[0], 
    number: courseData[1], 
    title: course.info.title, 
    hours: hours, 
    info: course, 
    professors: professors
}
*/
const getClassInfo = async (req, res) => {
    const client = await pool.connect();
    try {
        const parsed = req.body.class;
        console.log("Parsed class:", parsed);
        if (!parsed || typeof parsed !== 'string' || !parsed.includes(" ")) {
            return res.status(400).json({ error: "Invalid class format. Expected format: 'DEPT NUMBER'" });
        }
        const courseData = parsed.split(" ");
        const department = courseData[0];
        const courseNumber = courseData[1];
        const courseId = `${department}_${courseNumber}`;

        const sqlFilePath = path.join(__dirname, './sql/getClassInfo.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');
        console.log("Executing SQL:" + sql.replace(/\s+/g, ' ').trim() + ` with courseId=${courseId}`);
        const queryResult = await client.query(sql, [courseId]); 
        console.log("Query result:", queryResult.rows);
        if (queryResult.rows.length === 0) {
            return res.status(404).json({ error: "Class not found" });
        }       
        console.log("Returning class info:", queryResult.rows[0].row_to_json);

        return res.status(200).json(queryResult.rows[0].row_to_json);
    
        // professors.sort((a, b) => (b.info.averageGPA + b.info.averageRating) - (a.info.averageGPA + a.info.averageRating));
    
        // return res.status(200).json({department: courseData[0], number: courseData[1], title: course.info.title, hours: hours, info: course, professors: professors})
    } catch (err) {
        console.error("Planner error:", err);
        return res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
    }
}

module.exports = { getBestClassesPDF, getBestClassesText, getClassInfo };