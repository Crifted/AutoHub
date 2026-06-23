const express = require('express');
const router = express.Router();
const favorietController = require('../controllers/favorietController');
const { vereistIngelogd } = require('../middleware/auth');

router.get('/favorieten', vereistIngelogd, favorietController.overzicht);
router.post('/favorieten/toggle/:autoId', vereistIngelogd, favorietController.toggle);

module.exports = router;
