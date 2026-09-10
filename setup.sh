#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[ -n "$ROOT" ] || { echo "Run this script from inside the Git repository."; exit 1; }
cd "$ROOT"

info() { printf '\n==> %s\n' "$1"; }
warn() { printf 'Warning: %s\n' "$1"; }

info "Checking repository"
NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ] && [ -x "/c/Program Files/nodejs/node.exe" ]; then
  NODE_BIN="/c/Program Files/nodejs/node.exe"
fi
if [ -z "$NODE_BIN" ] && [ -x "/mnt/c/Program Files/nodejs/node.exe" ]; then
  NODE_BIN="/mnt/c/Program Files/nodejs/node.exe"
fi
[ -n "$NODE_BIN" ] || { echo "Node.js is required."; exit 1; }
printf 'Node: '; "$NODE_BIN" --version

info "Removing accidental empty folders"
for stray in git mv mkdir; do
  if [ -d "$stray" ] && [ ! -d "$stray/.git" ]; then
    rm -rf -- "$stray"
    echo "Removed $stray/"
  fi
done

info "Moving applications"
move_dir() {
  local from="$1"
  local to="$2"
  if [ -d "$to" ]; then
    warn "$to/ already exists; leaving it in place"
  elif [ -d "$from" ]; then
    git mv "$from" "$to" 2>/dev/null || mv "$from" "$to"
    echo "$from/ -> $to/"
  else
    warn "$from/ does not exist; skipping"
  fi
}

move_dir "apps/api" "backend"
move_dir "apps/web" "client"
move_dir "packages/contracts" "contracts"

for parent in apps packages; do
  if [ -d "$parent" ] && [ -z "$(find "$parent" -mindepth 1 -maxdepth 1 -print -quit)" ]; then
    rmdir "$parent"
  fi
done

info "Removing obsolete lockfiles and nested ignore files"
rm -f backend/package-lock.json client/package-lock.json package-lock.json
rm -f backend/yarn.lock client/yarn.lock yarn.lock
rm -f backend/.gitignore client/.gitignore

if [ -f backend/src/config/email.ts ] && [ ! -s backend/src/config/email.ts ]; then
  rm -f backend/src/config/email.ts
fi

mkdir -p contracts/src infra/docker docs/adr docs/runbooks docs/architecture

info "Writing workspace configuration"
cat > pnpm-workspace.yaml <<'YAML'
packages:
  - "backend"
  - "client"
  - "contracts"
YAML

cat > package.json <<'JSON'
{
  "name": "museiac",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "pnpm --parallel -r --if-present dev",
    "build": "pnpm -r --if-present build",
    "typecheck": "pnpm -r --if-present typecheck",
    "lint": "pnpm -r --if-present lint",
    "test": "pnpm -r --if-present test",
    "db:migrate": "pnpm --filter @museiac/backend db:migrate",
    "db:deploy": "pnpm --filter @museiac/backend db:deploy",
    "db:studio": "pnpm --filter @museiac/backend db:studio",
    "db:seed": "pnpm --filter @museiac/backend db:seed",
    "infra:up": "docker compose -f infra/docker-compose.yml up -d",
    "infra:down": "docker compose -f infra/docker-compose.yml down",
    "infra:reset": "docker compose -f infra/docker-compose.yml down -v && pnpm infra:up"
  }
}
JSON

cat > .gitignore <<'GITIGNORE'
node_modules/
dist/
build/
.next/
out/
*.tsbuildinfo
**/src/generated/
coverage/
playwright-report/
test-results/
.env
.env.*
!.env.example
*.log
.DS_Store
Thumbs.db
.idea/
.vscode/
GITIGNORE

printf '22\n' > .nvmrc

info "Writing contracts package"
cat > contracts/package.json <<'JSON'
{
  "name": "@museiac/contracts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "dependencies": { "zod": "^4.5.1" }
}
JSON

cat > contracts/src/index.ts <<'TS'
export * from "./common.js";
export * from "./auth.js";
export * from "./plan.js";
TS

cat > contracts/src/common.ts <<'TS'
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;
export type ApiSuccess<T> = { data: T; meta?: { page: number; perPage: number; total: number } };
export type ApiError = { error: { code: string; message: string; fields?: Record<string, string> } };
TS

cat > contracts/src/auth.ts <<'TS'
import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email();
export const passwordSchema = z.string().min(8).max(72);
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1) });
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
TS

cat > contracts/src/plan.ts <<'TS'
import { z } from "zod";

export const PLAN_CODES = ["IGNITE", "ELITE", "ALPHA", "MAESTRO"] as const;
export type PlanCode = (typeof PLAN_CODES)[number];
export const createPlanSchema = z.object({
  code: z.enum(PLAN_CODES),
  name: z.string().min(2).max(80),
  pricePaise: z.number().int().min(0),
  interval: z.enum(["MONTHLY", "YEARLY"]).default("YEARLY"),
  artistSlots: z.number().int().min(1).max(100),
  features: z.array(z.string()).default([]),
});
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export function formatPaise(paise: number): string {
  return `Rs.${(paise / 100).toLocaleString("en-IN")}`;
}
TS

info "Updating package names"
"$NODE_BIN" <<'NODE'
const fs = require("fs");
for (const [file, name] of [["backend/package.json", "@museiac/backend"], ["client/package.json", "@museiac/client"]]) {
  if (!fs.existsSync(file)) continue;
  const packageJson = JSON.parse(fs.readFileSync(file, "utf8"));
  packageJson.name = name;
  delete packageJson.packageManager;
  fs.writeFileSync(file, `${JSON.stringify(packageJson, null, 2)}\n`);
}
NODE

info "Checking result"
[ -d backend ] || { echo "backend/ was not created."; exit 1; }
[ -d client ] || { echo "client/ was not created."; exit 1; }
[ -d contracts ] || { echo "contracts/ was not created."; exit 1; }
git add -A
git status --short | sed -n '1,40p'
echo
echo "Done. Review the staged changes, then commit when ready."
