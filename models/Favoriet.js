const { pool } = require('../config/database');

const Favoriet = {

  async ophalenVoorUser(userId) {
    const [rows] = await pool.query(
      `SELECT autos.*,
         ROUND(AVG(r.sterren), 1) AS gem_sterren,
         COUNT(r.id) AS aantal_reviews
       FROM favorieten
       JOIN autos ON autos.id = favorieten.auto_id
       LEFT JOIN reviews r ON r.auto_id = autos.id
       WHERE favorieten.user_id = ?
       GROUP BY autos.id
       ORDER BY MAX(favorieten.toegevoegd_op) DESC`,
      [userId]
    );
    return rows;
  },

  async idsVoorUser(userId) {
    if (!userId) return new Set();
    const [rows] = await pool.query('SELECT auto_id FROM favorieten WHERE user_id = ?', [userId]);
    return new Set(rows.map(r => r.auto_id));
  },

  async isFavoriet(userId, autoId) {
    const [rows] = await pool.query(
      'SELECT id FROM favorieten WHERE user_id = ? AND auto_id = ?',
      [userId, autoId]
    );
    return rows.length > 0;
  },

  async toevoegen(userId, autoId) {
    await pool.query(
      'INSERT IGNORE INTO favorieten (user_id, auto_id) VALUES (?, ?)',
      [userId, autoId]
    );
  },

  async verwijderen(userId, autoId) {
    await pool.query(
      'DELETE FROM favorieten WHERE user_id = ? AND auto_id = ?',
      [userId, autoId]
    );
  },

  async toggle(userId, autoId) {
    const isAlFavoriet = await this.isFavoriet(userId, autoId);
    if (isAlFavoriet) {
      await this.verwijderen(userId, autoId);
      return false;
    } else {
      await this.toevoegen(userId, autoId);
      return true;
    }
  }
};

module.exports = Favoriet;
