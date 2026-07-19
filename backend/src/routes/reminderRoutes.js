const express = require('express');
const router = express.Router();
const { getReminders, createReminder, markAsRead, deleteReminder } = require('../controllers/reminderController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, getReminders);
router.post('/', authenticate, requireAdmin, createReminder);
router.patch('/:id/read', authenticate, markAsRead);
router.delete('/:id', authenticate, requireAdmin, deleteReminder);

module.exports = router;
