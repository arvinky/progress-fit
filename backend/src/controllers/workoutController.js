const prisma = require('../lib/prisma');

// Helper: get clientId based on user role
const resolveClientId = async (req, paramId) => {
  if (req.user.role === 'ADMIN') {
    return parseInt(paramId);
  }
  const client = await prisma.client.findUnique({ where: { userId: req.user.id } });
  return client?.id;
};

// ==================== WORKOUT SESSIONS & EXERCISES ====================

// GET /api/workout/sessions/:clientId
const getWorkoutSessions = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const sessions = await prisma.workoutSession.findMany({
      where: { clientId },
      include: { exercises: true },
      orderBy: { startTime: 'desc' },
    });

    res.json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/workout/sessions/:clientId
const addWorkoutSession = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const { sessionName, durationMin, note, startTime, endTime, exercises } = req.body;

    // Calculate metrics
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;

    if (exercises && Array.isArray(exercises)) {
      exercises.forEach((ex) => {
        totalSets += parseInt(ex.sets || 0);
        totalReps += parseInt(ex.sets || 0) * parseInt(ex.reps || 0);
        totalVolume += parseFloat(ex.weight || 0) * parseInt(ex.sets || 0) * parseInt(ex.reps || 0);
      });
    }

    // Create session
    const session = await prisma.workoutSession.create({
      data: {
        clientId,
        sessionName,
        durationMin: durationMin ? parseInt(durationMin) : null,
        note,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null,
        totalSets,
        totalReps,
        totalVolume,
        exercises: {
          create: exercises.map((ex) => ({
            exerciseName: ex.exerciseName,
            sets: parseInt(ex.sets),
            reps: parseInt(ex.reps),
            weight: parseFloat(ex.weight),
            rpe: ex.rpe ? parseInt(ex.rpe) : null,
            note: ex.note,
          })),
        },
      },
      include: { exercises: true },
    });

    // Check and update Personal Records (PR) automatically
    if (exercises && Array.isArray(exercises)) {
      for (const ex of exercises) {
        const weight = parseFloat(ex.weight);
        const name = ex.exerciseName;

        const currentPR = await prisma.personalRecord.findFirst({
          where: { clientId, exerciseName: name },
          orderBy: { weight: 'desc' },
        });

        if (!currentPR || weight > currentPR.weight) {
          await prisma.personalRecord.create({
            data: {
              clientId,
              exerciseName: name,
              weight,
              reps: parseInt(ex.reps),
              achievedAt: startTime ? new Date(startTime) : new Date(),
            },
          });
        }
      }
    }

    res.status(201).json({ message: 'Sesi latihan berhasil dicatat', session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE /api/workout/sessions/:sessionId
const deleteWorkoutSession = async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    await prisma.workoutSession.delete({ where: { id: sessionId } });
    res.json({ message: 'Sesi latihan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ==================== PERSONAL RECORDS ====================

// GET /api/workout/pr/:clientId
const getPersonalRecords = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const records = await prisma.personalRecord.findMany({
      where: { clientId },
      orderBy: { weight: 'desc' },
    });

    // Group by exercise name to get the highest PR per exercise, plus history
    const highestPRs = {};
    records.forEach((rec) => {
      if (!highestPRs[rec.exerciseName] || rec.weight > highestPRs[rec.exerciseName].weight) {
        highestPRs[rec.exerciseName] = rec;
      }
    });

    res.json({ allRecords: records, highestPRs: Object.values(highestPRs) });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ==================== STRENGTH TARGETS ====================

// GET /api/workout/targets/:clientId
const getStrengthTargets = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const targets = await prisma.strengthTarget.findMany({
      where: { clientId },
    });

    res.json({ targets });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/workout/targets/:clientId
const setStrengthTarget = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const { exerciseName, targetWeight, note } = req.body;
    const setByAdmin = req.user.role === 'ADMIN';

    const target = await prisma.strengthTarget.upsert({
      where: { clientId_exerciseName: { clientId, exerciseName } },
      update: { targetWeight: parseFloat(targetWeight), note, setByAdmin },
      create: { clientId, exerciseName, targetWeight: parseFloat(targetWeight), note, setByAdmin },
    });

    res.json({ message: 'Target kekuatan berhasil disimpan', target });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ==================== SCHEDULES ====================

// GET /api/workout/schedules/:clientId
const getSchedules = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const schedules = await prisma.schedule.findMany({
      where: { clientId },
      orderBy: { dayOfWeek: 'asc' },
    });

    res.json({ schedules });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/workout/schedules/:clientId
const addSchedule = async (req, res) => {
  try {
    const clientId = await resolveClientId(req, req.params.clientId);
    if (!clientId) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const { dayOfWeek, programName, description } = req.body;

    const schedule = await prisma.schedule.create({
      data: {
        clientId,
        dayOfWeek,
        programName,
        description,
      },
    });

    res.status(201).json({ message: 'Jadwal berhasil ditambahkan', schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// PUT /api/workout/schedules/:scheduleId
const updateSchedule = async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId);
    const { dayOfWeek, programName, description, isActive } = req.body;

    const schedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: { dayOfWeek, programName, description, isActive },
    });

    res.json({ message: 'Jadwal berhasil diupdate', schedule });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE /api/workout/schedules/:scheduleId
const deleteSchedule = async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId);
    await prisma.schedule.delete({ where: { id: scheduleId } });
    res.json({ message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/workout/schedules/copy
const copySchedule = async (req, res) => {
  try {
    const { fromClientId, toClientId } = req.body;

    // Get schedules of source client
    const sourceSchedules = await prisma.schedule.findMany({
      where: { clientId: parseInt(fromClientId) },
    });

    if (sourceSchedules.length === 0) {
      return res.status(400).json({ message: 'Client asal tidak memiliki jadwal' });
    }

    // Delete existing schedules for destination client
    await prisma.schedule.deleteMany({
      where: { clientId: parseInt(toClientId) },
    });

    // Copy schedules
    const dataToCreate = sourceSchedules.map((s) => ({
      clientId: parseInt(toClientId),
      dayOfWeek: s.dayOfWeek,
      programName: s.programName,
      description: s.description,
      isActive: s.isActive,
    }));

    await prisma.schedule.createMany({ data: dataToCreate });

    res.json({ message: 'Jadwal berhasil disalin ke client tujuan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  getWorkoutSessions, addWorkoutSession, deleteWorkoutSession,
  getPersonalRecords,
  getStrengthTargets, setStrengthTarget,
  getSchedules, addSchedule, updateSchedule, deleteSchedule, copySchedule,
};
