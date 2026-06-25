import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma.js'

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  // Allow the Next.js frontend to make credentialed requests
  trustedOrigins: [
    process.env.FRONTEND_URL!
    ],

  baseURL: process.env.BETTER_AUTH_URL!,

  emailAndPassword: { enabled: true },

  // Tell Better Auth's type system that orgId exists on User
  user: {
    additionalFields: {
      orgId: { type: 'string', required: false },
    },
  },
})

// Used to type c.get('user') and c.get('session') in Hono context
export type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}