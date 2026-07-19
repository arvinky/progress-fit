const express = require('express');
const router = express.Router();
const {
  getWorkoutSessions, addWorkoutSession, deleteWorkoutSession,
  getPersonalRecords,
  getStrengthTargets, setStrengthTarget,
  getSchedules, addSchedule, updateSchedule, deleteSchedule, copySchedule,
} = require('../controllers/workoutController');
const { authenticate, requireAdmin, requireClientOrAdmin } = require('../middleware/auth');

// Sessions
router.get('/sessions/:clientId', authenticate, requireClientOrAdmin, getWorkoutSessions);
router.post('/sessions/:clientId', authenticate, requireClientOrAdmin, addWorkoutSession);
router.delete('/sessions/:sessionId', authenticate, requireClientOrAdmin, deleteWorkoutSession);

// Personal Records
router.get('/pr/:clientId', authenticate, requireClientOrAdmin, getPersonalRecords);

// Strength Targets
router.get('/targets/:clientId', authenticate, requireClientOrAdmin, getStrengthTargets);
router.post('/targets/:clientId', authenticate, requireClientOrAdmin, setStrengthTarget);

// Schedules
router.post('/schedules/copy', authenticate, requireAdmin, copySchedule);
router.get('/schedules/:clientId', authenticate, requireClientOrAdmin, getSchedules);
router.post('/schedules/:clientId', authenticate, requireAdmin, addSchedule);
router.put('/schedules/:scheduleId', authenticate, requireAdmin, updateSchedule);
router.delete('/schedules/:scheduleId', authenticate, requireAdmin, deleteSchedule);

module.exports = router;
