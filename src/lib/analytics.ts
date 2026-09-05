/**
 * Minimal, provider-agnostic analytics wrapper.
 *
 * No-ops completely unless VITE_POSTHOG_KEY is set at build time, so the
 * game behaves identically with or without a provider configured. Events
 * are posted straight to PostHog's HTTP capture endpoint — no SDK/script
 * needed — so swapping providers later only means changing `send()`.
 *
 * No PII is collected: the only identifier is a random anonymous id kept
 * in localStorage alongside the player's save.
 */

export type EventProps = Record<string, string | number | boolean | null | undefined>;

const CLIENT_ID_KEY = "neontd.analytics.clientId";
const POSTHOG_KEY = (import.meta.env.VITE_POSTHOG_KEY as string | undefined) || "";
const POSTHOG_HOST =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "https://us.i.posthog.com";

let clientId = "";

function getClientId(): string {
  if (clientId) return clientId;
  clientId = "anon";
  if (typeof localStorage === "undefined") return clientId;
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    clientId = id;
  } catch {
    /* private mode / quota — fall back to a per-session anonymous id */
  }
  return clientId;
}

function send(event: string, props: EventProps) {
  if (!POSTHOG_KEY) return;
  const body = JSON.stringify({
    api_key: POSTHOG_KEY,
    event,
    distinct_id: getClientId(),
    properties: { ...props, $lib: "neon-td-web" },
  });
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        `${POSTHOG_HOST}/capture/`,
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
    if (typeof fetch === "undefined") return;
    void fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics must never break gameplay */
  }
}

export function track(event: string, props: EventProps = {}) {
  if (import.meta.env.DEV && !POSTHOG_KEY) {
    // Surface the funnel in the console during local dev, before a
    // provider key exists, so instrumentation can be sanity-checked.
    console.debug(`[analytics] ${event}`, props);
  }
  send(event, props);
}
