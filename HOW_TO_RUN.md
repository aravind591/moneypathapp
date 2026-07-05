# How to Run & Test MoneyPath (Local Dev)

Everything works locally in **stub mode** — you do NOT need real SMS/email providers.
OTP codes and stage-change notifications print to the **API server console**.

## Start the app

Open **two terminals** in `g:\moneypathapp`.

**Terminal 1 — API** (keep this visible; your OTP codes appear here):
```
npm run dev:api
```
Wait for:
```
API listening on http://localhost:4000 (development)
Redis connected
```

**Terminal 2 — Web:**
```
npm run dev:web
```
Then open http://localhost:3000

---

## Student flow (new: email + password + 6-step onboarding)

**Sign up (new account):**
1. Open http://localhost:3000/signup
2. Fill First/Last name, Email, Phone, Password (min 8 chars), Preferred Country → **Sign up**.
3. **Look at Terminal 1** for the verification OTP:
   `[SMS STUB] to <phone>: Your MoneyPath verification code is 123456`
4. Enter the 6-digit code → **Verify & Continue** → you're logged in and land in onboarding.
5. Complete the 6-step wizard (Basic Info → Academic → Study Destination → Financial →
   Co-applicant/Collateral → Documents). Each step saves as you go; you can leave and
   resume where you left off (`/onboarding` resumes at the next incomplete step).
6. Finish → Dashboard. Start a loan application, upload documents, track status.

**Log in (returning):**
1. Open http://localhost:3000/login → enter Email + Password → **Sign in**.
2. Or use the **"Send OTP to Phone"** fallback (phone → 6-digit code from Terminal 1).
   Legacy OTP-only accounts (no password) must use this OTP path.

> Note: Google sign-up and "Forgot Password" are UI placeholders (non-functional).

## Admin flow

1. Open http://localhost:3000/admin/login
2. Email: `admin@moneypath.local`  ·  Password: `ChangeMe123!`
3. **2FA:** add this TOTP secret to Google Authenticator / Authy: `BJCVC73SDUYVU4LF`
   (or re-run `npm run seed --workspace=apps/api` to mint a fresh one).
   Enter the rotating 6-digit code.
4. You'll see the application queue → click a row to open detail.
5. View/verify documents, and advance the loan stage.
6. Advancing a stage prints the notification in Terminal 1 and updates the
   student's Track page (it polls every 30s).

---

## Gotchas

- **`429 Too Many Requests` on login:** the auth rate limiter allows only 10 auth
  requests / 15 min / IP. Restart the API (Ctrl+C in Terminal 1, then `npm run dev:api`)
  to clear it instantly — it's in-memory.
- **Port already in use (EADDRINUSE :4000):** a previous API process is still running.
  Stop it, or kill whatever is on port 4000, then start again.
- **One application per student:** a student can only have one active application. To
  test a fresh submission, log in with a different phone number.

---

## Not yet done (when you're ready, just ask)

- **Phase 7 — Leads API** (a single internal `GET /admin/leads` endpoint). Not built yet.
- **Real SMS/email:** add real `MSG91_API_KEY` / `RESEND_API_KEY` to `apps/api/.env`.
  The code auto-switches off stubs when a non-"stub" key is present (provider calls
  still need to be implemented in `notification.service.ts`).
- **Git + deployment.**
