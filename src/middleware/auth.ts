import type { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import type { AppVariables, JWTPayload } from '../types/index.js'

export async function authMiddleware(
 c: Context<{ Variables: AppVariables }>,
 next: Next
) {
 const authHeader = c.req.header('Authorization')

 if (!authHeader?.startsWith('Bearer ')) {
 return c.json({ error: 'Missing token' }, 401)
 }

 const token = authHeader.slice(7) // remove "Bearer "

 try {
 const payload = await verify(
 token,
 process.env.BETTER_AUTH_SECRET!,
 'HS256'
 ) as JWTPayload

 // Check expiry explicitly
 if (payload.exp < Date.now() / 1000) {
 return c.json({ error: 'Token expired' }, 401)
 }

 // Inject into context — route handlers read these
 c.set('userId', payload.sub)
 c.set('orgId', payload.orgId)
 c.set('email', payload.email)
 
 await next()
 } catch {
 return c.json({ error: 'Invalid token' }, 401)
 }
}