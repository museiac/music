# Museiac — Frontend

Next.js (App Router, TypeScript) frontend for the existing Museiac backend in
[`../backend`](../backend). This app only talks to that backend over HTTP —
nothing here modifies Express, Prisma, or backend auth logic.

## Setup

```bash
cd client
npm install
cp .env.example .env.local
npm run dev
```

The dev server runs at **http://localhost:3001** (the backend already owns
port 3000 — see `backend/.env`). Make sure the backend is running first:

```bash
cd backend
npm run dev
```

## How API calls reach the backend

The backend registers no CORS middleware (`backend/src/app.ts`), and this
project must not modify the backend. So `NEXT_PUBLIC_API_URL` defaults to the
relative path `/api`, and `next.config.ts` proxies `/api/*` to
`BACKEND_ORIGIN` (default `http://localhost:3000`) on the server side —
server-to-server requests aren't subject to browser CORS. Every request
still goes through `src/lib/api.ts`; nothing is hardcoded elsewhere.

If the backend later adds CORS support, point `NEXT_PUBLIC_API_URL` directly
at it (e.g. `http://localhost:3000/api`) to skip the proxy.

## What's actually live on the backend today

Read directly from the backend source before building this frontend. Three
routes exist and are fully wired up end-to-end:

| Method | Path | Source |
| --- | --- | --- |
| POST | `/api/auth/register` | `backend/src/modules/auth/auth.routes.ts` |
| POST | `/api/auth/login` | `backend/src/modules/auth/auth.routes.ts` |
| POST | `/api/auth/verify-email` | `backend/src/modules/auth/auth.routes.ts` |
| GET | `/api/admin/test` | `backend/src/modules/admin/admin.routes.ts` (requires a Bearer token for an `ADMIN` user) |

**`verify-email` does not return a session.** Unlike `login`, its response is
just `{ success, message }` — no `accessToken`, no `user` (see
`auth.controller.ts`). So verifying an account does not log the user in;
`OtpForm.tsx` redirects to `/login?verified=1&email=…` afterward instead,
where a real login call returns the actual token. This frontend was adjusted
to match that response exactly rather than assuming a token that isn't sent.

⚠️ Also worth knowing (not fixed here, since it's a backend file): the OTP
check in `backend/src/modules/auth/otp.service.ts` calls
`comparePassword(otp, verification.otpHash)` without `await`. Since that
function returns a `Promise<boolean>`, the `if (!isValid)` check is testing
a Promise object, which is always truthy — so **any 6-digit code currently
verifies successfully**, not just the real one.

The following are built on the frontend per the project's contract, calling
real `fetch` requests to the exact paths below, but will 404 until the
backend adds them — `auth.routes.ts` doesn't register any of them yet:

| Method | Path | Used by |
| --- | --- | --- |
| POST | `/api/auth/resend-otp` | `/verify-email` page |
| POST | `/api/auth/complete-profile` | `/complete-profile` page |
| GET | `/api/auth/me` | `refreshUser()` in `lib/auth-context.tsx` |
| GET | `/api/admin/users` | `/admin/users` page |
| GET/redirect | `/api/auth/google` | "Continue with Google" button |

Every one of these calls is isolated in `src/lib/api.ts` with a comment
explaining it's pending — adding the backend route is a one-line change on
the frontend to remove that comment; no other file needs to move. There is
also no `POST /api/auth/logout` route, so signing out is handled entirely in
the frontend (clear stored token/user).

## Auth architecture

- The backend issues a stateless JWT (`backend/src/utils/jwt.ts`, 15 minute
  expiry, no refresh token, no cookies) sent back as `accessToken` in the
  login/verify response and attached as `Authorization: Bearer <token>` on
  every subsequent request (`src/lib/api.ts`).
- `src/lib/auth-context.tsx` is the single source of frontend auth state
  (`user`, `token`, `isAuthenticated`, `isLoading`, `login`, `register`,
  `verifyEmail`, `resendOtp`, `completeProfile`, `logout`, `refreshUser`),
  persisted to `localStorage` so a refresh doesn't sign you out.
- `src/middleware.ts` reads three small, non-sensitive cookies
  (`src/lib/session-cookies.ts`) mirrored from the backend's own response —
  never the JWT itself — purely so protected routes redirect instantly
  server-side. `src/components/auth/ProtectedRoute.tsx` re-checks the same
  conditions against live client state as the real guard (e.g. it catches a
  token that expired mid-session, since the 15-minute JWT has no refresh).
- Every 401 from a protected call (see `/admin/dashboard`, `/admin/users`)
  signs the user out and redirects to `/login`, since the backend is always
  the authority on whether a token is valid.

## Testing flow

**Register → verify → login → dashboard**:

1. `/register` → `POST /api/auth/register` → redirected to `/verify-email`
2. Enter the OTP emailed to the address (`otp.service.ts` sends it today) →
   `POST /api/auth/verify-email` → success message → redirected to
   `/login?verified=1&email=…` (no session yet — see the note above)
3. Log in with the same credentials → `POST /api/auth/login` now succeeds
   (the account is verified) → `/complete-profile` or `/dashboard` depending
   on `profileCompleted`

**Login** (works today for an already-verified account, e.g. the seeded
admin):

1. `/login` → `POST /api/auth/login`
2. Unverified account → `requiresVerification: true` → `/verify-email`
3. Verified account → redirected to `/complete-profile` or `/dashboard`

**Admin** — seed the admin user first (`npm run` your existing seed script
in `backend`, or however you already run `backend/prisma/seed.ts`), then log
in as `admin@museiac.com` / `Admin@123456`:

1. `/admin/dashboard` calls the real `GET /api/admin/test`
2. `/admin/users` calls `GET /api/admin/users` (shows a clear "not
   implemented yet" message until the backend adds it)
3. A `USER`-role account visiting `/admin/*` is redirected to `/dashboard`
   by both `middleware.ts` and `ProtectedRoute`
