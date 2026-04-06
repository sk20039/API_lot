# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all workspace dependencies
pnpm install

# Run both servers concurrently (API on :3001, web on :5173)
pnpm dev

# Run individually
pnpm --filter @apilot/api dev       # Express API (tsx watch)
pnpm --filter @apilot/web dev       # Vite + React

# Build
pnpm --filter @apilot/shared build  # must build shared first
pnpm --filter @apilot/api build     # tsc → dist/
pnpm --filter @apilot/web build     # tsc + vite build

# Type-check without emitting
cd apps/api && npx tsc --noEmit
cd apps/web && npx tsc --noEmit
```

No test suite exists yet (Phase 1).

## Architecture

**Monorepo** (pnpm workspaces): `packages/shared`, `apps/api`, `apps/web`.

### `packages/shared`
Pure TypeScript types shared by both apps — `HttpMethod`, `RequestConfig`, `KeyValuePair`, `AuthConfig`, `ProxyResponse`, `Environment`. No runtime code. Must be built (`pnpm --filter @apilot/shared build`) before the API can resolve its imports at runtime.

### `apps/api` — Express proxy server
The core backend concern is **`src/services/proxyService.ts`**: takes a `RequestConfig`, injects auth headers/params, fires the request via `axios` (with `validateStatus: () => true` so 4xx/5xx never throw), and returns a `ProxyResponse` with timing and size metadata.

All persistence is **in-memory** — `src/utils/inMemoryStore.ts` holds `users[]` and `history[]` arrays (capped at 100). No database. Users array resets on server restart.

Auth flow: bcrypt password hashing, JWT signed with `JWT_SECRET` from `.env`. The frontend stores the token in `localStorage` under key `apilot_token`. The backend does **not** validate the JWT on proxy/history routes in Phase 1 — auth is frontend-only gating.

### `apps/web` — React SPA
**State is managed entirely in Zustand stores** (`src/stores/`):
- `requestStore` — owns the current request form state + `sendRequest()` action which orchestrates variable substitution → proxy call → history push.
- `historyStore` — persisted to `localStorage` (`apilot_history`), capped at 50 entries.
- `environmentStore` — persisted to `localStorage` (`apilot_environments`), exposes `getActiveVariables()`.

**Variable substitution** (`src/utils/varParser.ts`): `{{varName}}` pattern applied to url, params, headers, and body before the request is sent. Unknown variables are left unchanged.

**Routing**: React Router v6. `/` requires auth (PrivateRoute checks `localStorage` for token). `/login` and `/register` redirect away if already authenticated.

**Vite proxy**: all `/api/*` requests from the browser are proxied to `http://localhost:3001`, so the frontend never hard-codes the API host.

## Key Configuration

- API port and JWT secret: `apps/api/.env` (PORT=3001, JWT_SECRET, WEB_ORIGIN)
- `tsconfig.base.json` — root shared TS config. API overrides to `module: Node16` + disables `declaration`. Web adds `jsx: react-jsx` and `@` path alias.
- `tailwind.config.ts` uses CSS variables (HSL) for all theme colors — edit `src/index.css` `:root` vars to retheme.
