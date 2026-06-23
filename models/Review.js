const { pool } = require('../config/database');

const Review = {
  async toevoegen({ autoId, userId, sterren, titel, tekst }) {
    const [r] = await pool.query(
      'INSERT INTO reviews (auto_id, user_id, sterren, titel, tekst) VALUES (?, ?, ?, ?, ?)',
      [autoId, userId, sterren, titel, tekst]);
    return r.insertId;
  },
  async alleVoorAdmin() {
    const [rows] = await pool.query(
      `SELECT reviews.*, users.naam AS gebruiker_naam, autos.merk, autos.model
       FROM reviews
       JOIN users ON users.id = reviews.user_id
       JOIN autos ON autos.id = reviews.auto_id
       ORDER BY reviews.geplaatst_op DESC`);
    return rows;
  },
  async verwijderen(id) {
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
  }
};
module.exports = Review;
