// backend/testDbConnection.js

const { Pool } = require('pg'); // Import PostgreSQL client (pg)

const pool = new Pool({
  user: 'school_user',  // Replace with your PostgreSQL username
  host: 'localhost',
  database: 'school_vaccine_db', // Replace with your database name
  password: 'school_pass', // Replace with your PostgreSQL password
  port: 5432, // Default PostgreSQL port
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()'); // Test query to check connection
    console.log('DB Connection Successful:', res.rows[0]); // Logs the current timestamp
  } catch (err) {
    console.error('Error connecting to DB:', err);
  } finally {
    pool.end(); // Close the connection
  }
}

testConnection();
