require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');

const { testConnection } = require('./config/database');
const { haalGebruikerOp } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- view engine ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---- standaard middleware ----
app.use(express.urlencoded({ extended: true })); // formulierdata lezen
app.use(express.json());                          // JSON-data lezen (voor fetch/AJAX)
app.use(cookieParser());
app.use(methodOverride('_method'));                // staat PUT/DELETE toe via formulieren
app.use(express.static(path.join(__dirname, 'public'))); // CSS, JS, afbeeldingen

// ---- eigen middleware ----
app.use(haalGebruikerOp); // zet req.user (null of gegevens) op elk verzoek

// ---- routes ----
app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/favorieten'));
app.use('/', require('./routes/contact'));
app.use('/', require('./routes/admin'));

// ---- 404 afhandelen ----
app.use((req, res) => {
  res.status(404).render('error', {
    titel: 'Pagina niet gevonden',
    boodschap: 'De pagina die je zoekt bestaat niet (meer).'
  });
});

// ---- server starten ----
app.listen(PORT, async () => {
  console.log('============================================');
  console.log('AutoHub draait op http://localhost:' + PORT);
  console.log('============================================');
  await testConnection();
});
