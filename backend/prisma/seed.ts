import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data (safe for dev)
  await prisma.ivrResponse.deleteMany()
  await prisma.reminderLog.deleteMany()
  await prisma.visit.deleteMany()
  await prisma.visitor.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.adminUser.deleteMany()

  // Create admin
  const admin = await prisma.adminUser.create({
    data: {
      username: 'admin',
      passwordHash: 'changeme',
      fullName: 'System Admin',
    },
  })

  // Create visitors (people who visit grandma)
  const alice = await prisma.visitor.create({
    data: {
      name: 'Alice Cohen',
      phone: '+972501234567',
      email: 'alice@example.com',
      notes: 'Experienced visitor',
      isActive: true,
    },
  })

  const bob = await prisma.visitor.create({
    data: {
      name: 'Bob Levi',
      phone: 'YOUR_PHONE_NUMBER_HERE',  // החלף במספר שלך
      email: 'bob@example.com',
      isActive: true,
    },
  })

  // Create visits: one in the past, one tomorrow, one far future
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  const visit1 = await prisma.visit.create({
    data: {
      userId: alice.id,
      scheduledAt: yesterday,
      source: 'MANUAL',
    },
  })

  const visit2 = await prisma.visit.create({
    data: {
      userId: bob.id,
      scheduledAt: tomorrow,
      source: 'AUTO',
    },
  })

  const visit3 = await prisma.visit.create({
    data: {
      userId: alice.id,
      scheduledAt: nextMonth,
      source: 'MANUAL',
    },
  })

  // Create reminder logs: one sent (past), one pending for tomorrow
  await prisma.reminderLog.create({
    data: {
      userId: alice.id,
      scheduledDate: yesterday,
      actualSendDate: yesterday,
      attemptNumber: 1,
      status: 'SENT',
      sentAt: yesterday,
      apiResponse: 'OK',
    },
  })

  const pending = await prisma.reminderLog.create({
    data: {
      userId: bob.id,
      scheduledDate: tomorrow,
      attemptNumber: 0,
      status: 'PENDING',
    },
  })

  // Add a setting for system
  await prisma.setting.create({
    data: {
      keyName: 'timezone',
      value: 'Asia/Jerusalem',
      description: 'Default timezone for scheduling',
    },
  })

  console.log('Seeding finished.')
  console.log({ admin: admin.username, visitors: [alice.name, bob.name], visits: [visit1.id, visit2.id, visit3.id], pendingReminderId: pending.id })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
