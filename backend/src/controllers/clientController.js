const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

// GET /api/clients - Admin: list all clients
const getAllClients = async (req, res) => {
  try {
    const { search, program, isActive } = req.query;
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (program) where.program = program;
    if (search) {
      where.user = { name: { contains: search } };
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        weightLogs: { orderBy: { loggedAt: 'desc' }, take: 1 },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const formatted = clients.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.user.name,
      email: c.user.email,
      age: c.age,
      height: c.height,
      initialWeight: c.initialWeight,
      targetWeight: c.targetWeight,
      currentWeight: c.weightLogs[0]?.weight || c.initialWeight,
      program: c.program,
      isActive: c.isActive,
      joinedAt: c.joinedAt,
    }));

    res.json({ clients: formatted, total: formatted.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// GET /api/clients/:id
const getClientById = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);

    // If client role, only allow own data
    if (req.user.role === 'CLIENT') {
      const ownClient = await prisma.client.findUnique({ where: { userId: req.user.id } });
      if (!ownClient || ownClient.id !== clientId) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        weightLogs: { orderBy: { loggedAt: 'desc' }, take: 10 },
        schedules: true,
      },
    });

    if (!client) return res.status(404).json({ message: 'Client tidak ditemukan' });
    res.json({ client });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// POST /api/clients - Admin creates a client with user account
const createClient = async (req, res) => {
  try {
    const { name, email, password, age, height, initialWeight, targetWeight, program } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email sudah terdaftar' });

    const hashed = await bcrypt.hash(password || 'progressfit123', 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: 'CLIENT',
        client: {
          create: {
            age,
            height,
            initialWeight,
            targetWeight,
            program: program || 'CUTTING',
          },
        },
      },
      include: { client: true },
    });

    res.status(201).json({
      message: 'Client berhasil ditambahkan',
      client: user.client,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// PUT /api/clients/:id
const updateClient = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const { name, email, age, height, initialWeight, targetWeight, program, isActive } = req.body;

    // If client, only own data
    if (req.user.role === 'CLIENT') {
      const ownClient = await prisma.client.findUnique({ where: { userId: req.user.id } });
      if (!ownClient || ownClient.id !== clientId) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return res.status(404).json({ message: 'Client tidak ditemukan' });

    // Update user info if provided
    if (name || email) {
      await prisma.user.update({
        where: { id: client.userId },
        data: { ...(name && { name }), ...(email && { email }) },
      });
    }

    const updated = await prisma.client.update({
      where: { id: clientId },
      data: {
        ...(age !== undefined && { age }),
        ...(height !== undefined && { height }),
        ...(initialWeight !== undefined && { initialWeight }),
        ...(targetWeight !== undefined && { targetWeight }),
        ...(program && { program }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ message: 'Data client berhasil diperbarui', client: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// PATCH /api/clients/:id/toggle-active
const toggleClientActive = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return res.status(404).json({ message: 'Client tidak ditemukan' });

    const updated = await prisma.client.update({
      where: { id: clientId },
      data: { isActive: !client.isActive },
    });

    res.json({
      message: `Client ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      client: updated,
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// GET /api/clients/me - Client gets own data
const getMyData = async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        weightLogs: { orderBy: { loggedAt: 'desc' }, take: 5 },
        schedules: { where: { isActive: true } },
      },
    });

    if (!client) return res.status(404).json({ message: 'Data client tidak ditemukan' });
    res.json({ client });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// GET /api/clients/stats/dashboard - Admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [totalActive, newThisMonth, totalClients] = await Promise.all([
      prisma.client.count({ where: { isActive: true } }),
      prisma.client.count({ where: { joinedAt: { gte: startOfMonth } } }),
      prisma.client.count(),
    ]);

    // Clients who reached target (currentWeight <= targetWeight)
    const allClients = await prisma.client.findMany({
      include: { weightLogs: { orderBy: { loggedAt: 'desc' }, take: 1 } },
    });

    let reachedTarget = 0;
    for (const c of allClients) {
      const currentWeight = c.weightLogs[0]?.weight || c.initialWeight;
      if (currentWeight <= c.targetWeight) reachedTarget++;
    }

    // Clients who haven't checked in this week (no workout session this week)
    const notCheckedIn = await prisma.client.count({
      where: {
        isActive: true,
        workoutSessions: {
          none: { startTime: { gte: startOfWeek } },
        },
      },
    });

    // Today's schedules
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const todayDay = days[now.getDay()];
    const todaySchedules = await prisma.schedule.findMany({
      where: { dayOfWeek: todayDay, isActive: true },
      include: { client: { include: { user: { select: { name: true } } } } },
    });

    res.json({
      stats: {
        totalActive,
        newThisMonth,
        totalClients,
        reachedTarget,
        notCheckedIn,
        todaySchedulesCount: todaySchedules.length,
      },
      todaySchedules: todaySchedules.map((s) => ({
        clientName: s.client.user.name,
        program: s.programName,
        day: s.dayOfWeek,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = { getAllClients, getClientById, createClient, updateClient, toggleClientActive, getMyData, getDashboardStats };
