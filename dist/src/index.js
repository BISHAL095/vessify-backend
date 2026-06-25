import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { authRouter } from './routes/auth.js';
import { txRouter } from './routes/transactions.js';
const app = new Hono();
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
// credentials:true is required — Better Auth sets httpOnly session cookies cross-origin
app.use('*', cors({
    origin: frontendUrl,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
}));
app.route('/api/auth', authRouter);
app.route('/api/transactions', txRouter);
const port = Number(process.env.PORT ?? 3001);
serve({ fetch: app.fetch, port });
console.log(`Backend running on :${port}`);
console.log(`Allowed frontend origin: ${frontendUrl}`);
console.log(`Better Auth base URL: ${process.env.BETTER_AUTH_URL}`);
//# sourceMappingURL=index.js.map