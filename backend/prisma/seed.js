const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean old data to avoid duplicates
  await prisma.reminder.deleteMany();
  await prisma.dailyTarget.deleteMany();
  await prisma.cardioLog.deleteMany();
  await prisma.personalRecord.deleteMany();
  await prisma.strengthTarget.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.weightLog.deleteMany();
  await prisma.bodyMeasurement.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Admin/PT
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Coach Rian',
      email: 'admin@progressfit.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin Coach Rian created.');

  // 2. Create Client 1: Arvin (Bulking)
  const arvinPassword = await bcrypt.hash('client123', 12);
  const userArvin = await prisma.user.create({
    data: {
      name: 'Arvin Pratama',
      email: 'arvin@gmail.com',
      password: arvinPassword,
      role: 'CLIENT',
    },
  });

  const clientArvin = await prisma.client.create({
    data: {
      userId: userArvin.id,
      age: 24,
      height: 178,
      initialWeight: 75.5,
      targetWeight: 82,
      program: 'BULKING',
      isActive: true,
    },
  });

  // Client 2: Budi (Cutting)
  const userBudi = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@gmail.com',
      password: arvinPassword,
      role: 'CLIENT',
    },
  });

  const clientBudi = await prisma.client.create({
    data: {
      userId: userBudi.id,
      age: 29,
      height: 170,
      initialWeight: 85.0,
      targetWeight: 75.0,
      program: 'CUTTING',
      isActive: true,
    },
  });

  // Client 3: Citra (Maintenance)
  const userCitra = await prisma.user.create({
    data: {
      name: 'Citra Lestari',
      email: 'citra@gmail.com',
      password: arvinPassword,
      role: 'CLIENT',
    },
  });

  const clientCitra = await prisma.client.create({
    data: {
      userId: userCitra.id,
      age: 26,
      height: 162,
      initialWeight: 54.0,
      targetWeight: 53.0,
      program: 'MAINTENANCE',
      isActive: true,
    },
  });

  console.log('Clients created.');

  // 3. Add Weight Logs
  const weightLogs = [
    // Arvin (bulking, weight goes up)
    { clientId: clientArvin.id, weight: 75.5, note: 'Timbangan awal', loggedAt: new Date('2026-06-01') },
    { clientId: clientArvin.id, weight: 76.2, note: 'Nafsu makan baik', loggedAt: new Date('2026-06-08') },
    { clientId: clientArvin.id, weight: 77.0, note: 'Meningkatkan kalori', loggedAt: new Date('2026-06-15') },
    { clientId: clientArvin.id, weight: 77.8, note: 'Otot terlihat lebih tebal', loggedAt: new Date('2026-06-22') },
    { clientId: clientArvin.id, weight: 78.5, note: 'Kondisi stabil', loggedAt: new Date('2026-06-29') },
    // Budi (cutting, weight goes down)
    { clientId: clientBudi.id, weight: 85.0, note: 'Timbangan awal', loggedAt: new Date('2026-06-01') },
    { clientId: clientBudi.id, weight: 83.8, note: 'Defisit lancar', loggedAt: new Date('2026-06-08') },
    { clientId: clientBudi.id, weight: 82.5, note: 'Mulai terbiasa lapar', loggedAt: new Date('2026-06-15') },
    { clientId: clientBudi.id, weight: 81.2, note: 'Cardio ditingkatkan', loggedAt: new Date('2026-06-22') },
    { clientId: clientBudi.id, weight: 80.0, note: 'Kondisi lelah tapi berat turun', loggedAt: new Date('2026-06-29') },
    // Citra (maintenance, stable weight)
    { clientId: clientCitra.id, weight: 54.0, note: 'Awal program', loggedAt: new Date('2026-06-01') },
    { clientId: clientCitra.id, weight: 54.1, note: 'Normal', loggedAt: new Date('2026-06-08') },
    { clientId: clientCitra.id, weight: 53.9, note: 'Sesuai ekspektasi', loggedAt: new Date('2026-06-15') },
    { clientId: clientCitra.id, weight: 54.0, note: 'Sangat stabil', loggedAt: new Date('2026-06-22') },
    { clientId: clientCitra.id, weight: 53.8, note: 'Kondisi prima', loggedAt: new Date('2026-06-29') },
  ];

  for (const log of weightLogs) {
    await prisma.weightLog.create({ data: log });
  }

  // 4. Body Measurements
  const bodyLogs = [
    // Arvin
    { clientId: clientArvin.id, weekNumber: 1, chest: 100, waist: 88, arms: 35.5, thighs: 56, calves: 37, neck: 38, measuredAt: new Date('2026-06-01') },
    { clientId: clientArvin.id, weekNumber: 2, chest: 101, waist: 88.5, arms: 35.8, thighs: 56.5, calves: 37.2, neck: 38, measuredAt: new Date('2026-06-08') },
    { clientId: clientArvin.id, weekNumber: 3, chest: 102, waist: 89, arms: 36.2, thighs: 57, calves: 37.5, neck: 38.2, measuredAt: new Date('2026-06-15') },
    // Budi
    { clientId: clientBudi.id, weekNumber: 1, chest: 108, waist: 96, arms: 38.5, thighs: 62, calves: 40, neck: 41, measuredAt: new Date('2026-06-01') },
    { clientId: clientBudi.id, weekNumber: 2, chest: 106.5, waist: 94.2, arms: 38.2, thighs: 61, calves: 39.8, neck: 40.5, measuredAt: new Date('2026-06-08') },
    { clientId: clientBudi.id, weekNumber: 3, chest: 105, waist: 92.0, arms: 37.8, thighs: 60.2, calves: 39.5, neck: 40.0, measuredAt: new Date('2026-06-15') },
  ];

  for (const bl of bodyLogs) {
    await prisma.bodyMeasurement.create({ data: bl });
  }

  // 5. Schedules (Jadwal Mingguan)
  const schedules = [
    // Arvin (Push Pull Legs)
    { clientId: clientArvin.id, dayOfWeek: 'MONDAY', programName: 'Push Day', description: 'Fokus Dada, Bahu, Trisep' },
    { clientId: clientArvin.id, dayOfWeek: 'TUESDAY', programName: 'Pull Day', description: 'Fokus Punggung, Bahu Belakang, Bisep' },
    { clientId: clientArvin.id, dayOfWeek: 'WEDNESDAY', programName: 'Rest Day', description: 'Recovery, peregangan ringan' },
    { clientId: clientArvin.id, dayOfWeek: 'THURSDAY', programName: 'Legs Day', description: 'Fokus Kuadrisep, Hamstring, Betis' },
    { clientId: clientArvin.id, dayOfWeek: 'FRIDAY', programName: 'Push Day (Hypertrophy)', description: 'Volume lebih tinggi' },
    { clientId: clientArvin.id, dayOfWeek: 'SATURDAY', programName: 'Pull Day (Hypertrophy)', description: 'Volume lebih tinggi' },
    { clientId: clientArvin.id, dayOfWeek: 'SUNDAY', programName: 'Rest Day', description: 'Recovery total' },
    // Budi (Upper Lower Cardio)
    { clientId: clientBudi.id, dayOfWeek: 'MONDAY', programName: 'Upper Body', description: 'Dada & Punggung' },
    { clientId: clientBudi.id, dayOfWeek: 'TUESDAY', programName: 'Lower Body', description: 'Legs total' },
    { clientId: clientBudi.id, dayOfWeek: 'WEDNESDAY', programName: 'Cardio LISS', description: 'Jalan cepat / Lari zona 2 45 menit' },
    { clientId: clientBudi.id, dayOfWeek: 'THURSDAY', programName: 'Upper Body', description: 'Fokus Bahu & Lengan' },
    { clientId: clientBudi.id, dayOfWeek: 'FRIDAY', programName: 'Lower Body', description: 'Fokus Hamstring' },
    { clientId: clientBudi.id, dayOfWeek: 'SATURDAY', programName: 'Cardio HIIT', description: 'Stairmaster / Sepeda interval' },
    { clientId: clientBudi.id, dayOfWeek: 'SUNDAY', programName: 'Rest Day', description: 'Peregangan & Mandi es' },
  ];

  for (const s of schedules) {
    await prisma.schedule.create({ data: s });
  }

  // 6. Workout Sessions & Exercises
  const arvinSession1 = await prisma.workoutSession.create({
    data: {
      clientId: clientArvin.id,
      sessionName: 'Push Day A',
      durationMin: 75,
      totalSets: 9,
      totalReps: 90,
      totalVolume: 6750,
      startTime: new Date('2026-06-25T10:00:00Z'),
      endTime: new Date('2026-06-25T11:15:00Z'),
      note: 'Tenaga sangat bagus hari ini',
    },
  });

  const arvinExercises = [
    { sessionId: arvinSession1.id, exerciseName: 'Bench Press', sets: 3, reps: 10, weight: 70, note: 'RPE 9' },
    { sessionId: arvinSession1.id, exerciseName: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 25, note: 'Beban per tangan' },
    { sessionId: arvinSession1.id, exerciseName: 'Tricep Pushdown', sets: 3, reps: 10, weight: 30, note: 'Burnout' },
  ];

  for (const ex of arvinExercises) {
    await prisma.workoutExercise.create({ data: ex });
  }

  // Add Personal Records
  const prs = [
    { clientId: clientArvin.id, exerciseName: 'Bench Press', weight: 80.0, achievedAt: new Date('2026-06-20') },
    { clientId: clientArvin.id, exerciseName: 'Squat', weight: 110.0, achievedAt: new Date('2026-06-18') },
    { clientId: clientArvin.id, exerciseName: 'Deadlift', weight: 140.0, achievedAt: new Date('2026-06-15') },
    // Budi
    { clientId: clientBudi.id, exerciseName: 'Bench Press', weight: 90.0, achievedAt: new Date('2026-06-22') },
    { clientId: clientBudi.id, exerciseName: 'Squat', weight: 120.0, achievedAt: new Date('2026-06-20') },
    { clientId: clientBudi.id, exerciseName: 'Deadlift', weight: 160.0, achievedAt: new Date('2026-06-19') },
  ];

  for (const pr of prs) {
    await prisma.personalRecord.create({ data: pr });
  }

  // Strength targets
  await prisma.strengthTarget.create({
    data: { clientId: clientArvin.id, exerciseName: 'Bench Press', targetWeight: 85.0, note: 'Target bulan depan' },
  });
  await prisma.strengthTarget.create({
    data: { clientId: clientArvin.id, exerciseName: 'Squat', targetWeight: 120.0, note: 'Target bulan depan' },
  });

  // 7. Cardio Logs
  await prisma.cardioLog.create({
    data: { clientId: clientBudi.id, cardioType: 'RUN', durationMin: 45, distanceKm: 6.2, calories: 480, heartRate: 142, loggedAt: new Date('2026-06-24') },
  });
  await prisma.cardioLog.create({
    data: { clientId: clientBudi.id, cardioType: 'STAIRMASTER', durationMin: 30, distanceKm: 0.0, calories: 350, heartRate: 155, loggedAt: new Date('2026-06-26') },
  });

  // 8. Daily Targets (Checklists)
  const dates = ['2026-06-28', '2026-06-29', '2026-06-30'];
  for (const dt of dates) {
    await prisma.dailyTarget.create({
      data: {
        clientId: clientArvin.id,
        date: new Date(dt),
        workoutDone: true,
        proteinMet: true,
        waterMet: true,
        sleepMet: true,
        stepsMet: true,
        stepsCount: 11000,
        waterLiters: 3.5,
        sleepHours: 8.0,
      },
    });
    await prisma.dailyTarget.create({
      data: {
        clientId: clientBudi.id,
        date: new Date(dt),
        workoutDone: dt !== '2026-06-29', // missed workout on 29th
        proteinMet: true,
        waterMet: dt !== '2026-06-28',
        sleepMet: true,
        stepsMet: true,
        stepsCount: 12500,
        waterLiters: 2.8,
        sleepHours: 7.2,
      },
    });
  }

  // 9. Reminders
  await prisma.reminder.create({
    data: {
      senderId: admin.id,
      receiverId: userArvin.id,
      title: 'Update Berat Badan',
      message: 'Arvin, tolong update berat badan mingguan besok pagi sebelum makan/minum.',
      status: 'UNREAD',
    },
  });

  await prisma.reminder.create({
    data: {
      senderId: admin.id,
      receiverId: userBudi.id,
      title: 'Cardio Tracker Check',
      message: 'Kerja bagus budi, cardio mingguanmu sudah tercapai 75 menit. Pertahankan!',
      status: 'READ',
      readAt: new Date(),
    },
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
