import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function generatePaymentRecords() {
  try {
    console.log('🔄 Starting payment record generation...')

    // Get all students who are assigned to classes
    const studentsWithClasses = await prisma.student.findMany({
      where: {
        studentClasses: {
          some: {}
        }
      },
      include: {
        studentClasses: {
          include: {
            class: true
          }
        },
        payments: true
      }
    })

    console.log(`📊 Found ${studentsWithClasses.length} students assigned to classes`)

    let createdCount = 0
    let skippedCount = 0

    for (const student of studentsWithClasses) {
      if (!student.studentClasses || student.studentClasses.length === 0) {
        console.log(`⚠️ Student ${student.name} has no classes assigned, skipping`)
        continue
      }

      // Process each class assignment for the student
      for (const studentClass of student.studentClasses) {
        if (!studentClass.class) {
          console.log(`⚠️ Student ${student.name} has invalid class assignment, skipping`)
          continue
        }

        // Check if payment record already exists for this student-class combination
        const existingPayment = await prisma.payment.findFirst({
          where: {
            class_id: studentClass.classId,
            user_id: student.id
          }
        })

        if (existingPayment) {
          console.log(`⏭️ Payment record already exists for ${student.name} in ${studentClass.class.name}, skipping`)
          skippedCount++
          continue
        }

        // Check if class has payment_amount set
        if (!studentClass.class.payment_amount) {
          console.log(`⚠️ Class ${studentClass.class.name} has no payment_amount set, skipping payment creation for ${student.name}`)
          skippedCount++
          continue
        }

        // Get the first available staff member
        const firstStaff = await prisma.staff.findFirst()
        if (!firstStaff) {
          console.log(`❌ No staff members found, cannot create payment for ${student.name}`)
          skippedCount++
          continue
        }

        // Create payment record
        await prisma.payment.create({
          data: {
            class_id: studentClass.classId,
            payment_amount: studentClass.class.payment_amount,
            user_id: student.id,
            payment_method: "Chưa thanh toán",
            staff_assigned: firstStaff.id,
            have_paid: false
          }
        })

        console.log(`✅ Created payment record for ${student.name} in ${studentClass.class.name} (${studentClass.class.payment_amount.toLocaleString('vi-VN')} VND)`)
        createdCount++
      }
    }

    console.log('\n📈 Summary:')
    console.log(`✅ Created: ${createdCount} payment records`)
    console.log(`⏭️ Skipped: ${skippedCount} (already exist or no payment amount)`)
    console.log(`📊 Total processed: ${studentsWithClasses.length} students`)

  } catch (error) {
    console.error('❌ Error generating payment records:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
generatePaymentRecords()
  .then(() => {
    console.log('🎉 Payment record generation completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  }) 