const { pool } = require('../config/database');

const User = {

  async vindOpEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async vindOpId(id) {
    const [rows] = await pool.query('SELECT id, naam, email, rol, aangemaakt_op FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async aanmaken({ naam, email, wachtwoordHash, rol = 'user' }) {
    const [result] = await pool.query(
      'INSERT INTO users (naam, email, wachtwoord_hash, rol) VALUES (?, ?, ?, ?)',
      [naam, email, wachtwoordHash, rol]
    );
    return result.insertId;
  },

  // --- voor admin gebruikersbeheer ---
  async alleVoorAdmin() {
    const [rows] = await pool.query(
      `SELECT users.id, users.naam, users.email, users.rol, users.aangemaakt_op,
              (SELECT COUNT(*) FROM favorieten WHERE favorieten.user_id = users.id) AS aantal_favorieten,
              (SELECT COUNT(*) FROM reviews WHERE reviews.user_id = users.id) AS aantal_reviews
       FROM users ORDER BY users.aangemaakt_op DESC`);
    return rows;
  },

  async rolWijzigen(id, rol) {
    await pool.query('UPDATE users SET rol = ? WHERE id = ?', [rol, id]);
  },

  async verwijderen(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  }
};

module.exports = User;
