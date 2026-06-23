const Auto = require('../models/Auto');
const Contact = require('../models/Contact');
const Proefrit = require('../models/Proefrit');
const Review = require('../models/Review');
const User = require('../models/User');

const adminController = {

  // dashboard met statistieken
  async dashboard(req, res) {
    try {
      const stats = await Auto.statistieken();
      res.render('admin/dashboard', { titel: 'Admin dashboard - AutoHub', stats });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'Het dashboard kon niet worden geladen.' });
    }
  },

  async overzicht(req, res) {
    try {
      const autos = await Auto.alleVoorAdmin(req.query.zoek);
      res.render('admin/overzicht', { titel: 'Admin - auto\'s beheren', autos, zoek: req.query.zoek || '' });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'Het admin-overzicht kon niet worden geladen.' });
    }
  },

  paginaNieuw(req, res) {
    res.render('admin/formulier', { titel: 'Nieuwe auto toevoegen', auto: null, fout: null, actie: '/admin/autos/nieuw' });
  },

  async aanmaken(req, res) {
    try {
      const fout = valideer(req.body);
      if (fout) return res.status(400).render('admin/formulier', { titel: 'Nieuwe auto toevoegen', auto: req.body, fout, actie: '/admin/autos/nieuw' });
      const data = { ...req.body };
      if (req.file) data.afbeelding_url = '/img/uploads/' + req.file.filename;
      const id = await Auto.aanmaken(data);
      res.redirect('/auto/' + id);
    } catch (err) {
      console.error(err);
      res.status(500).render('admin/formulier', { titel: 'Nieuwe auto toevoegen', auto: req.body, fout: 'Er ging iets mis bij het opslaan.', actie: '/admin/autos/nieuw' });
    }
  },

  async paginaBewerken(req, res) {
    try {
      const auto = await Auto.vindOpId(req.params.id);
      if (!auto) return res.status(404).render('error', { titel: 'Auto niet gevonden', boodschap: 'Deze auto bestaat niet (meer).' });
      res.render('admin/formulier', { titel: 'Auto bewerken', auto, fout: null, actie: '/admin/autos/' + auto.id + '/bewerken' });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'Deze auto kon niet geladen worden.' });
    }
  },

  async bijwerken(req, res) {
    try {
      const fout = valideer(req.body);
      if (fout) return res.status(400).render('admin/formulier', { titel: 'Auto bewerken', auto: { ...req.body, id: req.params.id }, fout, actie: '/admin/autos/' + req.params.id + '/bewerken' });
      const data = { ...req.body };
      if (req.file) data.afbeelding_url = '/img/uploads/' + req.file.filename;
      await Auto.bijwerken(req.params.id, data);
      res.redirect('/auto/' + req.params.id);
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'Deze auto kon niet worden bijgewerkt.' });
    }
  },

  async verwijderen(req, res) {
    try {
      await Auto.verwijderen(req.params.id);
      res.redirect('/admin/autos');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'Deze auto kon niet worden verwijderd.' });
    }
  },

  // contactberichten bekijken
  async berichten(req, res) {
    try {
      const berichten = await Contact.alleOphalen();
      res.render('admin/berichten', { titel: 'Contactberichten - AutoHub', berichten });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'De berichten konden niet worden geladen.' });
    }
  },

  // proefritten beheren
  async proefritten(req, res) {
    try {
      const proefritten = await Proefrit.alleVoorAdmin();
      res.render('admin/proefritten', { titel: 'Proefritten - AutoHub', proefritten });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'De proefritten konden niet worden geladen.' });
    }
  },

  async proefritStatus(req, res) {
    try {
      await Proefrit.statusBijwerken(req.params.id, req.body.status);
      res.redirect('/admin/proefritten');
    } catch (err) {
      console.error(err);
      res.redirect('/admin/proefritten');
    }
  },

  // reviews beheren
  async reviews(req, res) {
    try {
      const reviews = await Review.alleVoorAdmin();
      res.render('admin/reviews', { titel: 'Reviews - AutoHub', reviews });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'De reviews konden niet worden geladen.' });
    }
  },

  async reviewVerwijderen(req, res) {
    try {
      await Review.verwijderen(req.params.id);
      res.redirect('/admin/reviews');
    } catch (err) {
      console.error(err);
      res.redirect('/admin/reviews');
    }
  },

  // --- gebruikersbeheer ---
  async gebruikers(req, res) {
    try {
      const gebruikers = await User.alleVoorAdmin();
      res.render('admin/gebruikers', { titel: 'Gebruikers - AutoHub', gebruikers, currentUserId: req.user.id });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { titel: 'Er ging iets mis', boodschap: 'De gebruikers konden niet worden geladen.' });
    }
  },

  async gebruikerRol(req, res) {
    try {
      // voorkom dat een admin zichzelf degradeert
      if (parseInt(req.params.id) !== req.user.id) {
        await User.rolWijzigen(req.params.id, req.body.rol === 'admin' ? 'admin' : 'user');
      }
      res.redirect('/admin/gebruikers');
    } catch (err) { console.error(err); res.redirect('/admin/gebruikers'); }
  },

  async gebruikerVerwijderen(req, res) {
    try {
      if (parseInt(req.params.id) !== req.user.id) {
        await User.verwijderen(req.params.id);
      }
      res.redirect('/admin/gebruikers');
    } catch (err) { console.error(err); res.redirect('/admin/gebruikers'); }
  },

  // --- bulk-acties op auto's ---
  async bulkActie(req, res) {
    try {
      let ids = req.body.ids;
      if (!ids) return res.redirect('/admin/autos');
      if (!Array.isArray(ids)) ids = [ids];
      ids = ids.map(x => parseInt(x)).filter(Boolean);
      const actie = req.body.actie;

      if (actie === 'verwijderen') await Auto.bulkVerwijderen(ids);
      else if (actie === 'nieuw-aan') await Auto.bulkMarkeren(ids, 'is_nieuw', true);
      else if (actie === 'nieuw-uit') await Auto.bulkMarkeren(ids, 'is_nieuw', false);
      else if (actie === 'populair-aan') await Auto.bulkMarkeren(ids, 'is_populair', true);
      else if (actie === 'populair-uit') await Auto.bulkMarkeren(ids, 'is_populair', false);

      res.redirect('/admin/autos');
    } catch (err) { console.error(err); res.redirect('/admin/autos'); }
  },

  // --- galerij-foto's beheren ---
  async fotoToevoegen(req, res) {
    try {
      const autoId = req.params.id;
      if (req.file) {
        await Auto.fotoToevoegen(autoId, '/img/uploads/' + req.file.filename);
      } else if (req.body.foto_url && req.body.foto_url.trim()) {
        await Auto.fotoToevoegen(autoId, req.body.foto_url.trim());
      }
      res.redirect('/admin/autos/' + autoId + '/bewerken');
    } catch (err) { console.error(err); res.redirect('/admin/autos/' + req.params.id + '/bewerken'); }
  },

  async fotoVerwijderen(req, res) {
    try {
      await Auto.fotoVerwijderen(req.params.fotoId, req.params.id);
      res.redirect('/admin/autos/' + req.params.id + '/bewerken');
    } catch (err) { console.error(err); res.redirect('/admin/autos/' + req.params.id + '/bewerken'); }
  }
};

function valideer(data) {
  if (!data.merk || !data.model || !data.bouwjaar || !data.prijs || !data.vermogen_pk || !data.brandstof)
    return 'Vul minimaal merk, model, bouwjaar, prijs, vermogen en brandstof in.';
  if (isNaN(data.bouwjaar) || data.bouwjaar < 1900 || data.bouwjaar > 2100) return 'Vul een geldig bouwjaar in.';
  if (isNaN(data.prijs) || data.prijs < 0) return 'Vul een geldige prijs in.';
  if (isNaN(data.vermogen_pk) || data.vermogen_pk < 0) return 'Vul een geldig vermogen in.';
  return null;
}

module.exports = adminController;
