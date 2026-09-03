/**
 * Local email/password sign-in (this app's Better Auth DB — not the broker).
 *
 * Enabled: this app is deployed independently (portals + its own domain),
 * so the broker-federated Google/X sign-in in `providers.ts` has no broker
 * to federate through and can't work here — email/password is the only
 * sign-in method actually wired up (`src/routes/login.tsx`).
 *
 * Do NOT edit `server.ts` for this — that file is frozen pre-wired config.
 */
export const emailAndPasswordEnabled = true;
