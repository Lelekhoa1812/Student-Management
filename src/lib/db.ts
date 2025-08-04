import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Add connection management options
  __internal: {
    engine: {
      connectTimeout: 30000, // 30 seconds
      pool: {
        min: 1,
        max: 10
      }
    }
  }
})

// Ensure connection is established
prisma.$connect()
  .then(() => {
    console.log('✅ Database connection established')
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error)
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 