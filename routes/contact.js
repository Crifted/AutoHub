const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.get('/contact', contactController.paginaContact);
router.post('/contact', contactController.versturen);

module.exports = router;
