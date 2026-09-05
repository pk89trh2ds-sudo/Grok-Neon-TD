-- IAP entitlements, granted server-side only (Stripe webhook — see
-- src/lib/game/entitlements-api.ts). Never trust a client-reported purchase;
-- this table is the single source of truth for what a signed-in player owns.
create table if not exists "entitlements" (
  "user_id" text not null,
  "key" text not null,
  "granted_at" timestamptz not null default now(),
  "stripe_checkout_session_id" text,
  primary key ("user_id", "key")
);
