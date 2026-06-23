# Vessify Backend

Minimal backend for Vessify using Hono, Better Auth, and Prisma Neon.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your database URL in `.env`:
   ```env
   DATABASE_URL="postgresql://..."
   ```

3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

## Run

```bash
npm start
```

The server listens on `3001` by default.

## Test

```bash
npm test
```

## Notes

- Auth routes live under `/api/auth`
- Transaction routes live under `/api/transactions`
- Parser logic is covered by a minimal Vitest suite
