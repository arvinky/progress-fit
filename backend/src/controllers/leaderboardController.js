const prisma = require('../lib/prisma');

// GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { category, period } = req.query; // category: weightLoss, benchPress, squat, streak, cardio, attendance. period: weekly, monthly, yearly
    const isClient = req.user.role === 'CLIENT';
    const userId = req.user.id;

    // Resolve date range based on period
    const now = new Date();
    let startDate = new Date();
    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'yearly') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // Default monthly
      startDate.setMonth(now.getMonth() - 1);
    }

    let boardData = [];

    // 1. Weight Loss Category
    if (category === 'weightLoss') {
      const clients = await prisma.client.findMany({
        where: { isActive: true },
        include: {
          user: { select: { id: true, name: true } },
          weightLogs: {
            where: { loggedAt: { gte: startDate } },
            orderBy: { loggedAt: 'desc' },
          },
        },
      });

      boardData = clients.map((c) => {
        const latestWeight = c.weightLogs[0]?.weight || c.initialWeight;
        const loss = c.initialWeight - latestWeight;
        const percentage = c.initialWeight > 0 ? (loss / c.initialWeight) * 100 : 0;
        return {
          clientId: c.id,
          userId: c.user.id,
          name: c.user.name,
          value: parseFloat(loss.toFixed(1)),
          unit: 'kg',
          details: `Awal: ${c.initialWeight}kg → Sekarang: ${latestWeight}kg (${percentage.toFixed(1)}%)`,
        };
      }).sort((a, b) => b.value - a.value);
    }

    // 2. Bench Press Category (Highest PR)
    else if (category === 'benchPress') {
      const prs = await prisma.personalRecord.findMany({
        where: {
          exerciseName: { contains: 'bench press' },
          achievedAt: { gte: startDate },
        },
        include: {
          client: { include: { user: { select: { id: true, name: true } } } },
        },
      });

      // Group by client to find highest
      const grouped = {};
      prs.forEach((pr) => {
        const cId = pr.clientId;
        if (!grouped[cId] || pr.weight > grouped[cId].weight) {
          grouped[cId] = pr;
        }
      });

      boardData = Object.values(grouped).map((pr) => ({
        clientId: pr.clientId,
        userId: pr.client.user.id,
        name: pr.client.user.name,
        value: pr.weight,
        unit: 'kg',
        details: `Tercapai pada: ${pr.achievedAt.toLocaleDateString('id-ID')}`,
      })).sort((a, b) => b.value - a.value);
    }

    // 3. Squat Category (Highest PR)
    else if (category === 'squat') {
      const prs = await prisma.personalRecord.findMany({
        where: {
          exerciseName: { contains: 'squat' },
          achievedAt: { gte: startDate },
        },
        include: {
          client: { include: { user: { select: { id: true, name: true } } } },
        },
      });

      // Group by client to find highest
      const grouped = {};
      prs.forEach((pr) => {
        const cId = pr.clientId;
        if (!grouped[cId] || pr.weight > grouped[cId].weight) {
          grouped[cId] = pr;
        }
      });

      boardData = Object.values(grouped).map((pr) => ({
        clientId: pr.clientId,
        userId: pr.client.user.id,
        name: pr.client.user.name,
        value: pr.weight,
        unit: 'kg',
        details: `Tercapai pada: ${pr.achievedAt.toLocaleDateString('id-ID')}`,
      })).sort((a, b) => b.value - a.value);
    }

    // 4. Streak Latihan Terpanjang (Total workout sessions in range)
    else if (category === 'streak') {
      const sessions = await prisma.workoutSession.findMany({
        where: { startTime: { gte: startDate } },
        include: {
          client: { include: { user: { select: { id: true, name: true } } } },
        },
      });

      const grouped = {};
      sessions.forEach((s) => {
        const cId = s.clientId;
        if (!grouped[cId]) {
          grouped[cId] = {
            clientId: cId,
            userId: s.client.user.id,
            name: s.client.user.name,
            count: 0,
          };
        }
        grouped[cId].count++;
      });

      boardData = Object.values(grouped).map((g) => ({
        clientId: g.clientId,
        userId: g.userId,
        name: g.name,
        value: g.count,
        unit: 'Sesi',
        details: `Total ${g.count} kali latihan dalam periode ini`,
      })).sort((a, b) => b.value - a.value);
    }

    // 5. Cardio Terbanyak (Total Cardio Duration)
    else if (category === 'cardio') {
      const logs = await prisma.cardioLog.findMany({
        where: { loggedAt: { gte: startDate } },
        include: {
          client: { include: { user: { select: { id: true, name: true } } } },
        },
      });

      const grouped = {};
      logs.forEach((log) => {
        const cId = log.clientId;
        if (!grouped[cId]) {
          grouped[cId] = {
            clientId: cId,
            userId: log.client.user.id,
            name: log.client.user.name,
            duration: 0,
            calories: 0,
          };
        }
        grouped[cId].duration += log.durationMin;
        grouped[cId].calories += log.calories || 0;
      });

      boardData = Object.values(grouped).map((g) => ({
        clientId: g.clientId,
        userId: g.userId,
        name: g.name,
        value: g.duration,
        unit: 'Menit',
        details: `Membakar ~${g.calories} kalori`,
      })).sort((a, b) => b.value - a.value);
    }

    // 6. Kehadiran Terbaik (Daily Target workoutDone count)
    else if (category === 'attendance') {
      const targets = await prisma.dailyTarget.findMany({
        where: {
          date: { gte: startDate },
          workoutDone: true,
        },
        include: {
          client: { include: { user: { select: { id: true, name: true } } } },
        },
      });

      const grouped = {};
      targets.forEach((t) => {
        const cId = t.clientId;
        if (!grouped[cId]) {
          grouped[cId] = {
            clientId: cId,
            userId: t.client.user.id,
            name: t.client.user.name,
            count: 0,
          };
        }
        grouped[cId].count++;
      });

      boardData = Object.values(grouped).map((g) => ({
        clientId: g.clientId,
        userId: g.userId,
        name: g.name,
        value: g.count,
        unit: 'Hari',
        details: `Check-in latihan selama ${g.count} hari`,
      })).sort((a, b) => b.value - a.value);
    }

    // Anonimisasi nama jika user login adalah CLIENT
    const formattedBoard = boardData.map((item, index) => {
      let displayName = item.name;
      if (isClient && item.userId !== userId) {
        displayName = `FitMember #${index + 1}`;
      }
      return {
        rank: index + 1,
        clientId: item.clientId,
        name: displayName,
        value: item.value,
        unit: item.unit,
        details: item.details,
        isCurrentUser: item.userId === userId,
      };
    });

    res.json({ leaderboard: formattedBoard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = { getLeaderboard };
