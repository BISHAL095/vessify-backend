# Vessify Backend

> Secure, multi-tenant transaction extractor API built with Hono, Prisma, Better Auth, and Neon PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Hono (TypeScript) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 7 with PrismaNeon adapter |
| Auth | Better Auth with prismaAdapter |
| Deployment | Render |

## Live URL

```
https://your-render-url.onrender.com
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/vessify-backend
cd vessify-backend
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
PORT="3001"
```

> Generate a secret: `openssl rand -base64 32`

For Render deployment, set `BETTER_AUTH_URL` to your Render service URL and `FRONTEND_URL` to the deployed Vercel frontend URL.
### 3. Push schema to database

```bash
npx prisma db push
```

### 4. Run the server

```bash
npx tsx src/index.ts
```

Server runs on `http://localhost:3001`

## Deploying to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set these settings:
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx tsx src/index.ts`
   - **Environment**: Node
5. Add all environment variables from `.env.example` in the Render dashboard
6. Change `BETTER_AUTH_URL` to your Render URL after deploy

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register user + create org atomically |
| POST | `/api/auth/sign-in/email` | ❌ | Login, returns session cookie |
| POST | `/api/auth/sign-out` | ✅ | Logout, clears session |
| GET | `/api/auth/get-session` | ✅ | Get current session |
| POST | `/api/transactions/extract` | ✅ | Parse bank text + save transaction |
| GET | `/api/transactions?cursor=&limit=20` | ✅ | Cursor-paginated transactions |

## Data Isolation

Every protected request goes through `authMiddleware` which calls
`auth.api.getSession()` — returning the verified user including `orgId`.
Every Prisma query filters by that `orgId`:

```typescript
// orgId always comes from the verified session — never from user input
prisma.transaction.findMany({ where: { orgId: user.orgId } })
```

This makes it impossible to access another org's data even with modified
requests, because `orgId` is extracted from a server-verified session cookie,
not from the request body.

## Sample Texts

All three must parse correctly:

**Sample 1** — structured format
```
Date: 11 Dec 2025
Description: STARBUCKS COFFEE MUMBAI
Amount: -420.00
Balance after transaction: 18,420.50
```

**Sample 2** — inline format
```
Uber Ride * Airport Drop
12/11/2025 → ₹1,250.00 debited
Available Balance → ₹17,170.50
```

**Sample 3** — messy format
```
txn123 2025-12-10 Amazon.in Order #403-1234567-8901234 ₹2,999.00 Dr Bal 14171.50 Shopping
```

## Test Credentials

```
User 1: alice@test.com  /  Pass123!  (Alice Org)
User 2: bob@test.com    /  Pass123!  (Bob Org)
```

## Project Structure

```
src/
├── index.ts                 # Entry point — Hono app, CORS, routes
├── routes/
│   ├── auth.ts              # Custom register + Better Auth handler
│   └── transactions.ts      # Extract + paginated list
├── middleware/
│   └── auth.ts              # Session verification via Better Auth
├── lib/
│   ├── auth.ts              # Better Auth instance with prismaAdapter
│   ├── prisma.ts            # PrismaClient singleton with PrismaNeon adapter
│   └── parser.ts            # Pure function — parses all 3 sample formats
└── types/
    └── index.ts             # Shared TypeScript types
prisma/
└── schema.prisma            # 6 models: Organization, Transaction + 4 Better Auth models
```

## AI Tools Used

Claude (claude.ai) was used for architecture planning, debugging Prisma 7 +
Neon adapter issues, Better Auth integration, and code generation.
All generated code was reviewed and understood line by line before committing.