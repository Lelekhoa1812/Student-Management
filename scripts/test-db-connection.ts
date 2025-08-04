import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  console.log('Testing database connection...')
  
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test a simple query
    const classCount = await prisma.class.count()
    console.log(`✅ Classes count: ${classCount}`)
    
    const studentCount = await prisma.student.count()
    console.log(`✅ Students count: ${studentCount}`)
    
    const studentClassCount = await prisma.studentClass.count()
    console.log(`✅ StudentClass records: ${studentClassCount}`)
    
    console.log('✅ All database operations successful')
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await prisma.$disconnect()
    console.log('✅ Database disconnected')
  }
}

testDatabaseConnection() 