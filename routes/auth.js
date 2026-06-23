const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.paginaLogin);
router.post('/login', authController.login);

router.get('/registreren', authController.paginaRegistreren);
router.post('/registreren', authController.registreren);

router.get('/uitloggen', authController.uitloggen);

module.exports = router;
