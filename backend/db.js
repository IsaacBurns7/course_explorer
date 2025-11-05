const { Pool } = require('pg');
const { neon } = require('@neondatabase/serverless');

//this is for running the database locally
/*
const pool = new Pool({
  host: "localhost",
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, //process.env.DB_NAME,
  port: process.env.PGPORT || 5432,
});
*/
//running db via neon

console.log("Global setup: Attempting to connect to DB at ", process.env.NEON_DB_URL);

const pool = new Pool({
    connectionString: process.env.NEON_DB_URL,
    ssl: process.env.NEON_DB_URL && process.env.NEON_DB_URL.includes('neon.tech') ? {
        require: true,
        rejectUnauthorized: false
    } : false,
    // Add connection pool settings
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Handle pool errors to prevent application crashes
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit the process, just log the error
});

pool.connect()
 .then(() => {
    console.log("Global setup: DB Connection established successfully.");
  })
  .catch((err) => {
    console.error('Connection error', err);
    // Don't exit the process, allow retry on next request
  });


// this is for running the database via neon

//const pool = neon(process.env.NEON_DB_URL);
//console.log("Connected to Neon!");

// Graceful shutdown handler
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing database pool');
    pool.end(() => {
        console.log('Database pool has ended');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing database pool');
    pool.end(() => {
        console.log('Database pool has ended');
        process.exit(0);
    });
});

module.exports = pool;