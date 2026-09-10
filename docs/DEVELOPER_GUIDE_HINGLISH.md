# Museiac Developer Guide (Hinglish)

Ye document new developer ko repo samajhne, locally run karne, aur code me safely change karne ke liye hai. Project ab ek pnpm monorepo hai.

## 1. High-level architecture

```text
Browser
  |
  v
client/ (Next.js + React, port 3001)
  |
  | fetch calls from client/src/lib/api.ts
  v
backend/ (Express + TypeScript, port 3000)
  |
  +-- Prisma client
  |
  v
PostgreSQL

contracts/ shared Zod schemas and TypeScript types
```

Simple words me:

- `client` user ko UI dikhata hai.
- `backend` authentication, profile, plans, admin actions aur database operations handle karta hai.
- `contracts` wo rules/types rakhta hai jo client aur backend dono share kar sakte hain.
- `prisma` database schema, migrations aur generated database client manage karta hai.

## 2. Root folders and files

### `backend/`

Express API ka complete code yahan hai. Iska package name `@museiac/backend` hai.

### `client/`

Next.js frontend yahan hai. Iska package name `@museiac/client` hai.

### `contracts/`

Shared package `@museiac/contracts` hai. Isme browser ya server dono par chalne wali validation aur types honi chahiye. Is package me Prisma, bcrypt, Express, ya secrets import nahi karne chahiye.

### `infra/`

Infrastructure ke liye reserved folder hai. Abhi repository me `infra/docker-compose.yml` maujood nahi hai, isliye `pnpm infra:up` abhi tab tak kaam nahi karega jab tak Docker Compose file add nahi hoti.

### `docs/`

Architecture notes, runbooks, ADRs, aur developer documentation yahan rakhein.

### `.gitignore`

Dependencies, build output, `.env` files, logs, generated Prisma output, aur editor files ko Git se bahar rakhta hai.

### `.nvmrc`

Recommended Node major version `22` batata hai.

### `package.json`

Root-level workspace scripts define karta hai. Ye individual application ka runtime code nahi hai.

### `pnpm-workspace.yaml`

pnpm ko batata hai ki `backend`, `client`, aur `contracts` teen workspace packages hain.

## 3. Backend ka code flow

### `backend/src/server.ts`

Application ka process entry point hai:

1. `dotenv/config` se environment variables load karta hai.
2. `Prisma.$connect()` se database connection establish karta hai.
3. `app.listen()` se port `3000` par server start karta hai. Ye value `backend/.env` ke `PORT` se aati hai.
4. Database connection fail ho to process exit karta hai.

### `backend/src/app.ts`

Express application create karta hai:

- JSON request body parse karta hai.
- `GET /` health-style response deta hai.
- `/api/auth` auth routes mount karta hai.
- `/api/admin` admin routes mount karta hai.
- `/api/profile` profile routes mount karta hai.
- `/api/plan` plan routes mount karta hai.

### `backend/src/config/`

Shared runtime configuration. `prisma.ts` generated Prisma client ka singleton export karta hai.

### `backend/src/middleware/`

Request ke beech me chalne wale checks:

- `auth.middleware.ts`: bearer JWT ko validate karke authenticated user identify karta hai.
- `admin.middleware.ts`: authenticated user ke admin role ko check karta hai.

### `backend/src/modules/`

Feature-wise backend code:

- `auth/`: register, login, email verification, OTP aur auth validation.
- `admin/`: admin-only routes aur admin services.
- `profile/`: logged-in user ka profile create/update related logic.
- `plan/`: public plan listing aur admin plan management.

Har module me generally ye files milengi:

- `*.routes.ts`: URL aur HTTP method define karta hai.
- `*.controller.ts`: request/response handle karta hai.
- `*.service.ts`: business logic aur database calls rakhta hai.
- `*.validation.ts` ya `*.validate.ts`: input validation rules rakhta hai.

New feature add karte waqt isi module pattern ko follow karein. Controller me heavy business logic na daalein.

### `backend/src/services/email/`

Email sending ka abstraction aur provider code. OTP/email verification ka actual delivery flow yahan se pass hota hai.

### `backend/src/utils/`

Small reusable helpers:

