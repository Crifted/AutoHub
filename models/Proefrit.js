const { pool } = require('../config/database');

const Proefrit = {
  async aanvragen({ autoId, naam, email, telefoon, gewensteDatum, opmerking }) {
    const [r] = await pool.query(
      'INSERT INTO proefritten (auto_id, naam, email, telefoon, gewenste_datum, opmerking) VALUES (?, ?, ?, ?, ?, ?)',
      [autoId, naam, email, telefoon || null, gewensteDatum, opmerking || null]);
    return r.insertId;
  },
  async alleVoorAdmin() {
    const [rows] = await pool.query(
      `SELECT proefritten.*, autos.merk, autos.model
       FROM proefritten
       JOIN autos ON autos.id = proefritten.auto_id
       ORDER BY proefritten.aangevraagd_op DESC`);
    return rows;
  },
  async statusBijwerken(id, status) {
    await pool.query('UPDATE proefritten SET status = ? WHERE id = ?', [status, id]);
  }
};
module.exports = Proefrit;
