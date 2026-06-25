import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
// Pooler URL works for both runtime queries and migrations
const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
});
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
//# sourceMappingURL=prisma.js.map