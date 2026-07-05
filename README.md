# MoneyPath

A student education-loan document platform. Students register, complete a profile
wizard, upload their documents, apply for a loan, and track it through review,
sanction, and disbursement. Admins review applications, verify documents, and
advance loan stages.

Monorepo (npm workspaces):

- **`apps/web`** — Next.js 14 (App Router) frontend
- **`apps/api`** — Express + TypeScript API
- **`packages/shared`** — shared TypeScript types

Backing services: **Supabase** (Postgres + document storage), **Upstash Redis**
(OTP + rate limiting + background jobs), **Resend** (email OTP + notifications).

## Local development

Prerequisites: Node 20+, and a `.env` in `apps/api` (copy `apps/api/.env.example`)
plus `apps/web/.env.local` (copy `apps/web/.env.example`).

```bash
npm install                 # installs all workspaces
npm run dev:api             # API on http://localhost:4000
npm run dev:web             # web on http://localhost:3000
```

OTP in local dev prints to the API console (`MESSAGING_MODE=dev`). See
`HOW_TO_RUN.md` for the full walkthrough and test accounts.

## Environment variables

### API (`apps/api`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Supabase Postgres connection string (port 5432, direct) |
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | yes | Supabase service-role key (server-only — never expose) |
| `REDIS_URL` | yes | Upstash Redis `rediss://` URL |
| `JWT_SECRET` | yes | Long random secret (32+ chars) for signing JWTs |
| `INTERNAL_API_KEY` | yes | Separate secret for the internal leads endpoint |
| `ALLOWED_ORIGIN` | yes | Frontend origin for CORS (e.g. the deployed web URL) |
| `RESEND_API_KEY` | yes | Resend API key (`re_...`) |
| `MESSAGING_MODE` | no | `dev` (default, codes to console) or `live` (real email via Resend) |
| `EMAIL_FROM` | no | Sender for OTP emails (default `MoneyPath <onboarding@resend.dev>`) |
| `MSG91_API_KEY` | yes | Placeholder (`stub-...`); SMS is not used yet |
| `NODE_ENV` | no | `development` / `production` |
| `PORT` | no | Defaults to 4000 (Railway injects its own) |

### Web (`apps/web`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes (prod) | Base URL of the deployed API (e.g. `https://…railway.app`) |

## Deployment

- **Web → Vercel**: root config in `vercel.json`. Set `NEXT_PUBLIC_API_URL` to the API URL.
- **API → Railway**: root config in `railway.json`. Set all API env vars above. The
  start command runs `prisma migrate deploy` before booting, so migrations apply on release.

To enable real OTP emails in production, set `MESSAGING_MODE=live` and a real
`RESEND_API_KEY` (and, once you own a domain, a verified `EMAIL_FROM`).

## Scripts

```bash
npm run build                                  # build all workspaces
npm run build --workspace=apps/api             # API: prisma generate + tsc → dist/
npm run start --workspace=apps/api             # API: migrate deploy + node dist/index.js
npm run prisma:migrate --workspace=apps/api    # create/apply a migration in dev
npm run seed --workspace=apps/api              # seed the test admin + lenders
```
