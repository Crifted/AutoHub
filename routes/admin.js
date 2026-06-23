const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { vereistAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/admin', vereistAdmin, adminController.dashboard);

// auto's CRUD
router.get('/admin/autos', vereistAdmin, adminController.overzicht);
router.post('/admin/autos/bulk', vereistAdmin, adminController.bulkActie);
router.get('/admin/autos/nieuw', vereistAdmin, adminController.paginaNieuw);
router.post('/admin/autos/nieuw', vereistAdmin, upload.single('afbeelding'), adminController.aanmaken);
router.get('/admin/autos/:id/bewerken', vereistAdmin, adminController.paginaBewerken);
router.post('/admin/autos/:id/bewerken', vereistAdmin, upload.single('afbeelding'), adminController.bijwerken);
router.post('/admin/autos/:id/verwijderen', vereistAdmin, adminController.verwijderen);

// galerij-foto's beheren
router.post('/admin/autos/:id/foto', vereistAdmin, upload.single('foto'), adminController.fotoToevoegen);
router.post('/admin/autos/:id/foto/:fotoId/verwijderen', vereistAdmin, adminController.fotoVerwijderen);

// gebruikersbeheer
router.get('/admin/gebruikers', vereistAdmin, adminController.gebruikers);
router.post('/admin/gebruikers/:id/rol', vereistAdmin, adminController.gebruikerRol);
router.post('/admin/gebruikers/:id/verwijderen', vereistAdmin, adminController.gebruikerVerwijderen);

router.get('/admin/berichten', vereistAdmin, adminController.berichten);

router.get('/admin/proefritten', vereistAdmin, adminController.proefritten);
router.post('/admin/proefritten/:id/status', vereistAdmin, adminController.proefritStatus);

router.get('/admin/reviews', vereistAdmin, adminController.reviews);
router.post('/admin/reviews/:id/verwijderen', vereistAdmin, adminController.reviewVerwijderen);

module.exports = router;
