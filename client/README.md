# Museiac client

This package is the Next.js frontend for Museiac. It runs on port `3001` and
talks to the Express backend on port `3000`.

## Run from the repository root

```bash
pnpm install
pnpm --filter @museiac/backend dev
pnpm --filter @museiac/client dev
```

Open the web app at `http://localhost:3001`. The backend health endpoint is
`http://localhost:3000`.

## Environment

Create `client/.env.local` when direct browser-to-API calls are needed:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

The Next.js server proxy also uses `BACKEND_ORIGIN`, which defaults to
`http://localhost:3000` in `next.config.ts`.

## Routes

- `/`: public landing page
- `/login`, `/register`, `/verify-email`: authentication flow
- `/complete-profile`: authenticated profile and plan selection
- `/dashboard`: user workspace
- `/admin/dashboard`, `/admin/users`, `/admin/plans`: admin workspace
