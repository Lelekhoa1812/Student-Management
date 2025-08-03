import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
    {
      name: 'Lê Hoàng Minh',
      gmail: 'lehoangminh@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge',
      dob: new Date('2009-03-12'),
      address: '789 Đường Lê Lợi, Quận 3, TP.HCM',
      phoneNumber: '0905555555',
      school: 'Trường THCS Lê Lợi',
      platformKnown: 'Instagram',
      note: 'Học viên tiềm năng',
    },
    {
      name: 'Phạm Thu Hà',
      gmail: 'phamthuha@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge',
      dob: new Date('2011-07-25'),
      address: '321 Đường Nguyễn Huệ, Quận 1, TP.HCM',
      phoneNumber: '0906666666',
      school: 'Trường Tiểu học Nguyễn Huệ',
      platformKnown: 'TikTok',
      note: 'Học viên mới đăng ký',
    },
    {
      name: 'Võ Đức Anh',
      gmail: 'voducanh@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge',
      dob: new Date('2010-11-08'),
      address: '654 Đường Võ Văn Tần, Quận 3, TP.HCM',
      phoneNumber: '0907777777',
      school: 'Trường THCS Võ Văn Tần',
      platformKnown: 'YouTube',
      note: 'Học viên quan tâm đến tiếng Anh',
    },
    {
      name: 'Nguyễn Thị Lan',
      gmail: 'nguyenthiLan@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge',
      dob: new Date('2012-01-30'),
      address: '987 Đường Hai Bà Trưng, Quận 1, TP.HCM',
      phoneNumber: '0908888888',
      school: 'Trường Tiểu học Hai Bà Trưng',
      platformKnown: 'Facebook',
      note: 'Học viên từ giới thiệu',
    },
    {
      name: 'Trần Văn Nam',
      gmail: 'tranvannam@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge',
      dob: new Date('2009-09-15'),
      address: '147 Đường Pasteur, Quận 1, TP.HCM',
      phoneNumber: '0909999999',
      school: 'Trường THCS Pasteur',
      platformKnown: 'Google',
      note: 'Học viên có kinh nghiệm học tiếng Anh',
    },
    {
      name: 'Lê Thị Mai',
      gmail: 'lethimai@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge',
      dob: new Date('2011-04-22'),
      address: '258 Đường Điện Biên Phủ, Quận 3, TP.HCM',
      phoneNumber: '0901111222',
      school: 'Trường Tiểu học Điện Biên Phủ',
      platformKnown: 'Instagram',
      note: 'Học viên mới chuyển từ trường khác',
    },
    {
      name: 'Hoàng Văn Sơn',
      gmail: 'hoangvanson@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge',
      dob: new Date('2010-12-05'),
      address: '369 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM',
      phoneNumber: '0902222333',
      school: 'Trường THCS Cách Mạng Tháng 8',
      platformKnown: 'TikTok',
      note: 'Học viên có năng khiếu ngôn ngữ',
    },
    {
      name: 'Phạm Thị Dung',
      gmail: 'phamthidung@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge',
      dob: new Date('2012-06-18'),
      address: '741 Đường 3/2, Quận 10, TP.HCM',
      phoneNumber: '0903333444',
      school: 'Trường Tiểu học 3/2',
      platformKnown: 'Facebook',
      note: 'Học viên từ chương trình khuyến học',
    },
    {
      name: 'Nguyễn Văn Tuấn',
      gmail: 'nguyenvantuan@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge',
      dob: new Date('2009-08-14'),
      address: '852 Đường Sư Vạn Hạnh, Quận 10, TP.HCM',
      phoneNumber: '0904444555',
      school: 'Trường THCS Sư Vạn Hạnh',
      platformKnown: 'YouTube',
      note: 'Học viên đam mê học tiếng Anh',
    },
    {
      name: 'Trần Thị Hương',
      gmail: 'tranthihuong@gmail.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge',
      dob: new Date('2011-02-28'),
      address: '963 Đường Nguyễn Tri Phương, Quận 5, TP.HCM',
      phoneNumber: '0905555666',
      school: 'Trường Tiểu học Nguyễn Tri Phương',
      platformKnown: 'Google',
      note: 'Học viên có mục tiêu học tập rõ ràng',
    }
  ]

  for (const student of students) {
    await prisma.student.create({
      data: student,
    })
  }

  // Create sample staff with password
  const hashedPassword = await bcrypt.hash('password123', 12)
  const staffMembers = [
    {
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      phoneNumber: '0901111111',
      password: hashedPassword,
    },
    {
      name: 'Phạm Thị D',
      email: 'phamthid@example.com',
      phoneNumber: '0902222222',
      password: hashedPassword,
    },
  ]

  for (const staff of staffMembers) {
    await prisma.staff.create({
      data: staff,
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
        notes: 'Bài thi tốt',
      },
    })
  }

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