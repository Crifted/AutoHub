const { pool } = require('../config/database');

const Contact = {
  async opslaan({ naam, email, telefoon, onderwerp, bericht }) {
    const [r] = await pool.query(
      'INSERT INTO contactberichten (naam, email, telefoon, onderwerp, bericht) VALUES (?, ?, ?, ?, ?)',
      [naam, email, telefoon || null, onderwerp, bericht]);
    return r.insertId;
  },
  async alleOphalen() {
    const [rows] = await pool.query('SELECT * FROM contactberichten ORDER BY verzonden_op DESC');
    return rows;
  }
};
module.exports = Contact;
