import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Check if level thresholds exist, create if they don't
  const existingLevels = await prisma.levelThreshold.findMany()
  if (existingLevels.length === 0) {
    console.log('Creating level thresholds...')
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
  } else {
    console.log('✅ Level thresholds already exist')
  }

  // Create admin student account
  console.log('Creating admin student account...')
  const adminStudentPassword = await bcrypt.hash('18122003', 12)
  const adminStudent = {
    name: 'Khoa Le',
    gmail: 'binkhoa1812@gmail.com',
    password: adminStudentPassword,
    dob: new Date('2000-12-18'),
    address: '123 Admin Street, District 1, Ho Chi Minh City',
    phoneNumber: '0900000001',
    school: 'Admin University',
    platformKnown: 'Admin',
    note: 'Admin student account',
  }

  let createdAdminStudent
  try {
    createdAdminStudent = await prisma.student.create({
      data: adminStudent,
    })
    console.log('✅ Admin student account created')
  } catch (error) {
    console.log('Admin student account already exists, skipping...')
    createdAdminStudent = await prisma.student.findUnique({
      where: { gmail: 'binkhoa1812@gmail.com' }
    })
  }

  // Create 15 synthetic students
  console.log('Creating students...')
  const syntheticStudentPassword = await bcrypt.hash('password123', 12)
  const students = [
    {
      name: 'Nguyễn Văn An',
      gmail: 'nguyenvanan@gmail.com',
      password: syntheticStudentPassword,
      dob: new Date('2010-05-15'),
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phoneNumber: '0901234567',
      school: 'Trường Tiểu học ABC',
      platformKnown: 'Facebook',
      note: 'Học viên mới',
    },
    {
      name: 'Trần Thị Bình',
      gmail: 'tranthibinh@gmail.com',
      password: syntheticStudentPassword,
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
      password: syntheticStudentPassword,
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
      password: syntheticStudentPassword,
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
      password: syntheticStudentPassword,
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
      password: syntheticStudentPassword,
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
      password: syntheticStudentPassword,
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
      password: syntheticStudentPassword,
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
      password: syntheticStudentPassword,
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
      password: syntheticStudentPassword,
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
      password: syntheticStudentPassword,
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
      password: syntheticStudentPassword,
      dob: new Date('2011-02-28'),
      address: '963 Đường Nguyễn Tri Phương, Quận 5, TP.HCM',
      phoneNumber: '0905555666',
      school: 'Trường Tiểu học Nguyễn Tri Phương',
      platformKnown: 'Google',
      note: 'Học viên có mục tiêu học tập rõ ràng',
    },
    {
      name: 'Lê Văn Phúc',
      gmail: 'levanphuc@gmail.com',
      password: syntheticStudentPassword,
      dob: new Date('2010-06-10'),
      address: '159 Đường Lý Thường Kiệt, Quận 5, TP.HCM',
      phoneNumber: '0906666777',
      school: 'Trường THCS Lý Thường Kiệt',
      platformKnown: 'Facebook',
      note: 'Học viên có tiềm năng cao',
    },
    {
      name: 'Nguyễn Thị Kim',
      gmail: 'nguyenthiKim@gmail.com',
      password: syntheticStudentPassword,
      dob: new Date('2011-11-03'),
      address: '357 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
      phoneNumber: '0907777888',
      school: 'Trường Tiểu học Trần Hưng Đạo',
      platformKnown: 'Instagram',
      note: 'Học viên mới từ quận khác',
    },
    {
      name: 'Trần Văn Long',
      gmail: 'tranvanlong@gmail.com',
      password: syntheticStudentPassword,
      dob: new Date('2009-12-25'),
      address: '753 Đường Nguyễn Trãi, Quận 5, TP.HCM',
      phoneNumber: '0908888999',
      school: 'Trường THCS Nguyễn Trãi',
      platformKnown: 'TikTok',
      note: 'Học viên có động lực học tập tốt',
    }
  ]

  const createdStudents = []
  // Add admin student to the beginning of the list
  if (createdAdminStudent) {
    createdStudents.push(createdAdminStudent)
  }
  
  for (const student of students) {
    try {
      const createdStudent = await prisma.student.create({
        data: student,
      })
      createdStudents.push(createdStudent)
    } catch (error) {
      // Skip if student already exists
      console.log(`Student ${student.gmail} already exists, skipping...`)
    }
  }
  console.log(`✅ Created ${createdStudents.length} students (including admin)`)

  // Create admin staff account
  console.log('Creating admin staff account...')
  const adminStaffPassword = await bcrypt.hash('18122003', 12)
  const adminStaff = {
    name: 'Liam Le',
    email: 'binkhoale1812@gmail.com',
    phoneNumber: '0900000002',
    password: adminStaffPassword,
  }

  let createdAdminStaff
  try {
    createdAdminStaff = await prisma.staff.create({
      data: adminStaff,
    })
    console.log(`✅ Admin staff ${adminStaff.name} created`)
  } catch (error) {
    console.log(`Admin staff ${adminStaff.name} already exists, skipping...`)
    createdAdminStaff = await prisma.staff.findUnique({
      where: { email: adminStaff.email }
    })
  }

  // Create admin manager account
  console.log('Creating admin manager account...')
  const adminManagerPassword = await bcrypt.hash('18122003', 12)
  const adminManager = {
    name: 'Y Phung',
    email: 'nguyenyphung2003@gmail.com',
    phoneNumber: '0900000003',
    password: adminManagerPassword,
  }

  let createdAdminManager
  try {
    createdAdminManager = await prisma.manager.create({
      data: adminManager,
    })
    console.log(`✅ Admin manager ${adminManager.name} created`)
  } catch (error) {
    console.log(`Admin manager ${adminManager.name} already exists, skipping...`)
    createdAdminManager = await prisma.manager.findUnique({
      where: { email: adminManager.email }
    })
  }

  // Create 5 staff accounts
  console.log('Creating regular staff accounts...')
  const hashedPassword = await bcrypt.hash('password123', 12)
  const staffMembers = [
    {
      name: 'Lê Văn Cường',
      email: 'levancuong@example.com',
      phoneNumber: '0901111111',
      password: hashedPassword,
    },
    {
      name: 'Phạm Thị Dung',
      email: 'phamthidung@example.com',
      phoneNumber: '0902222222',
      password: hashedPassword,
    },
    {
      name: 'Nguyễn Văn Em',
      email: 'nguyenvanem@example.com',
      phoneNumber: '0903333333',
      password: hashedPassword,
    },
    {
      name: 'Trần Thị Phương',
      email: 'tranthiphuong@example.com',
      phoneNumber: '0904444444',
      password: hashedPassword,
    },
    {
      name: 'Lê Hoàng Giang',
      email: 'lehoanggiang@example.com',
      phoneNumber: '0905555555',
      password: hashedPassword,
    }
  ]

  const createdStaff = []
  // Add admin staff to the beginning of the list
  if (createdAdminStaff) {
    createdStaff.push(createdAdminStaff)
  }
  
  for (const staff of staffMembers) {
    try {
      const createdStaffMember = await prisma.staff.create({
        data: staff,
      })
      createdStaff.push(createdStaffMember)
    } catch (error) {
      // Skip if staff already exists
      console.log(`Staff ${staff.email} already exists, skipping...`)
    }
  }
  console.log(`✅ Created ${createdStaff.length} staff members (including admin)`)

  // Create 6 classes associated with existing levels
  console.log('Creating classes...')
  const classes = [
    {
      name: 'Lớp A1 - Cơ bản',
      level: 'A1',
      maxStudents: 20,
      teacherName: 'Cô Nguyễn Thị Hoa',
      payment_amount: 2000000,
      isActive: true,
    },
    {
      name: 'Lớp A2 - Sơ cấp',
      level: 'A2',
      maxStudents: 18,
      teacherName: 'Thầy Trần Văn Minh',
      payment_amount: 2500000,
      isActive: true,
    },
    {
      name: 'Lớp B1 - Trung cấp',
      level: 'B1',
      maxStudents: 15,
      teacherName: 'Cô Lê Thị Lan',
      payment_amount: 3000000,
      isActive: true,
    },
    {
      name: 'Lớp B2 - Trung cao cấp',
      level: 'B2',
      maxStudents: 12,
      teacherName: 'Thầy Phạm Văn Sơn',
      payment_amount: 3500000,
      isActive: true,
    },
    {
      name: 'Lớp C1 - Cao cấp',
      level: 'C1',
      maxStudents: 10,
      teacherName: 'Cô Võ Thị Hương',
      payment_amount: 4000000,
      isActive: true,
    },
    {
      name: 'Lớp A1 - Trẻ em',
      level: 'A1',
      maxStudents: 15,
      teacherName: 'Cô Hoàng Thị Mai',
      payment_amount: 1800000,
      isActive: true,
    }
  ]

  const createdClasses = []
  for (const classData of classes) {
    try {
      const createdClass = await prisma.class.create({
        data: classData,
      })
      createdClasses.push(createdClass)
    } catch (error) {
      // Skip if class already exists
      console.log(`Class ${classData.name} already exists, skipping...`)
    }
  }
  console.log(`✅ Created ${createdClasses.length} classes`)

  // Assign students to classes
  console.log('Assigning students to classes...')
  const studentClassAssignments = []
  
  // Distribute students across classes
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i]
    const classIndex = i % createdClasses.length
    const classData = createdClasses[classIndex]
    
    try {
      const assignment = await prisma.studentClass.create({
        data: {
          studentId: student.id,
          classId: classData.id,
          classRegistered: classData.numSessions || 24, // Set default to class's numSessions
        },
      })
      studentClassAssignments.push(assignment)
    } catch (error) {
      // Skip if assignment already exists
      console.log(`Student ${student.name} already assigned to class ${classData.name}, skipping...`)
    }
  }
  console.log(`✅ Created ${studentClassAssignments.length} student-class assignments`)

  // Create exams for students with scores and level estimates
  console.log('Creating exams...')
  const examScores = [25, 35, 55, 65, 75, 85, 90, 45, 60, 70, 80, 30, 50, 65, 75]
  const levelEstimates = ['A1', 'A2', 'B1', 'B1', 'B2', 'B2', 'C1', 'A2', 'B1', 'B1', 'B2', 'A1', 'A2', 'B1', 'B2']
  
  const createdExams = []
  for (let i = 0; i < createdStudents.length; i++) {
    try {
      const exam = await prisma.exam.create({
        data: {
          studentId: createdStudents[i].id,
          score: examScores[i],
          levelEstimate: levelEstimates[i],
          examDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          notes: `Bài thi ${levelEstimates[i]} - Điểm: ${examScores[i]}`,
        },
      })
      createdExams.push(exam)
    } catch (error) {
      // Skip if exam already exists
      console.log(`Exam for student ${createdStudents[i].name} already exists, skipping...`)
    }
  }
  console.log(`✅ Created ${createdExams.length} exams`)

  // Create 20 payments (some paid, some unpaid)
  console.log('Creating payments...')
  const paymentMethods = ['Tiền mặt', 'Chuyển khoản', 'Ví điện tử', 'Thẻ tín dụng']
  const paymentStatuses = [true, false, true, true, false, true, false, true, true, false, true, false, true, true, false, true, false, true, true, false]
  
  const createdPayments = []
  for (let i = 0; i < 20; i++) {
    const studentIndex = i % createdStudents.length
    const classIndex = i % createdClasses.length
    const staffIndex = i % createdStaff.length
    
    try {
      const payment = await prisma.payment.create({
        data: {
          class_id: createdClasses[classIndex].id,
          payment_amount: createdClasses[classIndex].payment_amount || 2500000,
          user_id: createdStudents[studentIndex].id,
          payment_method: paymentMethods[i % paymentMethods.length],
          staff_assigned: createdStaff[staffIndex].id,
          have_paid: paymentStatuses[i],
          datetime: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
        },
      })
      createdPayments.push(payment)
    } catch (error) {
      // Skip if payment already exists
      console.log(`Payment ${i + 1} already exists, skipping...`)
    }
  }
  console.log(`✅ Created ${createdPayments.length} payments`)

  // Create registrations for students
  console.log('Creating registrations...')
  const createdRegistrations = []
  for (let i = 0; i < createdStudents.length; i++) {
    try {
      const registration = await prisma.registration.create({
        data: {
          studentId: createdStudents[i].id,
          levelName: levelEstimates[i],
          amountPaid: createdClasses[i % createdClasses.length].payment_amount || 2500000,
          paid: paymentStatuses[i % paymentStatuses.length],
        },
      })
      createdRegistrations.push(registration)
    } catch (error) {
      // Skip if registration already exists
      console.log(`Registration for student ${createdStudents[i].name} already exists, skipping...`)
    }
  }
  console.log(`✅ Created ${createdRegistrations.length} registrations`)

  // Create reminders for KPI tracking (some staff associated with payment/reminder KPI)
  console.log('Creating reminders...')
  const reminderTypes = ['payment', 'examination']
  const platforms = ['call', 'email', 'sms']
  
  const createdReminders = []
  for (let i = 0; i < 15; i++) {
    const staffIndex = i % createdStaff.length
    const studentIndex = i % createdStudents.length
    
    try {
      const reminder = await prisma.reminder.create({
        data: {
          staffId: createdStaff[staffIndex].id,
          type: reminderTypes[i % reminderTypes.length],
          platform: platforms[i % platforms.length],
          studentId: createdStudents[studentIndex].id,
          content: `Nhắc nhở ${reminderTypes[i % reminderTypes.length]} cho học viên ${createdStudents[studentIndex].name}`,
        },
      })
      createdReminders.push(reminder)
    } catch (error) {
      // Skip if reminder already exists
      console.log(`Reminder ${i + 1} already exists, skipping...`)
    }
  }
  console.log(`✅ Created ${createdReminders.length} reminders`)

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Summary:`)
  console.log(`   - Students: ${createdStudents.length}`)
  console.log(`   - Staff: ${createdStaff.length}`)
  console.log(`   - Classes: ${createdClasses.length}`)
  console.log(`   - Student-Class Assignments: ${studentClassAssignments.length}`)
  console.log(`   - Exams: ${createdExams.length}`)
  console.log(`   - Payments: ${createdPayments.length}`)
  console.log(`   - Registrations: ${createdRegistrations.length}`)
  console.log(`   - Reminders: ${createdReminders.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 