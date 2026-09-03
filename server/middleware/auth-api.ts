/**
 * Mounts this app's own Better Auth at `/api/auth/*` for the deployed/preview
 * (Nitro) runtime. Auto-registered as global h3 middleware because
 * vite.config.ts sets `serverDir: "./server"` (same mechanism as
 * `grok-pwa.ts`).
 *
 * `event.req` in this Nitro version is a genuine, standard `Request` (h3's
 * fetch-first event) — so this is just a direct handoff to Better Auth's own
 * framework-agnostic `handler(request): Promise<Response>`, no adaptation
 * needed. Dev (`npm run dev`, plain `vite dev`) is covered by a parallel Vite
 * middleware — `authApiPlugin` in vite.config.ts — since Nitro (and this
 * directory) is only wired up for build/preview.
 */
import { auth } from "../../src/lib/auth/server";

interface AuthApiEvent {
  url: URL;
  req: Request;
}

export default async function authApiMiddleware(
  event: AuthApiEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  if (!event.url.pathname.startsWith("/api/auth/")) return next();
  return auth.handler(event.req);
}
