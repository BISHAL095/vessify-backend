import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'  // Node built-in
import { promisify } from 'util'
import { prisma } from '../lib/prisma.js'

const scryptAsync = promisify(scrypt)

// ── Hashing ──────────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')          // random 16-byte salt
  const buf  = await scryptAsync(password, salt, 64) as Buffer
  return `${salt}:${buf.toString('hex')}`               // store as "salt:hash"
}

// ── Verification ─────────────────────────────────────────────
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':')
  const hashBuf    = Buffer.from(hash, 'hex')
  const inputBuf   = await scryptAsync(password, salt, 64) as Buffer
  return timingSafeEqual(hashBuf, inputBuf)             // constant-time compare
}

export const authRouter = new Hono()

// ── REGISTER ──────────────────────────────────────────────────
authRouter.post('/register', async (c) => {
  const { email, password, orgName } = await c.req.json()

  if (!email || !password || !orgName)
    return c.json({ error: 'Missing fields' }, 400)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return c.json({ error: 'Email already registered' }, 409)

  const passwordHash = await hashPassword(password)
  const slug = orgName.toLowerCase().replace(/\s+/g, '-')

  const { user, org } = await prisma.$transaction(async (tx) => {
    const org  = await tx.organization.create({ data: { name: orgName, slug } })
    const user = await tx.user.create({ data: { email, passwordHash, orgId: org.id } })
    return { user, org }
  })

  const token = await sign(
    { sub: user.id, orgId: org.id, email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    process.env.BETTER_AUTH_SECRET!
  )
  return c.json({ token, userId: user.id, orgId: org.id }, 201)
})

// ── LOGIN ─────────────────────────────────────────────────────
authRouter.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  const user = await prisma.user.findUnique({ where: { email } })

  // Same error for "not found" and "wrong password" — prevents user enumeration
  if (!user) return c.json({ error: 'Invalid credentials' }, 401)

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401)

  const token = await sign(
    { sub: user.id, orgId: user.orgId, email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    process.env.BETTER_AUTH_SECRET!
  )
  return c.json({ token })
})