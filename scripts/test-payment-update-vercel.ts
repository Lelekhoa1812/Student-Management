import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPaymentUpdateVercel() {
  try {
    console.log('🧪 Testing payment update logic for Vercel deployment...')
    
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
    
    // Simulate the exact discount reason format used in the frontend
    const baseSessions = payment.class.numSessions || 24
    const newSessionCount = 13 // Reduced to 13 sessions
    const discountReason = `Giảm số buổi từ ${baseSessions} sang ${newSessionCount}`
    
    console.log(`🔄 Simulating discount reason: "${discountReason}"`)
    
    // Test the regex patterns used in the API
    console.log('\n🧪 Testing regex patterns:')
    
    // Pattern 1: "sang X" (Vietnamese)
    let match = discountReason.match(/sang (\d+)/)
    if (match) {
      console.log(`✅ Pattern 1 (sang): Matched ${match[1]}`)
    } else {
      console.log(`❌ Pattern 1 (sang): No match`)
    }
    
    // Pattern 2: "to X" (English fallback)
    match = discountReason.match(/to (\d+)/)
    if (match) {
      console.log(`✅ Pattern 2 (to): Matched ${match[1]}`)
    } else {
      console.log(`❌ Pattern 2 (to): No match`)
    }
    
    // Pattern 3: Extract any number that appears after "Giảm số buổi"
    match = discountReason.match(/Giảm số buổi.*?(\d+)/)
    if (match) {
      console.log(`✅ Pattern 3 (extract): Matched ${match[1]}`)
    } else {
      console.log(`❌ Pattern 3 (extract): No match`)
    }
    
    // Now actually update the StudentClass record
    console.log(`\n🔄 Updating StudentClass.classRegistered to ${newSessionCount}...`)
    
    const updateResult = await prisma.studentClass.updateMany({
      where: {
        studentId: payment.user_id,
        classId: payment.class_id
      },
      data: {
        classRegistered: newSessionCount
      }
    })
    
    console.log(`✅ Updated ${updateResult.count} StudentClass records`)
    
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
    
    // Also test updating the payment record
    console.log(`\n🔄 Updating payment record...`)
    
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        discount_percentage: 38.1, // Example discount
        discount_reason: discountReason
      },
      include: {
        class: true,
        student: true,
        staff: true
      }
    })
    
    console.log(`✅ Updated payment with discount reason: "${updatedPayment.discount_reason}"`)
    
  } catch (error) {
    console.error('❌ Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPaymentUpdateVercel()
