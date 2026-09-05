/**
 * Stripe webhook — grants IAP entitlements. Server-only, never import from
 * client code (this file's own name is `.server.ts` on purpose: nothing but
 * the two middleware wrappers below ever import it, so this codebase's
 * import-protection tooling never sees it from a client-reachable file —
 * see cloud-sync-api.ts for the case where that convention does NOT apply).
 *
 * Wired in two places, same request handed to the same handler:
 *   - server/middleware/stripe-webhook.ts (Nitro — build/preview/deploy)
 *   - `stripeWebhookPlugin` in vite.config.ts (`npm run dev`)
 * (mirrors the auth API mount's dual-wiring, for the same reason: Nitro only
 * runs for build/preview, so dev needs its own copy of the route).
 *
 * This is the ONLY place an entitlement is ever written — a client can ask
 * for a checkout session (entitlements-api.ts) but can never grant itself
 * one directly.
 */
import { getSql } from "../db";

export async function handleStripeWebhook(
  rawBody: string,
  signature: string | undefined,
): Promise<Response> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !stripeSecret) {
    return new Response("Stripe webhook not configured", { status: 500 });
  }
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(stripeSecret);

  let event: import("stripe").Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "signature verification failed";
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const product = session.metadata?.product;
    if (userId && product) {
      try {
        const sql = await getSql();
        await sql`
          insert into entitlements (user_id, key, stripe_checkout_session_id)
          values (${userId}, ${product}, ${session.id})
          on conflict (user_id, key) do nothing
        `;
      } catch (err) {
        // Stripe retries on a non-2xx response — fail loudly so it does.
        console.error("[stripe-webhook] failed to grant entitlement:", err);
        return new Response("Failed to record entitlement", { status: 500 });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
