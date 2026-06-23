const Review = require('../models/Review');

const reviewController = {
  async plaatsen(req, res) {
    try {
      const autoId = req.params.autoId;
      const { sterren, titel, tekst } = req.body;
      const s = parseInt(sterren);

      if (!s || s < 1 || s > 5 || !titel || !tekst) {
        return res.redirect('/auto/' + autoId + '?reviewFout=Vul+een+score+(1-5),+titel+en+tekst+in#reviews');
      }
      await Review.toevoegen({ autoId, userId: req.user.id, sterren: s, titel, tekst });
      res.redirect('/auto/' + autoId + '?reviewSucces=1#reviews');
    } catch (err) {
      console.error(err);
      res.redirect('/auto/' + req.params.autoId + '?reviewFout=Er+ging+iets+mis#reviews');
    }
  }
};
module.exports = reviewController;
