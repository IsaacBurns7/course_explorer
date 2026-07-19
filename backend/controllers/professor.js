const pool = require("../db.js");

const getAllProfs = async (req, res) => {
    const client = await pool.connect();
    try {
        const sql = `
            SELECT DISTINCT name FROM course_explorer.professors
        `;
        const data = await client.query(sql);
        const rows = data.rows.map(row => row.name);
        return res.status(200).json(rows);
    } catch (error){
        return res.status(500).json({error: error});
    } finally {
        client.release();
    }
}

module.exports = { getAllProfs };