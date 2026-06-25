# Downloaderino

A movie and series download app that lets users search, browse, and download HD content for free with no sign-up required.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port from env)
- `pnpm --filter @workspace/downloaderino run dev` — run the frontend (port from env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS v4 + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (not yet used — app is purely frontend + proxy)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/downloaderino/src/` — frontend React app
  - `App.tsx` — main app with custom view-state routing (home/detail/altsource/admin/request/404)
  - `api.ts` — axios wrappers for all movie API calls (via `/api/proxy/*`)
  - `analytics.ts` — client-side analytics stored in localStorage
  - `types.ts` — TypeScript types (MovieItem, MovieDetail, etc.)
  - `components/` — Layout, Navbar, MovieCard, MovieDetailView, TrailerModal, etc.
  - `pages/` — HomePage, AdminAnalytics, RequestPage, StatsPage
- `artifacts/api-server/src/routes/`
  - `proxy.ts` — forwards `/api/proxy/*` to upstream `https://movie-api-nine-chi.vercel.app`
  - `dl.ts` — streams media downloads with Origin/Referer headers (ported from Vercel Edge Function)

## Architecture decisions

- **Custom view-state routing**: App uses manual `window.history.pushState` + state machine instead of a router library — preserves the original Vercel app's behavior exactly.
- **Proxy-first API**: All movie API calls go through `/api/proxy/*` on the Express server to avoid CORS. The upstream is `movie-api-nine-chi.vercel.app`.
- **Download proxy**: Media files are streamed through `/api/dl` with spoofed Origin/Referer headers because the CDN (`hakunaymatata.com`, `aoneroom.com`) rejects direct browser requests.
- **localStorage analytics**: Admin analytics panel reads from localStorage — no server-side tracking needed.

## Product

- Search movies, series, and anime by title
- Browse featured content on the home page
- View movie/series details with trailers, season/episode selectors
- Download content in various qualities and formats
- Request missing content via the request page
- Admin analytics dashboard (client-side, localStorage-based)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Express 5 wildcard syntax**: Use `{*path}` not `*` or `:path(*)` — Express 5 uses path-to-regexp v8 which has different wildcard syntax.
- **Route prefix**: The Express router is mounted at `/api`, so routes inside are `/proxy/...` and `/dl`, not `/api/proxy/...`.
- **No `pnpm dev` at root**: Artifacts run via Replit workflows; there's no root-level dev script.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
