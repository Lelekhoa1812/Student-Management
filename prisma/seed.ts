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

  console.log('✅ Level thresholds created')

  // Create sample students
  const students = [
    {
      name: 'Nguyễn Văn An',
      dob: new Date('2010-05-15'),
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phoneNumber: '0901234567',
      school: 'THCS ABC',
      platformKnown: 'Facebook',
      note: 'Học viên mới',
    },
    {
      name: 'Trần Thị Bình',
      dob: new Date('2012-08-20'),
      address: '456 Đường XYZ, Quận 3, TP.HCM',
      phoneNumber: '0909876543',
      school: 'THCS XYZ',
      platformKnown: 'Google',
      note: 'Có kinh nghiệm học tiếng Anh',
    },
  ]

  for (const student of students) {
    await prisma.student.create({
      data: student,
    })
  }

  console.log('✅ Sample students created')

  // Create sample staff
  const staff = [
    {
      name: 'Lê Văn Cường',
      email: 'cuong@mpa.edu.vn',
      phoneNumber: '0901111111',
    },
    {
      name: 'Phạm Thị Dung',
      email: 'dung@mpa.edu.vn',
      phoneNumber: '0902222222',
    },
  ]

  for (const staffMember of staff) {
    await prisma.staff.create({
      data: staffMember,
    })
  }

  console.log('✅ Sample staff created')

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

  console.log('✅ Sample exams created')

  // Create sample registrations
  if (createdStudents.length > 0) {
    await prisma.registration.create({
      data: {
        studentId: createdStudents[0].id,
        levelName: 'B2',
        amountPaid: 5000000,
        paid: true,
      },
    })

    await prisma.registration.create({
      data: {
        studentId: createdStudents[1].id,
        levelName: 'A2',
        amountPaid: 4000000,
        paid: false,
      },
    })
  }

  console.log('✅ Sample registrations created')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 