- `jwt.ts`: token create/verify.
- `otp.ts`: OTP generation ya related helpers.
- `password.ts`: password hashing/verification.

### `backend/src/types/express.d.ts`

Express request object ke custom TypeScript types, jaise authenticated user data.

## 4. Database and Prisma

### `backend/prisma/schema.prisma`

Database ka source of truth hai. Current models:

- `User`: account, verification state, role.
- `Profile`: user profile data.
- `Accounts`: external/provider accounts.
- `EmailVerification`: OTP hash aur expiry.
- `Plan`: subscription plan details.
- `Subscription`: user aur plan relationship.

### `backend/prisma/migrations/`

Schema changes ka history. Schema manually database me edit na karein; migration create karein.

Typical local workflow:

```bash
pnpm --filter @museiac/backend exec prisma generate
pnpm --filter @museiac/backend exec prisma migrate dev --name describe_the_change
```

### `backend/prisma/seed.ts`

Local database me initial data insert karne ke liye seed script. Isme secrets hardcode na karein.

### `backend/src/generated/prisma/`

Prisma generated output hai. Ye manually edit nahi karna chahiye. Schema ya Prisma version change ke baad `prisma generate` se regenerate karein.

## 5. Client ka code flow

### `client/src/app/`

Next.js App Router pages:

- `page.tsx`: home page.
- `login/`: login screen.
- `register/`: registration screen.
- `verify-email/`: OTP/email verification.
- `complete-profile/`: profile completion.
- `dashboard/`: authenticated user dashboard.
- `admin/`: admin layout, dashboard, plans, and users screens.
- `layout.tsx`: global app layout.
- `globals.css`: global styles.

### `client/src/components/`

Reusable UI:

- `auth/`: login, register, OTP, protected-route components.
- `layout/`: navbar aur sidebar.
- `plan/`: plan cards aur plan forms.
- `ui/`: generic button, input, card, alert, spinner, select, textarea.

### `client/src/lib/`

Frontend ke core helpers:

- `api.ts`: backend ko call karne ka central HTTP client. Bearer token yahin attach hota hai.
- `auth-context.tsx`: login state, user, token, logout, profile completion.
- `storage.ts`: browser session storage/localStorage handling.
- `session-cookies.ts`: route middleware ke liye cookies.
- `validation.ts`: frontend validation helpers.
- `errors.ts`: API errors ko display message me convert karta hai.
- `cn.ts`: class name utility.

### `client/src/hooks/`

Reusable React hooks. `useAuth.ts` auth context ko convenient interface deta hai.

### `client/src/types/`

Frontend request/response types. Shared types ko gradually `@museiac/contracts` me move karna better hoga taaki client aur backend mismatch na ho.

### `client/src/middleware.ts`

Next.js request middleware. Auth/session cookies ke basis par protected routes aur redirects control karta hai.

## 6. Contracts package

### `contracts/src/common.ts`

Pagination schema aur common API response shapes.

### `contracts/src/auth.ts`

Email, password, login, aur registration validation schemas.

### `contracts/src/plan.ts`

Plan codes, plan creation schema, aur price formatting helper.

### `contracts/src/index.ts`

Public exports ka single entry point. New shared export add karne ke baad yahan export zaroor karein.

Example:

```ts
import { loginSchema } from "@museiac/contracts";
```

ESM project hone ki wajah se local relative imports me `.js` extension use hota hai, even when source file `.ts` ho:

```ts
import { env } from "./config/env.js";
```

## 7. Local setup for a new developer

Repository clone karke root me aayein:

```bash
git clone https://github.com/museiac/music.git
cd music
```

Dependencies install karein:

```bash
pnpm install
```

Windows par `corepack enable` me `EPERM` aaye to PowerShell Administrator ke roop me ek baar run karein, ya pnpm ko user-writable location me install karein. Check:

```bash
node --version
pnpm --version
```

Node 22+ required hai.

