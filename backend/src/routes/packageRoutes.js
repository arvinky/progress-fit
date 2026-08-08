const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Protect all package routes with admin middleware
router.use(authenticate);
router.use(requireAdmin);

router.get('/', packageController.getAllPackages);
router.post('/', packageController.createPackage);
router.post('/:packageId/sessions', packageController.addSession);
router.delete('/:packageId/sessions/:sessionId', packageController.deleteSession);
router.delete('/:packageId', packageController.deletePackage);

module.exports = router;
