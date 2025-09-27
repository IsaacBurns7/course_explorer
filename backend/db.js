const { Pool } = require('pg');
const { neon } = require('@neondatabase/serverless');
//this is for running the database locally
// const pool = new Pool({
//   host: "localhost",
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: "mydb", //process.env.DB_NAME,
//   port: process.env.PGPORT || 5432,
// });

//running db via neon

console.log("Global setup: Attempting to connect to DB at ", process.env.NEON_DB_URL);

const pool = new Pool({
    connectionString: process.env.NEON_DB_URL,
    ssl: {
        require: true
    }
});

pool.connect()
  .then(() => {
    console.log("Global setup: DB Connection established successfully.");
  })
  .catch((err) => console.error('Connection error', err));


// this is for running the database via neon

// const pool = neon(process.env.NEON_DB_URL);
// console.log("Connected to Neon!");

module.exports = pool;