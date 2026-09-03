-- Daily seeded challenge leaderboard. One best-score row per player per day
-- (day, user_id) — resubmitting a better run for the same day upserts in
-- place; a worse one is rejected by the application layer, not here.
--
-- Reading the leaderboard is public (no authMiddleware) — it's a public
-- ranking, not per-user data, and display_name is whatever the player has
-- already set for themselves (src/lib/game/meta.ts rename()). Writing goes
-- through authMiddleware, scoped to the caller's own user_id.
create table if not exists "daily_leaderboard" (
  "day" text not null,
  "user_id" text not null,
  "display_name" text not null,
  "wave" integer not null,
  "submitted_at" timestamptz not null default now(),
  primary key ("day", "user_id")
);

create index if not exists "daily_leaderboard_day_wave_idx"
  on "daily_leaderboard" ("day", "wave" desc);
