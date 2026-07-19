const prisma = require('../lib/prisma');

// Helper: get clientId based on user role
const resolveClientId = async (req, paramId) => {
  if (req.user.role === 'ADMIN') {
    return parseInt(paramId);
  }
  const client = await prisma.client.findUnique({ where: { userId: req.user.id } });
  return client?.id;
};

// ==================== WEIGHT LOGS ====================

// GET /api/weight/:clientId
const getWeightLogs = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const logs = await prisma.weightLog.findMany({
      where: { clientId },
      orderBy: { loggedAt: 'asc' },
    });

    const client = await prisma.client.findUnique({ where: { id: clientId } });

    res.json({ logs, initialWeight: client.initialWeight, targetWeight: client.targetWeight });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/weight/:clientId
const addWeightLog = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const { weight, note, loggedAt } = req.body;

    const log = await prisma.weightLog.create({
      data: {
        clientId,
        weight: parseFloat(weight),
        note,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      },
    });

    res.status(201).json({ message: 'Log berat badan berhasil ditambahkan', log });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE /api/weight/:logId
const deleteWeightLog = async (req, res) => {
  try {
    await prisma.weightLog.delete({ where: { id: parseInt(req.params.logId) } });
    res.json({ message: 'Log berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ==================== BODY MEASUREMENTS ====================

// GET /api/body/:clientId
const getBodyMeasurements = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const measurements = await prisma.bodyMeasurement.findMany({
      where: { clientId },
      orderBy: { weekNumber: 'asc' },
    });

    res.json({ measurements });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/body/:clientId
const addBodyMeasurement = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const { weekNumber, chest, waist, hips, arms, thighs, calves, neck, note, measuredAt } = req.body;

    // Check if week already exists
    const existing = await prisma.bodyMeasurement.findFirst({
      where: { clientId, weekNumber: parseInt(weekNumber) },
    });

    let measurement;
    if (existing) {
      measurement = await prisma.bodyMeasurement.update({
        where: { id: existing.id },
        data: { chest, waist, hips, arms, thighs, calves, neck, note, measuredAt: measuredAt ? new Date(measuredAt) : undefined },
      });
    } else {
      measurement = await prisma.bodyMeasurement.create({
        data: {
          clientId,
          weekNumber: parseInt(weekNumber),
          chest: chest ? parseFloat(chest) : null,
          waist: waist ? parseFloat(waist) : null,
          hips: hips ? parseFloat(hips) : null,
          arms: arms ? parseFloat(arms) : null,
          thighs: thighs ? parseFloat(thighs) : null,
          calves: calves ? parseFloat(calves) : null,
          neck: neck ? parseFloat(neck) : null,
          note,
          measuredAt: measuredAt ? new Date(measuredAt) : new Date(),
        },
      });
    }

    res.status(201).json({ message: 'Pengukuran berhasil disimpan', measurement });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE /api/body/:measurementId
const deleteBodyMeasurement = async (req, res) => {
  try {
    await prisma.bodyMeasurement.delete({ where: { id: parseInt(req.params.measurementId) } });
    res.json({ message: 'Pengukuran berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ==================== CARDIO LOGS ====================

// GET /api/cardio/:clientId
const getCardioLogs = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const { from, to } = req.query;
    const where = { clientId };
    if (from) where.loggedAt = { gte: new Date(from) };
    if (to) where.loggedAt = { ...where.loggedAt, lte: new Date(to) };

    const logs = await prisma.cardioLog.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
    });

    // Weekly summary
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const weeklyLogs = logs.filter((l) => l.loggedAt >= startOfWeek);
    const weeklyStats = {
      totalDuration: weeklyLogs.reduce((s, l) => s + l.durationMin, 0),
      totalDistance: weeklyLogs.reduce((s, l) => s + (l.distanceKm || 0), 0),
      totalCalories: weeklyLogs.reduce((s, l) => s + (l.calories || 0), 0),
      sessions: weeklyLogs.length,
    };

    res.json({ logs, weeklyStats });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/cardio/:clientId
const addCardioLog = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const { cardioType, durationMin, distanceKm, calories, heartRate, note, loggedAt } = req.body;

    const log = await prisma.cardioLog.create({
      data: {
        clientId,
        cardioType,
        durationMin: parseInt(durationMin),
        distanceKm: distanceKm ? parseFloat(distanceKm) : null,
        calories: calories ? parseInt(calories) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        note,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      },
    });

    res.status(201).json({ message: 'Log cardio berhasil ditambahkan', log });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE /api/cardio/:logId
const deleteCardioLog = async (req, res) => {
  try {
    await prisma.cardioLog.delete({ where: { id: parseInt(req.params.logId) } });
    res.json({ message: 'Log cardio berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ==================== DAILY TARGETS ====================

// GET /api/targets/:clientId
const getDailyTargets = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const { from, to } = req.query;
    const where = { clientId };
    if (from) where.date = { gte: new Date(from) };
    if (to) where.date = { ...where.date, lte: new Date(to) };

    const targets = await prisma.dailyTarget.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 30,
    });

    // Compliance rate
    const completedTargets = targets.filter((t) => t.workoutDone && t.proteinMet && t.waterMet && t.sleepMet && t.stepsMet);
    const complianceRate = targets.length > 0 ? Math.round((completedTargets.length / targets.length) * 100) : 0;

    res.json({ targets, complianceRate });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST/PUT /api/targets/:clientId/:date
const upsertDailyTarget = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const date = new Date(req.params.date);
    const { workoutDone, proteinMet, waterMet, sleepMet, stepsMet, stepsCount, waterLiters, sleepHours, note } = req.body;

    const target = await prisma.dailyTarget.upsert({
      where: { clientId_date: { clientId, date } },
      update: { workoutDone, proteinMet, waterMet, sleepMet, stepsMet, stepsCount, waterLiters, sleepHours, note },
      create: { clientId, date, workoutDone, proteinMet, waterMet, sleepMet, stepsMet, stepsCount, waterLiters, sleepHours, note },
    });

    res.json({ message: 'Target harian berhasil disimpan', target });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  getWeightLogs, addWeightLog, deleteWeightLog,
  getBodyMeasurements, addBodyMeasurement, deleteBodyMeasurement,
  getCardioLogs, addCardioLog, deleteCardioLog,
  getDailyTargets, upsertDailyTarget,
};
