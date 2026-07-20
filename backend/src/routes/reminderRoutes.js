const express = require('express');
const router = express.Router();
const { getReminders, createReminder, markAsRead, deleteReminder, replyToReminder } = require('../controllers/reminderController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, getReminders);
router.post('/', authenticate, requireAdmin, createReminder);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/:id/reply', authenticate, replyToReminder);
router.delete('/:id', authenticate, requireAdmin, deleteReminder);

module.exports = router;
