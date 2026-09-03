-- Opt-in cloud save. One row per signed-in player, storing the same
-- PlayerProfile shape already persisted to localStorage (src/lib/game/meta.ts)
-- as a single JSON blob rather than modeling every field as a column — the
-- profile shape evolves with the game and localStorage already treats it the
-- same way (defaultProfile() merge on load absorbs new fields).
--
-- Scoped by user_id (TEXT, matching Better Auth's "user"."id" — see
-- migrations/0001_auth.sql) per src/lib/auth/middleware.ts's contract: every
-- query must be scoped to the verified context.userId, never a client-sent id.
create table if not exists "profiles" (
  "user_id" text not null primary key,
  "data" jsonb not null,
  "updated_at" timestamptz not null default now()
);
