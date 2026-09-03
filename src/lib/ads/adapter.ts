/**
 * Ad-platform adapter.
 *
 * The game talks to this thin interface, never to a specific SDK. Today
 * there is one real implementation (Poki, the first portal we're
 * targeting); a CrazyGames or self-hosted (Google Ad Manager) adapter can
 * be dropped in later without touching call sites in the game code.
 *
 * `NullAdapter` is the default and is what runs during local dev and on
 * any distribution channel without an ad SDK — every call is a safe no-op,
 * so the game is fully playable and unchanged without a portal present.
 */

export type AdResult = "granted" | "skipped" | "unavailable";

export interface AdAdapter {
  init(): Promise<void>;
  /** Call the moment the player provides their first input, not on load. */
  gameplayStart(): void;
  /** Call on any interruption: pause, menu open, level end, cutscene. */
  gameplayStop(): void;
  /** A natural-pause ad break (between waves, on game over). */
  commercialBreak(): Promise<void>;
  /** A player-initiated rewarded ad for a specific placement. */
  showRewardedAd(placementId: string): Promise<AdResult>;
}

class NullAdapter implements AdAdapter {
  async init() {}
  gameplayStart() {}
  gameplayStop() {}
  async commercialBreak() {}
  async showRewardedAd(): Promise<AdResult> {
    return "unavailable";
  }
}

// Poki SDK's real shape has more surface than this; we only declare what we
// actually call, and every call below is defensively try/caught so a future
// SDK change degrades to "skipped" instead of throwing.
type PokiSDKGlobal = {
  init: () => Promise<void>;
  gameLoadingFinished?: () => void;
  gameplayStart: () => void;
  gameplayStop: () => void;
  commercialBreak: (cb?: () => void) => Promise<void>;
  rewardedBreak: (opts?: { onStart?: () => void }) => Promise<boolean>;
};

declare global {
  interface Window {
    PokiSDK?: PokiSDKGlobal;
  }
}

const POKI_SDK_URL = "https://game-cdn.poki.com/scripts/v2/poki-sdk.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    // Offline, blocked, or not embedded on a portal — fall back silently.
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class PokiAdapter implements AdAdapter {
  private ready = false;

  async init() {
    if (typeof document === "undefined") return;
    await Promise.race([loadScript(POKI_SDK_URL), timeout(4000)]);
    const sdk = window.PokiSDK;
    if (!sdk) return;
    try {
      await sdk.init();
      this.ready = true;
      sdk.gameLoadingFinished?.();
    } catch {
      this.ready = false;
    }
  }

  gameplayStart() {
    if (!this.ready) return;
    try {
      window.PokiSDK?.gameplayStart();
    } catch {
      /* never let ad plumbing break gameplay */
    }
  }

  gameplayStop() {
    if (!this.ready) return;
    try {
      window.PokiSDK?.gameplayStop();
    } catch {
      /* ignore */
    }
  }

  async commercialBreak() {
    if (!this.ready || !window.PokiSDK) return;
    this.gameplayStop();
    try {
      await window.PokiSDK.commercialBreak();
    } catch {
      /* ignore */
    } finally {
      this.gameplayStart();
    }
  }

  async showRewardedAd(_placementId: string): Promise<AdResult> {
    if (!this.ready || !window.PokiSDK) return "unavailable";
    this.gameplayStop();
    try {
      const granted = await window.PokiSDK.rewardedBreak();
      return granted ? "granted" : "skipped";
    } catch {
      return "unavailable";
    } finally {
      this.gameplayStart();
    }
  }
}

let adapter: AdAdapter | null = null;

/** Call once at boot. Resolves once we know which adapter is live. */
export async function initAds(): Promise<AdAdapter> {
  if (adapter) return adapter;
  const poki = new PokiAdapter();
  await poki.init().catch(() => {});
  adapter = window.PokiSDK ? poki : new NullAdapter();
  return adapter;
}

/** Safe to call any time; returns a no-op adapter before initAds() resolves. */
export function getAdAdapter(): AdAdapter {
  return adapter ?? new NullAdapter();
}
