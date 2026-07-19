const express = require('express');
const router = express.Router();
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  toggleClientActive,
  getMyData,
  getDashboardStats,
} = require('../controllers/clientController');
const { authenticate, requireAdmin, requireClientOrAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, getAllClients);
router.get('/dashboard-stats', authenticate, requireAdmin, getDashboardStats);
router.get('/me', authenticate, getMyData);
router.get('/:id', authenticate, requireClientOrAdmin, getClientById);
router.post('/', authenticate, requireAdmin, createClient);
router.put('/:id', authenticate, requireClientOrAdmin, updateClient);
router.patch('/:id/toggle-active', authenticate, requireAdmin, toggleClientActive);

module.exports = router;
