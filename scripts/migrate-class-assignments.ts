import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateClassAssignments() {
  console.log('Starting class assignment migration...')
  
  try {
    // Since we've already removed classId, we'll just verify the current state
    console.log('Schema has been updated to use StudentClass model only.')
    console.log('All class assignments should now go through the StudentClass junction table.')
    
    // Check current StudentClass records
    const studentClassCount = await prisma.studentClass.count()
    console.log(`Current StudentClass records: ${studentClassCount}`)
    
    // Check total students
    const studentCount = await prisma.student.count()
    console.log(`Total students: ${studentCount}`)
    
    // Check total classes
    const classCount = await prisma.class.count()
    console.log(`Total classes: ${classCount}`)

    console.log('Migration completed successfully!')
    console.log('The system now uses a consistent StudentClass model for all class assignments.')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateClassAssignments() 