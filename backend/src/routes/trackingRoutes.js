const express = require('express');
const router = express.Router();
const {
  getWeightLogs, addWeightLog, deleteWeightLog,
  getBodyMeasurements, addBodyMeasurement, deleteBodyMeasurement,
  getCardioLogs, addCardioLog, deleteCardioLog,
  getDailyTargets, upsertDailyTarget,
} = require('../controllers/trackingController');
const { authenticate, requireClientOrAdmin } = require('../middleware/auth');

// Weight
router.get('/weight/:clientId', authenticate, requireClientOrAdmin, getWeightLogs);
router.post('/weight/:clientId', authenticate, requireClientOrAdmin, addWeightLog);
router.delete('/weight/log/:logId', authenticate, deleteWeightLog);

// Body Measurement
router.get('/body/:clientId', authenticate, requireClientOrAdmin, getBodyMeasurements);
router.post('/body/:clientId', authenticate, requireClientOrAdmin, addBodyMeasurement);
router.delete('/body/log/:measurementId', authenticate, deleteBodyMeasurement);

// Cardio
router.get('/cardio/:clientId', authenticate, requireClientOrAdmin, getCardioLogs);
router.post('/cardio/:clientId', authenticate, requireClientOrAdmin, addCardioLog);
router.delete('/cardio/log/:logId', authenticate, deleteCardioLog);

// Daily Targets
router.get('/targets/:clientId', authenticate, requireClientOrAdmin, getDailyTargets);
router.post('/targets/:clientId/:date', authenticate, requireClientOrAdmin, upsertDailyTarget);

module.exports = router;
