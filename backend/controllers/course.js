const pool = require("../db.js")

const getAllCourses = async (req, res) => {
    const client = await pool.connect();
    try {
        const sql = `
            SELECT id FROM course_explorer.courses
        `;
        const data = await client.query(sql);
        const rows = data.rows.map(row => row.id);
        return res.status(200).json(rows);
    } catch (error){
        return res.status(500).json({error: error});
    } finally {
        client.release();
    }
}

module.exports = { getAllCourses };