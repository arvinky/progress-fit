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

  // Create single Admin/PT
  const adminPassword = await bcrypt.hash('arvin151003', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Arvin Danuarta',
      email: 'admin15@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  
  console.log('Admin Arvin Danuarta created.');
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
