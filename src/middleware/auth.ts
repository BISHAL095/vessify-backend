import type { Context, Next } from 'hono'
import { auth } from '../lib/auth.js'

// Shape of values we inject into Hono context for downstream route handlers
export type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

export async function authMiddleware(
  c: Context<{ Variables: AuthVariables }>,
  next: Next
) {
  // Reads session cookie or Bearer token — returns null if missing or expired
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session?.user)
    return c.json({ error: 'Unauthorized' }, 401)

  // orgId is set during registration — absence means incomplete signup
  if (!session.user.orgId)
    return c.json({ error: 'Organization not set up' }, 403)

  // Attach to context so route handlers don't need to re-fetch the session
  c.set('user', session.user)
  c.set('session', session.session)
  await next()
}