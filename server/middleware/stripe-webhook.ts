/**
 * Mounts the Stripe webhook at `/api/stripe/webhook` for the deployed/preview
 * (Nitro) runtime — same mechanism as auth-api.ts (serverDir: "./server").
 * `event.req` is a real `Request` in this Nitro version, so the raw body and
 * `stripe-signature` header are read directly, no adaptation needed.
 */
import { handleStripeWebhook } from "../../src/lib/game/stripe-webhook.server";

interface StripeWebhookEvent {
  url: URL;
  req: Request;
}

export default async function stripeWebhookMiddleware(
  event: StripeWebhookEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  if (event.url.pathname !== "/api/stripe/webhook") return next();
  if (event.req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const rawBody = await event.req.text();
  const signature = event.req.headers.get("stripe-signature") ?? undefined;
  return handleStripeWebhook(rawBody, signature);
}
