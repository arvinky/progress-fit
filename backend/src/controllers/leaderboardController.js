const prisma = require('../lib/prisma');

// GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { category, period, program } = req.query; // category: weightLoss, benchPress, squat, streak, cardio, attendance. period: weekly, monthly, yearly. program: BULKING, CUTTING, MAINTENANCE
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

    // Helper to validate and check program
    const validProgram = ['BULKING', 'CUTTING', 'MAINTENANCE'].includes(program) ? program : null;

    // 1. Weight Progress Category (Progress menuju target berat badan)
    if (category === 'weightLoss') {
      const whereClause = { isActive: true };
      if (validProgram) {
        whereClause.program = validProgram;
      }

      const clients = await prisma.client.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true } },
          weightLogs: {
            where: { loggedAt: { gte: startDate } },
            orderBy: { loggedAt: 'desc' },
          },
        },
      });

      boardData = clients.map((c) => {
        const latestWeight = c.weightLogs[0]?.weight ?? c.initialWeight;
        const targetWeight = c.targetWeight;
        const initialWeight = c.initialWeight;
        const prog = c.program; // 'CUTTING', 'BULKING', 'MAINTENANCE'

        let progressPercent = 0;
        let label = '';

        if (prog === 'CUTTING') {
          const totalNeeded = initialWeight - targetWeight;
          const lostWeight = initialWeight - latestWeight; // positive = lost weight
          if (totalNeeded <= 0.1) {
            progressPercent = latestWeight <= targetWeight ? 100 : 0;
          } else {
            progressPercent = Math.min(100, (lostWeight / totalNeeded) * 100);
          }
          label = `Turun: ${Math.max(0, lostWeight).toFixed(1)} kg (Target turun ${Math.max(0, totalNeeded).toFixed(1)} kg)`;
        } else if (prog === 'BULKING') {
          const totalNeeded = targetWeight - initialWeight;
          const gainedWeight = latestWeight - initialWeight; // positive = gained weight
          if (totalNeeded <= 0.1) {
            progressPercent = latestWeight >= targetWeight ? 100 : 0;
          } else {
            progressPercent = Math.min(100, (gainedWeight / totalNeeded) * 100);
          }
          label = `Naik: ${Math.max(0, gainedWeight).toFixed(1)} kg (Target naik ${Math.max(0, totalNeeded).toFixed(1)} kg)`;
        } else {
          // MAINTENANCE
          const deviation = Math.abs(latestWeight - initialWeight);
          progressPercent = Math.max(0, 100 - (deviation * 20)); // -20% score for every 1kg deviation
          label = `Deviasi: ${deviation.toFixed(1)} kg (Stabil menjaga berat badan)`;
        }

        return {
          clientId: c.id,
          userId: c.user.id,
          name: c.user.name,
          value: parseFloat(Math.max(0, progressPercent).toFixed(1)),
          unit: '%',
          details: label || `${initialWeight}kg → ${latestWeight}kg`,
        };
      }).sort((a, b) => b.value - a.value);
    }

    // 2. Bench Press Category (Highest PR)
    else if (category === 'benchPress') {
      const wherePr = {
        exerciseName: { contains: 'bench press' },
        achievedAt: { gte: startDate },
      };
      if (validProgram) {
        wherePr.client = { program: validProgram };
      }

      const prs = await prisma.personalRecord.findMany({
        where: wherePr,
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
      const wherePr = {
        exerciseName: { contains: 'squat' },
        achievedAt: { gte: startDate },
      };
      if (validProgram) {
        wherePr.client = { program: validProgram };
      }

      const prs = await prisma.personalRecord.findMany({
        where: wherePr,
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
      const whereSess = { startTime: { gte: startDate } };
      if (validProgram) {
        whereSess.client = { program: validProgram };
      }

      const sessions = await prisma.workoutSession.findMany({
        where: whereSess,
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
      const whereCardio = { loggedAt: { gte: startDate } };
      if (validProgram) {
        whereCardio.client = { program: validProgram };
      }

      const logs = await prisma.cardioLog.findMany({
        where: whereCardio,
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
      const whereTarget = {
        date: { gte: startDate },
        workoutDone: true,
      };
      if (validProgram) {
        whereTarget.client = { program: validProgram };
      }

      const targets = await prisma.dailyTarget.findMany({
        where: whereTarget,
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
