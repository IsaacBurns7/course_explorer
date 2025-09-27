const pool = require("../db.js");

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
    try {
        const parsed = req.body.class;
        const courseData = parsed.split(" ");
        const department = courseData[0];
        const courseNumber = courseData[1];
        const courseId = `${department}_${courseNumber}`;
        const client = await pool.connect();

        const sql = `
            WITH professor_ids AS (
                SELECT professor_id
                FROM course_explorer.courses_professors
            )
            
        `;

        const res = client.query(sql, [courseId]);        
    
        // professors.sort((a, b) => (b.info.averageGPA + b.info.averageRating) - (a.info.averageGPA + a.info.averageRating));
    
        // return res.status(200).json({department: courseData[0], number: courseData[1], title: course.info.title, hours: hours, info: course, professors: professors})
    } catch (err) {
        console.error("Planner error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { getBestClassesPDF, getBestClassesText, getClassInfo };