import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const classes = await prisma.class.findMany({})
    console.log(`Found ${classes.length} classes. Backfilling numSessions...`)
    for (const cls of classes) {
      const rand = Math.floor(Math.random() * (24 - 12 + 1)) + 12
      await prisma.class.update({ where: { id: cls.id }, data: { numSessions: rand } })
      console.log(`Updated class ${cls.name} (${cls.id}) -> numSessions=${rand}`)
    }
    console.log('Done.')
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()


