import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAttendanceIncrement() {
  try {
    console.log('🔄 Testing attendance increment...')
    
    // Connect to database
    await prisma.$connect()
    console.log('✅ Database connected')
    
    const classId = '68983b7c18e591777d4cb6da'
    const studentId = '68983b7418e591777d4cb6c9'
    
    // Check current state
    console.log('📊 Checking current state...')
    const currentSC = await prisma.studentClass.findFirst({
      where: { classId, studentId },
      include: {
        student: { select: { name: true } },
        class: { select: { name: true } }
      }
    })
    
    if (!currentSC) {
      console.log('❌ StudentClass not found')
      return
    }
    
    console.log(`📊 Current state:`)
    console.log(`   - Student: ${currentSC.student.name}`)
    console.log(`   - Class: ${currentSC.class.name}`)
    console.log(`   - Current attendance: ${currentSC.attendance}`)
    console.log(`   - Attendance type: ${typeof currentSC.attendance}`)
    
    // Try different increment approaches
    console.log('🔄 Testing different increment approaches...')
    
    // Approach 1: Direct increment
    console.log('   - Approach 1: Direct increment')
    const updatedSC1 = await prisma.studentClass.update({
      where: { id: currentSC.id },
      data: { attendance: { increment: 1 } }
    })
    console.log(`     Result: ${updatedSC1.attendance} (difference: ${updatedSC1.attendance - currentSC.attendance})`)
    
    // Approach 2: Manual increment
    console.log('   - Approach 2: Manual increment')
    const updatedSC2 = await prisma.studentClass.update({
      where: { id: currentSC.id },
      data: { attendance: updatedSC1.attendance + 1 }
    })
    console.log(`     Result: ${updatedSC2.attendance} (difference: ${updatedSC2.attendance - updatedSC1.attendance})`)
    
    // Approach 3: Manual increment with current value
    console.log('   - Approach 3: Manual increment with current value')
    const updatedSC3 = await prisma.studentClass.update({
      where: { id: currentSC.id },
      data: { attendance: currentSC.attendance + 1 }
    })
    console.log(`     Result: ${updatedSC3.attendance} (difference: ${updatedSC3.attendance - currentSC.attendance})`)
    
    // Verify final state
    const finalSC = await prisma.studentClass.findFirst({
      where: { id: currentSC.id }
    })
    
    console.log(`🔍 Final verification:`)
    console.log(`   - Final attendance: ${finalSC?.attendance}`)
    console.log(`   - Total difference: ${(finalSC?.attendance || 0) - currentSC.attendance}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
    console.log('✅ Database disconnected')
  }
}

testAttendanceIncrement()
