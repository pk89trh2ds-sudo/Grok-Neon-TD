/**
 * Server functions for IAP entitlements and Stripe Checkout (`createServerFn`
 * — safe to import from client code; see the naming note in cloud-sync-api.ts
 * for why this is NOT named `*.server.ts`). Granting an entitlement itself
 * only ever happens from the webhook (src/lib/game/stripe-webhook.server.ts)
 * — never from a client call — so a client can request a checkout session
 * but can never grant itself an entitlement directly.
 */
import { createServerFn } from "@tanstack/react-start";
import { getSql } from "../db";
import { authMiddleware } from "../auth/middleware";
import { IAP_CATALOG, type IapProductKey } from "./iap-catalog";

/** Server-only env var name holding each product's live Stripe Price ID. */
const PRICE_ENV: Record<IapProductKey, string> = {
  remove_ads: "STRIPE_PRICE_REMOVE_ADS",
  premium_pass_s1: "STRIPE_PRICE_PREMIUM_PASS_S1",
  starter_pack: "STRIPE_PRICE_STARTER_PACK",
};

function isIapProductKey(value: unknown): value is IapProductKey {
  return typeof value === "string" && value in IAP_CATALOG;
}

async function stripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY is not configured");
  const { default: Stripe } = await import("stripe");
  return new Stripe(secret);
}

export const getEntitlements = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<string[]> => {
    const sql = await getSql();
    const rows = await sql<{ key: string }>`
      select key from entitlements where user_id = ${context.userId}
    `;
    return rows.map((r) => r.key);
  });

export const createIapCheckoutSession = createServerFn({ method: "POST" })
  .validator((input: unknown): IapProductKey => {
    if (!isIapProductKey(input)) throw new Error("Unknown product");
    return input;
  })
  .middleware([authMiddleware])
  .handler(async ({ data: product, context }): Promise<{ url: string }> => {
    const priceId = process.env[PRICE_ENV[product]];
    if (!priceId) {
      throw new Error(
        `${PRICE_ENV[product]} is not configured — this product isn't purchasable yet`,
      );
    }
    const stripe = await stripeClient();
    // Set once at deploy (the app's own public URL) — there's no reliable
    // request-derived origin inside a createServerFn handler in this
    // framework version, so this stays explicit rather than guessed.
    const origin = process.env.APP_ORIGIN;
    if (!origin) throw new Error("APP_ORIGIN is not configured");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: context.userId,
      metadata: { userId: context.userId, product, game: "neon-td" },
      success_url: `${origin}/?purchase=success`,
      cancel_url: `${origin}/?purchase=cancelled`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url };
  });
