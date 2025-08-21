import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCurrentState() {
  try {
    console.log('🔍 Checking current database state...')
    
    // Get all StudentClass records with their related data
    const studentClasses = await prisma.studentClass.findMany({
      include: {
        student: {
          select: {
            name: true,
            gmail: true
          }
        },
        class: {
          select: {
            name: true,
            numSessions: true
          }
        }
      }
    })
    
    console.log(`📊 Found ${studentClasses.length} StudentClass records:`)
    
    studentClasses.forEach((sc, index) => {
      console.log(`${index + 1}. Student: ${sc.student.name} (${sc.student.gmail})`)
      console.log(`   Class: ${sc.class.name}`)
      console.log(`   Attendance: ${sc.attendance}`)
      console.log(`   ClassRegistered: ${sc.classRegistered}`)
      console.log(`   Class NumSessions: ${sc.class.numSessions}`)
      console.log('---')
    })
    
    // Check if any records have classRegistered = 0
    const zeroRecords = studentClasses.filter(sc => sc.classRegistered === 0)
    if (zeroRecords.length > 0) {
      console.log(`⚠️  Found ${zeroRecords.length} records with classRegistered = 0:`)
      zeroRecords.forEach(sc => {
        console.log(`   - ${sc.student.name} in ${sc.class.name}`)
      })
    } else {
      console.log('✅ All records have proper classRegistered values')
    }
    
  } catch (error) {
    console.error('❌ Error checking database state:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentState()
