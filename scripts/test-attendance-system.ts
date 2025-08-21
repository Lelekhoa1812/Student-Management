import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAttendanceSystem() {
  try {
    console.log('🧪 Testing attendance system...')
    
    // Get a sample class with students
    const classData = await prisma.class.findFirst({
      include: {
        studentClasses: {
          include: {
            student: {
              select: {
                name: true,
                gmail: true
              }
            }
          }
        }
      }
    })
    
    if (!classData || classData.studentClasses.length === 0) {
      console.log('❌ No classes with students found to test')
      return
    }
    
    console.log(`📋 Testing with class: ${classData.name}`)
    console.log(`👥 Students in class: ${classData.studentClasses.length}`)
    
    // Show current attendance for each student
    console.log('\n📊 Current attendance status:')
    for (const sc of classData.studentClasses) {
      console.log(`   - ${sc.student.name}: ${sc.attendance}/${sc.classRegistered} sessions`)
    }
    
    // Simulate marking attendance for the first student
    const firstStudent = classData.studentClasses[0]
    if (firstStudent) {
      console.log(`\n🔄 Simulating attendance for ${firstStudent.student.name}...`)
      
      // Increment attendance
      const updatedSC = await prisma.studentClass.update({
        where: { id: firstStudent.id },
        data: { attendance: { increment: 1 } }
      })
      
      console.log(`✅ Updated attendance for ${firstStudent.student.name}: ${updatedSC.attendance}/${updatedSC.classRegistered}`)
      
      // Check if student has reached their limit
      const hasReachedLimit = updatedSC.attendance >= updatedSC.classRegistered
      console.log(`📊 Has reached limit: ${hasReachedLimit}`)
      
      if (hasReachedLimit) {
        console.log(`⚠️  ${firstStudent.student.name} has reached their class limit!`)
      }
    }
    
    // Show final attendance status
    console.log('\n📊 Final attendance status:')
    const finalClassData = await prisma.class.findFirst({
      where: { id: classData.id },
      include: {
        studentClasses: {
          include: {
            student: {
              select: {
                name: true,
                gmail: true
              }
            }
          }
        }
      }
    })
    
    if (finalClassData) {
      for (const sc of finalClassData.studentClasses) {
        const hasReachedLimit = sc.attendance >= sc.classRegistered
        console.log(`   - ${sc.student.name}: ${sc.attendance}/${sc.classRegistered} ${hasReachedLimit ? '⚠️ LIMIT REACHED' : ''}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error during attendance test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAttendanceSystem()
