require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 8889,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'autohub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kleine helperfunctie om de connectie te testen bij het opstarten
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database verbinding gelukt (' + (process.env.DB_NAME || 'autohub') + ')');
    connection.release();
  } catch (err) {
    console.error('Database verbinding mislukt:', err.message);
    console.error('Controleer of MAMP draait en of de instellingen in .env kloppen (DB_PORT is vaak 8889 bij MAMP).');
  }
}

module.exports = { pool, testConnection };
