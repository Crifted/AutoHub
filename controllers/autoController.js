const Auto = require('../models/Auto');
const Favoriet = require('../models/Favoriet');

const autoController = {

  // filmische landingspagina
  async home(req, res) {
    try {
      // uitgelichte auto's: populair + nieuwste
      const populair = await Auto.zoekenEnFilteren({ sorteer: 'nieuwste', pagina: 1 });
      const uitgelicht = populair.autos.filter(a => a.is_populair).slice(0, 3);
      const nieuwste = populair.autos.slice(0, 6);
      const favorietIds = req.user ? await Favoriet.idsVoorUser(req.user.id) : new Set();

      // unieke merken voor de merken-sectie
      const merken = [...new Set(populair.autos.map(a => a.merk))].slice(0, 8);

      res.render('home', {
        titel: 'AutoHub — premium occasions, eenvoudig gevonden',
        uitgelicht: uitgelicht.length ? uitgelicht : nieuwste.slice(0, 3),
        nieuwste,
        merken,
        totaal: populair.totaal,
        favorietIds
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'De homepage kon niet worden geladen.' });
    }
  },

  async overzicht(req, res) {
    try {
      const f = req.query;
      const resultaat = await Auto.zoekenEnFilteren({
        zoek: f.zoek,
        prijsMin: f.prijsMin, prijsMax: f.prijsMax,
        bouwjaarMin: f.bouwjaarMin, bouwjaarMax: f.bouwjaarMax,
        vermogenMin: f.vermogenMin, vermogenMax: f.vermogenMax,
        brandstof: f.brandstof, transmissie: f.transmissie,
        sorteer: f.sorteer,
        pagina: parseInt(f.pagina) || 1
      });

      const favorietIds = req.user ? await Favoriet.idsVoorUser(req.user.id) : new Set();

      res.render('overzicht', {
        titel: 'AutoHub - vind de auto die bij jou past',
        autos: resultaat.autos,
        totaal: resultaat.totaal,
        huidigePagina: parseInt(f.pagina) || 1,
        totaalPaginas: resultaat.totaalPaginas,
        favorietIds,
        filters: {
          zoek: f.zoek, prijsMin: f.prijsMin, prijsMax: f.prijsMax,
          bouwjaarMin: f.bouwjaarMin, bouwjaarMax: f.bouwjaarMax,
          vermogenMin: f.vermogenMin, vermogenMax: f.vermogenMax,
          brandstof: f.brandstof, transmissie: f.transmissie
        },
        sorteer: f.sorteer || 'nieuwste'
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'De auto\'s konden niet worden opgehaald.' });
    }
  },

  async detail(req, res) {
    try {
      const auto = await Auto.vindOpId(req.params.id);
      if (!auto) return res.status(404).render('error', { titel: 'Auto niet gevonden', boodschap: 'Deze auto bestaat niet (meer).' });

      const isFavoriet = req.user ? await Favoriet.isFavoriet(req.user.id, auto.id) : false;

      // "onlangs bekeken" bijhouden via cookie (max 4, huidige vooraan, geen dubbele)
      let bekeken = [];
      try { bekeken = JSON.parse(req.cookies.bekeken || '[]'); } catch (e) { bekeken = []; }
      bekeken = bekeken.filter(x => x != auto.id);
      bekeken.unshift(Number(auto.id));
      bekeken = bekeken.slice(0, 5);
      res.cookie('bekeken', JSON.stringify(bekeken), { maxAge: 30*24*60*60*1000 });

      // andere bekeken auto's ophalen (exclusief huidige)
      const andereIds = bekeken.filter(x => x != auto.id).slice(0, 3);
      const onlangsBekeken = andereIds.length ? await Auto.vindMeerdereOpIds(andereIds) : [];

      res.render('detail', {
        titel: auto.merk + ' ' + auto.model + ' - AutoHub',
        auto, isFavoriet, onlangsBekeken,
        reviewFout: req.query.reviewFout || null,
        reviewSucces: req.query.reviewSucces === '1',
        proefritSucces: req.query.proefritSucces === '1'
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'Deze auto kon niet worden geladen.' });
    }
  },

  async vergelijken(req, res) {
    try {
      const ids = (req.query.ids || '').split(',').map(x => parseInt(x)).filter(Boolean);
      const autos = await Auto.vindMeerdereOpIds(ids);
      res.render('vergelijken', { titel: 'Auto\'s vergelijken - AutoHub', autos });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'Vergelijken is niet gelukt.' });
    }
  },

  // JSON endpoint voor live-zoeken (autocomplete)
  async apiZoek(req, res) {
    try {
      const resultaten = await Auto.snelZoeken(req.query.q || '', 6);
      res.json(resultaten);
    } catch (err) {
      console.error(err);
      res.status(500).json([]);
    }
  }
};

module.exports = autoController;
