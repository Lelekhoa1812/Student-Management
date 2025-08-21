import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateClassRegistered() {
  try {
    console.log('🔄 Starting migration to update classRegistered field...')
    
    // Get all StudentClass records
    const studentClasses = await prisma.studentClass.findMany({
      include: {
        class: true
      }
    })
    
    console.log(`📊 Found ${studentClasses.length} StudentClass records to update`)
    
    let updatedCount = 0
    
    for (const sc of studentClasses) {
      if (sc.classRegistered === 0) {
        const numSessions = sc.class.numSessions || 24
        await prisma.studentClass.update({
          where: { id: sc.id },
          data: { classRegistered: numSessions }
        })
        updatedCount++
        console.log(`✅ Updated StudentClass ${sc.id}: classRegistered = ${numSessions}`)
      }
    }
    
    console.log(`🎉 Migration completed! Updated ${updatedCount} records`)
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateClassRegistered()
