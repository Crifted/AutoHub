const { pool } = require('../config/database');

const Auto = {

  async zoekenEnFilteren({ zoek, prijsMin, prijsMax, bouwjaarMin, bouwjaarMax, vermogenMin, vermogenMax, brandstof, transmissie, sorteer, pagina = 1, perPagina = 9 }) {
    let query = `SELECT autos.*,
                 (SELECT ROUND(AVG(sterren),1) FROM reviews WHERE reviews.auto_id = autos.id) AS gem_sterren,
                 (SELECT COUNT(*) FROM reviews WHERE reviews.auto_id = autos.id) AS aantal_reviews
                 FROM autos WHERE 1=1`;
    const params = [];

    if (zoek) { query += ' AND (merk LIKE ? OR model LIKE ?)'; params.push('%'+zoek+'%', '%'+zoek+'%'); }
    if (prijsMin) { query += ' AND prijs >= ?'; params.push(prijsMin); }
    if (prijsMax) { query += ' AND prijs <= ?'; params.push(prijsMax); }
    if (bouwjaarMin) { query += ' AND bouwjaar >= ?'; params.push(bouwjaarMin); }
    if (bouwjaarMax) { query += ' AND bouwjaar <= ?'; params.push(bouwjaarMax); }
    if (vermogenMin) { query += ' AND vermogen_pk >= ?'; params.push(vermogenMin); }
    if (vermogenMax) { query += ' AND vermogen_pk <= ?'; params.push(vermogenMax); }
    if (brandstof) { query += ' AND brandstof = ?'; params.push(brandstof); }
    if (transmissie) { query += ' AND transmissie = ?'; params.push(transmissie); }

    // totaal voor paginering
    const countQuery = 'SELECT COUNT(*) AS totaal FROM autos WHERE 1=1' + query.split('WHERE 1=1')[1].split('ORDER BY')[0];
    const [countRows] = await pool.query(countQuery, params);
    const totaal = countRows[0].totaal;

    // sorteren
    const sorteerOpties = {
      'nieuwste': 'aangemaakt_op DESC',
      'prijs-op': 'prijs ASC',
      'prijs-af': 'prijs DESC',
      'bouwjaar-af': 'bouwjaar DESC',
      'vermogen-af': 'vermogen_pk DESC'
    };
    query += ' ORDER BY ' + (sorteerOpties[sorteer] || 'aangemaakt_op DESC');

    const offset = (pagina - 1) * perPagina;
    query += ' LIMIT ? OFFSET ?';
    params.push(perPagina, offset);

    const [rows] = await pool.query(query, params);
    return { autos: rows, totaal, totaalPaginas: Math.ceil(totaal / perPagina) };
  },

  async vindOpId(id) {
    const [rows] = await pool.query('SELECT * FROM autos WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const auto = rows[0];

    const [tuning] = await pool.query('SELECT * FROM tuning_opties WHERE auto_id = ?', [id]);
    auto.tuningOpties = tuning;

    const [fotos] = await pool.query('SELECT * FROM auto_fotos WHERE auto_id = ? ORDER BY volgorde ASC', [id]);
    auto.fotos = fotos.length > 0 ? fotos : [{ foto_url: auto.afbeelding_url, volgorde: 0 }];

    const [reviews] = await pool.query(
      `SELECT reviews.*, users.naam AS gebruiker_naam FROM reviews
       JOIN users ON users.id = reviews.user_id
       WHERE reviews.auto_id = ? ORDER BY reviews.geplaatst_op DESC`, [id]);
    auto.reviews = reviews;

    const [stat] = await pool.query('SELECT ROUND(AVG(sterren),1) AS gem, COUNT(*) AS aantal FROM reviews WHERE auto_id = ?', [id]);
    auto.gem_sterren = stat[0].gem;
    auto.aantal_reviews = stat[0].aantal;

    return auto;
  },

  async vindMeerdereOpIds(ids) {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await pool.query(`SELECT * FROM autos WHERE id IN (${placeholders})`, ids);
    return rows;
  },

  async alleVoorAdmin(zoek) {
    let query = 'SELECT * FROM autos';
    const params = [];
    if (zoek) { query += ' WHERE merk LIKE ? OR model LIKE ?'; params.push('%'+zoek+'%', '%'+zoek+'%'); }
    query += ' ORDER BY aangemaakt_op DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async aanmaken(data) {
    const [result] = await pool.query(
      `INSERT INTO autos (merk, model, bouwjaar, prijs, vermogen_pk, brandstof, transmissie, kilometerstand, kleur, omschrijving, afbeelding_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.merk, data.model, data.bouwjaar, data.prijs, data.vermogen_pk, data.brandstof, data.transmissie,
       data.kilometerstand || 0, data.kleur || null, data.omschrijving || null, data.afbeelding_url || '/img/auto-placeholder.svg']);
    const autoId = result.insertId;
    // hoofdfoto ook als galerij-foto opslaan
    await pool.query('INSERT INTO auto_fotos (auto_id, foto_url, volgorde) VALUES (?, ?, 0)', [autoId, data.afbeelding_url || '/img/auto-placeholder.svg']);
    return autoId;
  },

  async bijwerken(id, data) {
    await pool.query(
      `UPDATE autos SET merk=?, model=?, bouwjaar=?, prijs=?, vermogen_pk=?, brandstof=?, transmissie=?, kilometerstand=?, kleur=?, omschrijving=? WHERE id=?`,
      [data.merk, data.model, data.bouwjaar, data.prijs, data.vermogen_pk, data.brandstof, data.transmissie,
       data.kilometerstand || 0, data.kleur || null, data.omschrijving || null, id]);
    if (data.afbeelding_url) {
      await pool.query('UPDATE autos SET afbeelding_url=? WHERE id=?', [data.afbeelding_url, id]);
    }
  },

  async verwijderen(id) {
    await pool.query('DELETE FROM autos WHERE id = ?', [id]);
  },

  // statistieken voor admin dashboard
  async statistieken() {
    const [[{ totaalAutos }]] = await pool.query('SELECT COUNT(*) AS totaalAutos FROM autos');
    const [[{ totaalUsers }]] = await pool.query('SELECT COUNT(*) AS totaalUsers FROM users');
    const [[{ totaalReviews }]] = await pool.query('SELECT COUNT(*) AS totaalReviews FROM reviews');
    const [[{ totaalProefritten }]] = await pool.query('SELECT COUNT(*) AS totaalProefritten FROM proefritten');
    const [[{ gemPrijs }]] = await pool.query('SELECT ROUND(AVG(prijs)) AS gemPrijs FROM autos');
    const [merkVerdeling] = await pool.query('SELECT merk, COUNT(*) AS aantal FROM autos GROUP BY merk ORDER BY aantal DESC LIMIT 8');
    const [brandstofVerdeling] = await pool.query('SELECT brandstof, COUNT(*) AS aantal FROM autos GROUP BY brandstof ORDER BY aantal DESC');
    return { totaalAutos, totaalUsers, totaalReviews, totaalProefritten, gemPrijs, merkVerdeling, brandstofVerdeling };
  },

  // snelle zoekfunctie voor live-zoeken (autocomplete)
  async snelZoeken(term, limiet = 6) {
    if (!term || term.trim().length < 1) return [];
    const q = '%' + term.trim() + '%';
    const [rows] = await pool.query(
      `SELECT id, merk, model, bouwjaar, prijs, vermogen_pk, brandstof, afbeelding_url
       FROM autos
       WHERE merk LIKE ? OR model LIKE ? OR CONCAT(merk, ' ', model) LIKE ?
       ORDER BY is_populair DESC, aangemaakt_op DESC
       LIMIT ?`,
      [q, q, q, limiet]
    );
    return rows;
  },

  // --- bulk-acties (meerdere auto's tegelijk) ---
  async bulkVerwijderen(ids) {
    if (!ids || ids.length === 0) return;
    const ph = ids.map(() => '?').join(',');
    await pool.query(`DELETE FROM autos WHERE id IN (${ph})`, ids);
  },

  async bulkMarkeren(ids, veld, waarde) {
    if (!ids || ids.length === 0) return;
    const toegestaan = ['is_nieuw', 'is_populair'];
    if (!toegestaan.includes(veld)) return;
    const ph = ids.map(() => '?').join(',');
    await pool.query(`UPDATE autos SET ${veld} = ? WHERE id IN (${ph})`, [waarde ? 1 : 0, ...ids]);
  },

  // --- galerij-foto's beheren ---
  async fotoToevoegen(autoId, fotoUrl) {
    const [[{ maxV }]] = await pool.query('SELECT COALESCE(MAX(volgorde), -1) AS maxV FROM auto_fotos WHERE auto_id = ?', [autoId]);
    await pool.query('INSERT INTO auto_fotos (auto_id, foto_url, volgorde) VALUES (?, ?, ?)', [autoId, fotoUrl, maxV + 1]);
  },

  async fotoVerwijderen(fotoId, autoId) {
    await pool.query('DELETE FROM auto_fotos WHERE id = ? AND auto_id = ?', [fotoId, autoId]);
  },

  async fotosVanAuto(autoId) {
    const [rows] = await pool.query('SELECT * FROM auto_fotos WHERE auto_id = ? ORDER BY volgorde ASC', [autoId]);
    return rows;
  }
};

module.exports = Auto;
