import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

// Neon is serverless — requires WebSocket adapter instead of plain TCP
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

// Singleton: prevent multiple PrismaClient instances during hot-reloads in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prisma