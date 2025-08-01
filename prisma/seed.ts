import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.levelThreshold.deleteMany()
  await prisma.registration.deleteMany()
  await prisma.exam.deleteMany()
  await prisma.student.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.user.deleteMany()

  // Create level thresholds
  const levelThresholds = [
    { level: 'A1', minScore: 0, maxScore: 30 },
    { level: 'A2', minScore: 31, maxScore: 50 },
    { level: 'B1', minScore: 51, maxScore: 70 },
    { level: 'B2', minScore: 71, maxScore: 85 },
    { level: 'C1', minScore: 86, maxScore: 100 },
  ]

  for (const threshold of levelThresholds) {
    await prisma.levelThreshold.create({
      data: threshold,
    })
  }

  // Create sample students with new fields
  const students = [
    {
      name: 'Nguyễn Văn A',
      gmail: 'nguyenvana@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge', // "password123"
      dob: new Date('2010-05-15'),
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phoneNumber: '0901234567',
      school: 'Trường Tiểu học ABC',
      platformKnown: 'Facebook',
      note: 'Học viên mới',
    },
    {
      name: 'Trần Thị B',
      gmail: 'tranthib@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge', // "password123"
      dob: new Date('2012-08-20'),
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      phoneNumber: '0909876543',
      school: 'Trường Tiểu học XYZ',
      platformKnown: 'Google',
      note: 'Học viên cũ',
    },
  ]

  for (const student of students) {
    await prisma.student.create({
      data: student,
    })
  }

  // Create sample staff
  const staffMembers = [
    {
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      phoneNumber: '0901111111',
    },
    {
      name: 'Phạm Thị D',
      email: 'phamthid@example.com',
      phoneNumber: '0902222222',
    },
  ]

  for (const staff of staffMembers) {
    await prisma.staff.create({
      data: staff,
    })
  }

  // Create sample users for authentication
  const users = [
    {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge', // "password123"
      role: 'user',
    },
    {
      name: 'Trần Thị B',
      email: 'tranthib@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge', // "password123"
      role: 'user',
    },
    {
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge', // "password123"
      role: 'staff',
    },
  ]

  for (const user of users) {
    await prisma.user.create({
      data: user,
    })
  }

  // Create sample exams
  const createdStudents = await prisma.student.findMany()
  if (createdStudents.length > 0) {
    await prisma.exam.create({
      data: {
        studentId: createdStudents[0].id,
        score: 75,
        levelEstimate: 'B2',
        notes: 'Làm bài tốt',
      },
    })

    await prisma.exam.create({
      data: {
        studentId: createdStudents[1].id,
        score: 45,
        levelEstimate: 'A2',
        notes: 'Cần cải thiện',
      },
    })
  }

  // Create sample registrations
  if (createdStudents.length > 0) {
    await prisma.registration.create({
      data: {
        studentId: createdStudents[0].id,
        levelName: 'B2',
        amountPaid: 2000000,
        paid: true,
      },
    })

    await prisma.registration.create({
      data: {
        studentId: createdStudents[1].id,
        levelName: 'A2',
        amountPaid: 1500000,
        paid: false,
      },
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 