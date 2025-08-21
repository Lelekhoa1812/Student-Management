import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPaymentUpdate() {
  try {
    console.log('🧪 Testing payment update logic...')
    
    // Get a sample payment
    const payment = await prisma.payment.findFirst({
      include: {
        class: true,
        student: true
      }
    })
    
    if (!payment) {
      console.log('❌ No payments found to test')
      return
    }
    
    console.log(`📋 Testing with payment: ${payment.id}`)
    console.log(`👤 Student: ${payment.student.name}`)
    console.log(`🏫 Class: ${payment.class.name}`)
    console.log(`💰 Current amount: ${payment.payment_amount}`)
    console.log(`📚 Class sessions: ${payment.class.numSessions}`)
    
    // Check current StudentClass record
    const studentClass = await prisma.studentClass.findFirst({
      where: {
        studentId: payment.user_id,
        classId: payment.class_id
      }
    })
    
    if (studentClass) {
      console.log(`📊 Current StudentClass:`)
      console.log(`   - Attendance: ${studentClass.attendance}`)
      console.log(`   - ClassRegistered: ${studentClass.classRegistered}`)
    }
    
    // Simulate updating the payment with reduced sessions
    const discountReason = `Giảm số buổi từ ${payment.class.numSessions} sang 18`
    
    console.log(`🔄 Simulating discount reason: ${discountReason}`)
    
    // Extract the new session count
    const match = discountReason.match(/sang (\d+)/)
    if (match) {
      const newSessionCount = parseInt(match[1])
      console.log(`📝 New session count: ${newSessionCount}`)
      
      // Update StudentClass.classRegistered
      const updatedStudentClass = await prisma.studentClass.updateMany({
        where: {
          studentId: payment.user_id,
          classId: payment.class_id
        },
        data: {
          classRegistered: newSessionCount
        }
      })
      
      console.log(`✅ Updated StudentClass records: ${updatedStudentClass.count}`)
      
      // Verify the update
      const updatedSC = await prisma.studentClass.findFirst({
        where: {
          studentId: payment.user_id,
          classId: payment.class_id
        }
      })
      
      if (updatedSC) {
        console.log(`📊 Updated StudentClass:`)
        console.log(`   - Attendance: ${updatedSC.attendance}`)
        console.log(`   - ClassRegistered: ${updatedSC.classRegistered}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPaymentUpdate()
