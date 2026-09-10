# Museiac

Museiac is a music platform project with a TypeScript Express API, a Next.js web client, and shared validation contracts.

## Repository layout

```text
museiac/
├── backend/       Express API, Prisma database layer, auth and business modules
├── client/        Next.js web application and admin screens
├── contracts/     Shared Zod schemas and TypeScript types
├── infra/         Infrastructure files; Docker Compose is planned but not present yet
├── docs/          Developer and architecture documentation
├── .nvmrc         Recommended Node.js major version: 22
├── package.json   Root workspace scripts
└── pnpm-workspace.yaml
```

For a detailed Hinglish explanation of the folders and code flow, read:

- [docs/DEVELOPER_GUIDE_HINGLISH.md](docs/DEVELOPER_GUIDE_HINGLISH.md)

## Requirements

- Node.js 22 or newer
- pnpm 9.15.0
- PostgreSQL for the API
- Git

Node is currently installed in `C:\Program Files\nodejs` on Windows. If `corepack enable` returns an `EPERM` error, open PowerShell as Administrator once, or install pnpm in a user-writable location and then run `pnpm --version`.

## New Developer Setup

Beginner ke liye exact order:

### 1. Tools check karein

Git, Node.js 22+, pnpm 9.15.0, aur PostgreSQL install karein. Phir repository root me ye commands ek-ek karke run karein:

```bash
git --version
node --version
pnpm --version
```

Windows me `pnpm` missing ho to PowerShell me run karein:

```powershell
corepack prepare pnpm@9.15.0 --activate
pnpm --version
```

`corepack enable` par `EPERM` aaye to PowerShell ko Administrator ke roop me open karein. Commands ko ek hi line me paste na karein.

### 2. Repository clone karein

```bash
git clone https://github.com/museiac/music.git
cd music
ls
```

`ls` output me `backend`, `client`, `contracts`, `package.json`, aur `pnpm-workspace.yaml` dikhna chahiye.

### 3. Dependencies install karein

```bash
pnpm install
```

### 4. Environment files banayein

`backend/.env` file banayein:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/museiac"
PORT=5000
JWT_SECRET="replace-with-a-long-random-secret"
```

Agar frontend direct backend ko call karega to `client/.env.local` banayein:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### 5. Database prepare karein

PostgreSQL me `museiac` database create karke root se run karein:

```bash
pnpm --filter @museiac/backend exec prisma generate
pnpm --filter @museiac/backend exec prisma migrate dev
pnpm --filter @museiac/backend exec prisma db seed
```

### 6. Backend aur frontend start karein

Terminal 1:

```bash
pnpm --filter @museiac/backend dev
```

Terminal 2:

```bash
pnpm --filter @museiac/client dev
```

API `http://localhost:5000` aur web app `http://localhost:3001` par open karein. API root par backend running ka JSON response aana chahiye.

### 7. Verify karein

```bash
pnpm typecheck
pnpm build
pnpm lint
pnpm test
```

## Install Reference

Run these commands from the repository root:

```bash
pnpm install
```

The repository uses pnpm workspaces. Do not run `npm install` separately inside `backend` or `client`.

## Environment variables

Create `backend/.env` with at least:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/museiac"
PORT=5000
JWT_SECRET="replace-with-a-long-random-secret"
```

Add the email variables required by `backend/src/services/email` when email verification is enabled. Never commit `.env` files or secrets.

Create `client/.env.local` when the API is not available through the default `/api` path:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

## Database

The Prisma schema is in `backend/prisma/schema.prisma` and migrations are in `backend/prisma/migrations`.

From the root, the intended commands are:

```bash
pnpm --filter @museiac/backend exec prisma generate
pnpm --filter @museiac/backend exec prisma migrate dev
pnpm --filter @museiac/backend exec prisma db seed
pnpm --filter @museiac/backend exec prisma studio
```

The root `db:*` scripts are reserved for these workflows, but the backend package currently does not define matching `db:*` package scripts. Use the explicit Prisma commands above until those scripts are added.

## Run in development

Use two terminals:

```bash
pnpm --filter @museiac/backend dev
```

The API starts at `http://localhost:5000`.

```bash
pnpm --filter @museiac/client dev
```

The web app starts at `http://localhost:3001`.

The root shortcut is also available after pnpm is installed:

```bash
pnpm dev
```

## Useful checks

```bash
pnpm typecheck
pnpm build
pnpm lint
pnpm test
```

Only scripts that exist in a workspace package will run. The current backend has `dev`, `build`, and `start`; the client has `dev`, `build`, `start`, and `lint`.

## API overview

The backend mounts these route groups:

```text
GET  /
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-email
/api/admin/*
/api/profile/*
/api/plan/*
```

`backend/src/server.ts` loads environment variables, connects Prisma, and starts Express. `backend/src/app.ts` creates the Express app and registers route groups.

## Contribution workflow

1. Create a branch for your work.
2. Read the relevant section in [docs/DEVELOPER_GUIDE_HINGLISH.md](docs/DEVELOPER_GUIDE_HINGLISH.md).
3. Keep API, client, and contracts changes aligned.
4. Run the relevant typecheck/build command.
5. Review `git diff` and `git status`.
6. Commit with a clear message and open a pull request.

Do not commit `node_modules`, Prisma generated output, `.env` files, build output, or local database files.
