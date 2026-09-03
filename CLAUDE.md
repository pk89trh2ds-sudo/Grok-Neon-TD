# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server (0.0.0.0:8080). Always goes through `scripts/with-app-env.mjs` (never run `vite dev` directly — it injects `.grok/app-env.json` as env, e.g. `VITE_AUTH_ENABLED`).
- `npm run build` — production build (Vercel SSR target) + `npm run db:migrate`.
- `npm run build:portal` — static-SPA build for Poki/CrazyGames/itch.io (no server functions; see Architecture below).
- `npm run preview` / `npm run preview:restart` / `npm run preview:stop` — serve the built output on 127.0.0.1:8081.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` / `npm run format` — ESLint / Prettier (`prettier -w .`).
- `npm run test` — runs `scripts/**/*.test.mjs` via `node --test`, plus two TS tests (`src/lib/app-data/app-data.test.ts`, `src/lib/auth/gate-identity.test.ts`) via `node --experimental-strip-types --test`.
  - Single `.mjs` test: `node --test scripts/<name>.test.mjs`
  - Single `.ts` test: `node --experimental-strip-types --test src/lib/auth/gate-identity.test.ts`
- `npm run check:auth` — verifies the auth on/off invariant (`.grok/app-env.json` vs `migrations/`).
- `npm run db:migrate` — applies `migrations/*.sql` (non-recursive) to the configured Postgres.

## Architecture

### This is a Grok-Build-scaffolded app — some constraints are load-bearing, not stylistic

This repo was scaffolded by "Grok Build" (see `AGENTS.md` for the full sandbox
contract). Several pieces exist to satisfy that platform and must not be
removed or worked around even though they look unrelated to the game:
- `server/middleware/grok-pwa.ts` + `scripts/grok-pwa-plugin.mjs` — PWA install
  page, manifest, and the "Created with Grok" branding injector.
- `<PreviewHostBridge />` in `src/routes/__root.tsx` — live-preview control channel; a no-op outside the Grok preview.
- `public/__grok/`, `.grok/` — platform chrome/config, not app content.
- `startup.sh` — the sandbox's revive contract; not used in this deployment path (Vercel) but kept in sync regardless.
- Auth/DB are opt-in per `.grok/app-env.json` (currently **ON** — `VITE_AUTH_ENABLED: "true"`, `deploy.database: true` — this app turned on the pre-wired-but-disabled backend for cloud save/leaderboards/entitlements).

### Dual-wiring: every raw HTTP route needs a dev-server twin

Nitro (`serverDir: "./server"`) is only registered in `vite.config.ts` for
`build`/`preview`/deploy, not for `npm run dev` (`vite dev`). So every raw
HTTP endpoint is wired **twice**:
1. A Nitro middleware under `server/middleware/*.ts` (build/preview/deploy).
2. A matching Vite `configureServer` plugin in `vite.config.ts` (dev).

Existing examples to copy the pattern from: `authPopupPlugin()` /
`src/lib/auth/popup.server.ts` (OAuth popup, GET-only), `authApiPlugin()` /
`server/middleware/auth-api.ts` (Better Auth at `/api/auth/*`, mounts
`auth.handler(request)`), `stripeWebhookPlugin()` /
`server/middleware/stripe-webhook.ts` (`/api/stripe/webhook`, raw-body
signature verification). Both sides construct a real `Request` from the raw
Node req/res and hand it to the same underlying handler — keep the logic in
one shared module and have both wiring points call into it.

### `.server.ts`-suffixed files are blocked from ALL client-reachable imports

The import-protection Vite plugin (`tanstack-start-core:import-protection`)
blocks importing anything from a `*.server.ts` file into client-reachable
code — **even a `createServerFn` result that's meant to be called from the
client** (it fails at runtime with a "Mocked import used in dev client"
error, and the game engine silently fails to bind). So:
- `createServerFn` definitions callable from the client: name the file
  **without** `.server.ts` (e.g. `src/lib/game/cloud-sync-api.ts`,
  `leaderboard-api.ts`, `entitlements-api.ts`).
- Reserve `.server.ts` only for files that are **never** imported by client
  code — e.g. `src/lib/game/stripe-webhook.server.ts`, imported only from the
  Nitro/Vite middleware above.

### Game engine/store split (`src/lib/game/`)

- `types.ts` — all shared types/constants (`GamePhase`, `Screen`, tower/enemy
  kinds, `PlayerProfile`, `TOWER`/`ENEMY` balance tables, `defaultProfile()`).
- `sim.ts` — pure simulation: `CombatSimulation`, map generation (`makePath`,
  fully deterministic — no RNG), and `SplitMix64`/`hashStr`, the seeded RNG
  used for both the daily shop and the daily-challenge seed.
- `meta.ts` — profile/economy mutations (shop, workshop, skills, prestige,
  daily crate/missions, save-integrity checksum + tamper flagging,
  export/import JSON).
- `workshop.ts`, `ciphers.ts` — permanent upgrade tree and the glyph/chassis
  "Forge" crafting system, respectively.
- `renderer.ts` — hand-rolled Canvas2D renderer (towers/enemies/particles),
  no external rendering lib.
- `engine.ts` — the orchestrator: owns the game loop, calls into `sim.ts` for
  combat and `meta.ts` for economy, pushes state into the Zustand `store.ts`,
  and wires cross-cutting concerns (analytics `track()`, the ad adapter
  lifecycle, cloud sync, Stripe checkout/entitlements). UI components read
  from `store.ts` and call methods on the engine instance, never mutate game
  state directly.
- `store.ts` — Zustand store (`useGame`); pure UI-facing state mirror, no game logic.
- `cloud-sync.ts` / `cloud-sync-api.ts`, `leaderboard-api.ts`,
  `entitlements-api.ts` — the three server-function modules (see the
  `.server.ts` rule above for why they're named this way).

### Ads (`src/lib/ads/adapter.ts`)

A small `AdAdapter` interface (`init`, lifecycle hooks, `showRewardedAd`)
with `NullAdapter`, `PokiAdapter`, `CrazyGamesAdapter`. Both portal SDKs load
harmlessly outside their own portal, so `detectPortal()` checks
`document.referrer`/`location.ancestorOrigins` **before** loading either
script — never infer the portal from which SDK responded.

### Two build targets from one `vite.config.ts`

- Default (`npm run build`): full SSR app, `nitro({ preset: "vercel" })`,
  every non-asset route can hit a serverless function. This is what deploys.
- `npm run build:portal` (env-detected via `npm_lifecycle_event`): a fully
  static SPA (`tanstackStart({ spa: { enabled: true } })` +
  `nitro({ preset: "static" })`) for zipping and uploading to Poki/CrazyGames/
  itch.io — no backend available there. Orchestrated by
  `scripts/build-portal.mjs`, which also works around a known Nitro 3 beta
  crash on the final build step (verifies `.output/public/` is actually
  correct before treating that specific failure as tolerable — never
  silently swallows a different failure).

### Auth

Better Auth runs at `/api/auth/*`. Only **email/password**
(`src/lib/auth/email-password.ts`) actually works in an independently
deployed instance of this app — the Google/X buttons in the upstream
template federate through a Grok-hosted auth broker
(`GROK_AUTH_ISSUER`) that has no presence outside the Grok platform, so they
are not used here.

### Path alias

`@/*` → `./src/*` (see `tsconfig.json`).
