const Proefrit = require('../models/Proefrit');

const proefritController = {
  async aanvragen(req, res) {
    try {
      const autoId = req.params.autoId;
      const { naam, email, telefoon, gewenste_datum, opmerking } = req.body;
      if (!naam || !email || !gewenste_datum) {
        return res.redirect('/auto/' + autoId + '?proefritSucces=0#proefrit');
      }
      await Proefrit.aanvragen({ autoId, naam, email, telefoon, gewensteDatum: gewenste_datum, opmerking });
      res.redirect('/auto/' + autoId + '?proefritSucces=1#proefrit');
    } catch (err) {
      console.error(err);
      res.redirect('/auto/' + req.params.autoId + '?proefritSucces=0#proefrit');
    }
  }
};
module.exports = proefritController;
