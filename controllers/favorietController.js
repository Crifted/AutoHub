const Favoriet = require('../models/Favoriet');

const favorietController = {

  // GET /favorieten - overzicht van eigen favorieten (vereist login)
  async overzicht(req, res) {
    try {
      const autos = await Favoriet.ophalenVoorUser(req.user.id);
      res.render('favorieten', {
        titel: 'Mijn favorieten - AutoHub',
        autos
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'Je favorieten konden niet worden opgehaald.' });
    }
  },

  // POST /favorieten/toggle/:autoId - toevoegen of verwijderen (AJAX of formulier)
  async toggle(req, res) {
    try {
      const isNuFavoriet = await Favoriet.toggle(req.user.id, req.params.autoId);

      // als het verzoek via fetch/AJAX komt, JSON terugsturen
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ favoriet: isNuFavoriet });
      }

      // anders gewoon terug naar de vorige pagina
      res.redirect(req.get('Referer') || '/');
    } catch (err) {
      console.error(err);
      res.status(500).redirect('/');
    }
  }
};

module.exports = favorietController;
