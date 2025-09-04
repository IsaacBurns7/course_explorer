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

    // console.log(professorID);
    // console.log(client);
    try {
        const sql = `SELECT * FROM course_explorer.professors WHERE id = $1`;
        // console.log(sql);
        const result = await client.query(sql, [professorID]);
        // console.log(result);
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

const getProfessorsByCourse = async (req, res) => {
    
};
const getProfessorByName = async (req, res) => {
    const { profName } = req.params;
    const client = await pgPool.connect();
    
    try {
        const sql = `SELECT * FROM course_explorer.professors WHERE name = $1`;
        const result = await client.query(sql, [profName]);
        if (!result.rows.length) {
            return res.status(404).json({ error: `Professor with name ${profName} not found.` });
        }
        const professor = result.rows[0];
        if(!professor){
            return res.status(404).json({error: `Professor with name ${profName} not found.`});
        }
    } catch (error) {
        return res.status(500).json({ error: "Server error while fetching professor data."});
    } finally {
        client.release();
    }

    
    return res.status(200).json(professor);
};
const getProfessorByCourseAndName = async (req, res) => {

};

module.exports = {
    getProfessorInfoById,
    getProfessorsByCourse, 
    getProfessorByName, 
    getProfessorByCourseAndName
};