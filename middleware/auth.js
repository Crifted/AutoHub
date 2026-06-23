const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'verander-dit-in-een-lange-geheime-sleutel-12345';

function haalGebruikerOp(req, res, next) {
  const token = req.cookies && req.cookies.token;
  req.user = null;

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload; // { id, naam, email, rol }
    } catch (err) {
      req.user = null;
    }
  }

  res.locals.user = req.user;
  next();
}

function vereistIngelogd(req, res, next) {
  if (!req.user) {
    return res.redirect('/login?melding=log-eerst-in');
  }
  next();
}

function vereistAdmin(req, res, next) {
  if (!req.user) {
    return res.redirect('/login?melding=log-eerst-in');
  }
  if (req.user.rol !== 'admin') {
    return res.status(403).render('error', {
      titel: 'Geen toegang',
      boodschap: 'Je hebt geen rechten om deze pagina te bekijken. Dit gedeelte is alleen voor beheerders.'
    });
  }
  next();
}

function maakToken(user) {
  return jwt.sign(
    { id: user.id, naam: user.naam, email: user.email, rol: user.rol },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { haalGebruikerOp, vereistIngelogd, vereistAdmin, maakToken, JWT_SECRET };