Backend environment file banayein:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/museiac"
PORT=3000
JWT_SECRET="long-random-secret"
```

Is file ko `backend/.env` ke naam se rakhein. Current repo me backend ka `.env.example` nahi hai, isliye team ko required email variables separately provide karne honge.

Client ke liye, agar API same-origin `/api` par available nahi hai, `client/.env.local` banayein:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

Database ready hone ke baad:

```bash
pnpm --filter @museiac/backend exec prisma generate
pnpm --filter @museiac/backend exec prisma migrate dev
pnpm --filter @museiac/backend exec prisma db seed
```

Do terminals me apps chalayein:

```bash
pnpm --filter @museiac/backend dev
pnpm --filter @museiac/client dev
```

URLs:

- API: `http://localhost:3000`
- Web: `http://localhost:3001`

### Beginner checklist: agar pehli baar setup kar rahe hain

Is order ko skip na karein:

1. `node --version`, `pnpm --version`, aur `git --version` se tools check karein.
2. `git clone` karke `cd music` karein.
3. Root folder me `ls` run karke confirm karein ki `backend/`, `client/`, aur `contracts/` dikh rahe hain.
4. `pnpm install` run karein. `backend/` ya `client/` ke andar alag se `npm install` na karein.
5. `backend/.env` create karein aur `DATABASE_URL`, `PORT`, aur `JWT_SECRET` add karein.
6. PostgreSQL me `museiac` database create karein.
7. Prisma ke `generate`, `migrate dev`, aur `db seed` commands run karein.
8. Terminal 1 me backend aur Terminal 2 me client start karein.
9. Browser me `http://localhost:3001` open karein.
10. API check karne ke liye `http://localhost:3000` open karein.

### Common first-time problems

- `pnpm: command not found`: Corepack/pnpm install karein. Windows me `corepack enable` par `EPERM` aaye to Administrator PowerShell use karein.
- `DATABASE_URL is not defined`: Check karein ki file ka exact naam `backend/.env` hai, `.env.txt` nahi.
- Prisma connection error: PostgreSQL service, database name, username, password, aur port check karein.
- Browser me API error: Backend terminal running hai ya nahi aur `client/.env.local` ka URL `http://localhost:3000/api` hai ya nahi check karein.
- Port already in use: Dusra process band karein ya `PORT` change karke client/API configuration update karein.
- `404` from frontend action: `client/src/lib/api.ts` me endpoint dekhein aur matching backend route file verify karein.

## 8. Existing API aur current limitations

Current backend ke implemented endpoint groups:

- Auth: register, login, verify email, resend OTP, current user
- Admin: admin health check, users list
- Profile: profile create
- Plans: public list, admin CRUD/status, authenticated subscription

Logout intentionally frontend-only hai: token, local session, aur routing cookies clear kiye jaate hain. Backend logout route ki zaroorat nahi hai because JWT stateless hai.

Plan controllers me response ko return karne se pehle async service calls par `await` carefully check karein. Existing comments me is behavior ka warning diya gaya hai.

## 9. New feature ka recommended workflow

1. Feature ko module choose karein, jaise auth, profile, plan.
2. Zod input validation define karein.
3. Agar shape client aur backend dono use karenge to `contracts/src` me schema/type add karein.
4. Backend route add karein.
5. Controller ko thin rakhein; service me business logic rakhein.
6. Prisma data change ho to migration create karein.
7. `client/src/lib/api.ts` me real endpoint wrapper add karein.
8. Client page/component ko API wrapper ke through connect karein.
9. Loading, error, empty, unauthorized states handle karein.
10. Typecheck/build run karein.

## 10. Checks before commit

```bash
pnpm typecheck
pnpm build
pnpm lint
git diff
git status
```

Commit me ye files nahi aani chahiye:

- `node_modules/`
- `.env` ya secrets
- `.next/`, `dist/`, `build/`
- `backend/src/generated/prisma/`
- local database files

Commit message example:

```text
feat: add admin plan status endpoint
```

## 11. Safe next improvements

Recommended next engineering tasks:

1. Add `backend/.env.example` with all non-secret variable names.
2. Add a real `infra/docker-compose.yml` for PostgreSQL and Mailpit.
3. Add missing backend package scripts for `db:migrate`, `db:deploy`, `db:seed`, and `db:studio`.
4. Connect `@museiac/contracts` to backend and client using workspace dependencies.
5. Add API tests for auth, profile, admin, and plan modules.
6. Add a CI workflow that runs install, typecheck, build, lint, and tests.
