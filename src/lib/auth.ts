import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma.js'

const frontendOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  // Allow the frontend to make credentialed auth requests
  trustedOrigins: frontendOrigins,

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