import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { parseTransaction } from '../lib/parser.js';
export const txRouter = new Hono();
// All transaction routes require a valid session
txRouter.use('/*', authMiddleware);
txRouter.post('/extract', async (c) => {
    const user = c.get('user');
    const { text } = await c.req.json();
    if (!text?.trim())
        return c.json({ error: 'text is required' }, 400);
    const parsed = parseTransaction(text);
    // userId and orgId always come from the verified session — never from the request body
    const transaction = await prisma.transaction.create({
        data: {
            ...parsed,
            rawText: text,
            userId: user.id,
            orgId: user.orgId,
        },
    });
    return c.json({ transaction, confidence: parsed.confidence }, 201);
});
txRouter.get('/', async (c) => {
    const user = c.get('user');
    const cursor = c.req.query('cursor');
    const limit = Math.min(Number(c.req.query('limit') ?? 20), 100);
    const rows = await prisma.transaction.findMany({
        where: { orgId: user.orgId }, // data isolation — only this org's transactions
        orderBy: { createdAt: 'desc' },
        take: limit + 1, // fetch one extra to determine hasMore
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });
    // Cursor pagination: slice off the extra row, send its ID as the next cursor
    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);
    const nextCursor = hasMore ? data.at(-1)?.id : null;
    return c.json({ data, nextCursor, hasMore });
});
//# sourceMappingURL=transactions.js.map