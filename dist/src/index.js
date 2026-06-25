import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { authRouter } from './routes/auth.js';
import { txRouter } from './routes/transactions.js';
const app = new Hono();
// credentials:true is required — Better Auth sets httpOnly session cookies cross-origin
app.use('*', cors({
    origin: 'http://localhost:3000',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
}));
app.route('/api/auth', authRouter);
app.route('/api/transactions', txRouter);
serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3001) });
console.log(`Backend running on :${process.env.PORT ?? 3001}`);
//# sourceMappingURL=index.js.map