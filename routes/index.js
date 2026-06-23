const express = require('express');
const router = express.Router();
const autoController = require('../controllers/autoController');
const reviewController = require('../controllers/reviewController');
const proefritController = require('../controllers/proefritController');
const { vereistIngelogd } = require('../middleware/auth');

router.get('/', autoController.home);
router.get('/aanbod', autoController.overzicht);
router.get('/vergelijken', autoController.vergelijken);
router.get('/api/zoek', autoController.apiZoek);
router.get('/auto/:id', autoController.detail);

router.post('/auto/:autoId/review', vereistIngelogd, reviewController.plaatsen);
router.post('/auto/:autoId/proefrit', proefritController.aanvragen);

module.exports = router;
