const { Pool } = require("pg");
const pgPool = new Pool({
        user: process.env.DB_USERNAME,
        host: "localhost",
        database: "mydb",
        password: process.env.DB_PASSWORD,
        port: 5432
    });


const getProfessorInfoById = async (req, res) => {
    const { professorID } = req.query;
    const client = await pgPool.connect();

    try {
        const sql = `SELECT * FROM course_explorer.professors WHERE professor_id = $1`;
        const result = await client.query(sql, [professorID]);
        if (!result.rows.length) {
            return res.status(404).json({ error: `Professor with ID ${professorID} does not exist.` });
        }
        console.log(result, result.rows);
        const professorData = result.rows[0];

        if (!professorData) {
            return res.status(404).json({ error: `Professor with ID ${professorID} does not have an info object` });
        }

        return res.status(200).json(professorData);
    } catch (error) {
        return res.status(500).json({ error: "Server error while fetching professor data."});
    } finally {
        client.release();
    }
}

module.exports = {getProfessorInfoById};