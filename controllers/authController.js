const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { maakToken } = require('../middleware/auth');

const authController = {

  // GET /login
  paginaLogin(req, res) {
    res.render('login', { titel: 'Inloggen - AutoHub', fout: null, melding: req.query.melding || null });
  },

  // GET /registreren
  paginaRegistreren(req, res) {
    res.render('registreren', { titel: 'Registreren - AutoHub', fout: null });
  },

  // POST /login
  async login(req, res) {
    try {
      const { email, wachtwoord } = req.body;

      if (!email || !wachtwoord) {
        return res.status(400).render('login', { titel: 'Inloggen - AutoHub', fout: 'Vul zowel e-mailadres als wachtwoord in.', melding: null });
      }

      const user = await User.vindOpEmail(email);
      if (!user) {
        return res.status(401).render('login', { titel: 'Inloggen - AutoHub', fout: 'E-mailadres of wachtwoord is onjuist.', melding: null });
      }

      const klopt = await bcrypt.compare(wachtwoord, user.wachtwoord_hash);
      if (!klopt) {
        return res.status(401).render('login', { titel: 'Inloggen - AutoHub', fout: 'E-mailadres of wachtwoord is onjuist.', melding: null });
      }

      const token = maakToken(user);
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dagen
      });

      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).render('login', { titel: 'Inloggen - AutoHub', fout: 'Er ging iets mis bij het inloggen. Probeer het opnieuw.', melding: null });
    }
  },

  // POST /registreren
  async registreren(req, res) {
    try {
      const { naam, email, wachtwoord, wachtwoordHerhaal } = req.body;

      if (!naam || !email || !wachtwoord || !wachtwoordHerhaal) {
        return res.status(400).render('registreren', { titel: 'Registreren - AutoHub', fout: 'Vul alle velden in.' });
      }
      if (wachtwoord !== wachtwoordHerhaal) {
        return res.status(400).render('registreren', { titel: 'Registreren - AutoHub', fout: 'De wachtwoorden komen niet overeen.' });
      }
      if (wachtwoord.length < 6) {
        return res.status(400).render('registreren', { titel: 'Registreren - AutoHub', fout: 'Wachtwoord moet minimaal 6 tekens bevatten.' });
      }

      const bestaat = await User.vindOpEmail(email);
      if (bestaat) {
        return res.status(400).render('registreren', { titel: 'Registreren - AutoHub', fout: 'Er bestaat al een account met dit e-mailadres.' });
      }

      const wachtwoordHash = await bcrypt.hash(wachtwoord, 10);
      const userId = await User.aanmaken({ naam, email, wachtwoordHash, rol: 'user' });
      const nieuweUser = await User.vindOpId(userId);

      const token = maakToken(nieuweUser);
      res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).render('registreren', { titel: 'Registreren - AutoHub', fout: 'Er ging iets mis bij het registreren. Probeer het opnieuw.' });
    }
  },

  // GET /uitloggen
  uitloggen(req, res) {
    res.clearCookie('token');
    res.redirect('/');
  }
};

module.exports = authController;
