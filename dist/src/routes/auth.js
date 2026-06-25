import { Hono } from 'hono';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
export const authRouter = new Hono();
// Custom register — Better Auth creates the user, we create the org and link them
authRouter.post('/register', async (c) => {
    const { email, password, orgName } = await c.req.json();
    if (!email || !password || !orgName)
        return c.json({ error: 'Missing fields' }, 400);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
        return c.json({ error: 'Email already registered' }, 409);
    // Better Auth handles password hashing and Account row creation
    const response = await auth.api.signUpEmail({
        body: { email, password, name: email.split('@')[0] },
        asResponse: true,
    });
    if (!response.ok) {
        const err = await response.json();
        return c.json({ error: err.message ?? 'Registration failed' }, 400);
    }
    const result = await response.json();
    const userId = result.user.id;
    const slug = orgName.toLowerCase().replace(/\s+/g, '-');
    // Atomic: create org and attach it to the user — if either fails, both roll back
    await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
            data: { name: orgName, slug },
        });
        await tx.user.update({
            where: { id: userId },
            data: { orgId: org.id },
        });
    });
    // Sign in right after register to return a live session
    const signInResponse = await auth.api.signInEmail({
        body: { email, password },
        asResponse: true,
    });
    if (!signInResponse.ok)
        return c.json({ error: 'Registered but login failed' }, 500);
    return signInResponse;
});
// Better Auth owns login, session check, sign-out — delegate everything else
authRouter.on(['POST', 'GET'], '/*', (c) => auth.handler(c.req.raw));
//# sourceMappingURL=auth.js.map