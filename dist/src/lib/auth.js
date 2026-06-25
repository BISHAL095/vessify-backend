import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma.js';
export const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    // Allow the Next.js frontend to make credentialed requests
    trustedOrigins: ['http://localhost:3000'],
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true },
    // Tell Better Auth's type system that orgId exists on User
    user: {
        additionalFields: {
            orgId: { type: 'string', required: false },
        },
    },
});
//# sourceMappingURL=auth.js.map