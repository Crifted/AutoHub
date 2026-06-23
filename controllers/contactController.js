const Contact = require('../models/Contact');

const contactController = {

  paginaContact(req, res) {
    res.render('contact', { titel: 'Contact - AutoHub', succes: false, fout: null });
  },

  async versturen(req, res) {
    try {
      const { naam, email, telefoon, onderwerp, bericht } = req.body;

      if (!naam || !email || !onderwerp || !bericht) {
        return res.status(400).render('contact', { titel: 'Contact - AutoHub', succes: false, fout: 'Vul alle verplichte velden in.' });
      }

      await Contact.opslaan({ naam, email, telefoon, onderwerp, bericht });

      res.render('contact', { titel: 'Contact - AutoHub', succes: true, fout: null });
    } catch (err) {
      console.error(err);
      res.status(500).render('contact', { titel: 'Contact - AutoHub', succes: false, fout: 'Er ging iets mis bij het versturen. Probeer het later opnieuw.' });
    }
  }
};

module.exports = contactController;
