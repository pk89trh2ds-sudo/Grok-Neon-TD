/**
 * Ad-platform adapter.
 *
 * The game talks to this thin interface, never to a specific SDK. Two real
 * implementations exist (Poki and CrazyGames); a self-hosted (Google Ad
 * Manager) adapter can be dropped in later without touching call sites in
 * the game code.
 *
 * `NullAdapter` is the default and is what runs during local dev and on
 * any distribution channel without an ad SDK — every call is a safe no-op,
 * so the game is fully playable and unchanged without a portal present.
 * It's also what runs on the owned domain deliberately: ads-only portals
 * don't want IAP mixed in, and the owned domain is where Phase 3's Stripe
 * checkout lives instead.
 *
 * Both Poki's and CrazyGames' SDKs are designed to also load harmlessly
 * outside their own portal (for local testing), so "did the script load"
 * is not a reliable signal for which portal is actually live. Instead,
 * `detectPortal()` looks at where the page was framed from *before* either
 * script is requested, and only the matching one is ever loaded.
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

// Same story for CrazyGames: only what we call, all defensively try/caught.
type CrazyGamesAdCallbacks = {
  adFinished: () => void;
  adError: (error?: unknown) => void;
  adStarted?: () => void;
};

type CrazyGamesSDKGlobal = {
  init: () => Promise<void>;
  game: {
    gameplayStart: () => void;
    gameplayStop: () => void;
  };
  ad: {
    requestAd: (type: "midgame" | "rewarded", callbacks: CrazyGamesAdCallbacks) => void;
  };
};

declare global {
  interface Window {
    PokiSDK?: PokiSDKGlobal;
    CrazyGames?: { SDK?: CrazyGamesSDKGlobal };
  }
}

const POKI_SDK_URL = "https://game-cdn.poki.com/scripts/v2/poki-sdk.js";
const CRAZYGAMES_SDK_URL = "https://sdk.crazygames.com/crazygames-sdk-v3.js";

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

export type Portal = "poki" | "crazygames" | null;

/**
 * Where was this page framed from? Checked before any ad SDK is loaded.
 *
 * Also imported by `src/lib/auth/client.ts` and `src/lib/game/engine.ts` to
 * gate backend features (cloud save, leaderboard, auth UI) that portals either
 * don't support or actively reject. CrazyGames, for example, requires automatic
 * SDK login and rejects external login forms — so when `detectPortal()` returns
 * `"crazygames"` the game runs auth-free with local save only (no sign-in UI,
 * no cloud push, no leaderboard submissions). A TODO for future integration:
 * add CrazyGames SDK user auth (`window.CrazyGames.SDK.user.getUserToken()`)
 * at the guard points below once the game is approved on the platform.
 */
export function detectPortal(): Portal {
  if (typeof document === "undefined") return null;
  try {
    const referrer = document.referrer || "";
    if (referrer.includes("poki.com")) return "poki";
    if (referrer.includes("crazygames.com")) return "crazygames";
    // Chromium exposes the full embedding chain; Poki/CrazyGames both embed
    // via a chain of iframes, so the top frame's referrer alone can miss it.
    const ancestors = window.location.ancestorOrigins;
    if (ancestors) {
      for (let i = 0; i < ancestors.length; i++) {
        const origin = ancestors.item(i) ?? "";
        if (origin.includes("poki.com")) return "poki";
        if (origin.includes("crazygames.com")) return "crazygames";
      }
    }
  } catch {
    /* fall through to "not on a known portal" */
  }
  return null;
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

class CrazyGamesAdapter implements AdAdapter {
  private ready = false;

  async init() {
    if (typeof document === "undefined") return;
    await Promise.race([loadScript(CRAZYGAMES_SDK_URL), timeout(4000)]);
    const sdk = window.CrazyGames?.SDK;
    if (!sdk) return;
    try {
      await sdk.init();
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  gameplayStart() {
    if (!this.ready) return;
    try {
      window.CrazyGames?.SDK?.game.gameplayStart();
    } catch {
      /* never let ad plumbing break gameplay */
    }
  }

  gameplayStop() {
    if (!this.ready) return;
    try {
      window.CrazyGames?.SDK?.game.gameplayStop();
    } catch {
      /* ignore */
    }
  }

  async commercialBreak() {
    if (!this.ready || !window.CrazyGames?.SDK) return;
    this.gameplayStop();
    try {
      await this.requestAd("midgame");
    } catch {
      /* ignore */
    } finally {
      this.gameplayStart();
    }
  }

  async showRewardedAd(_placementId: string): Promise<AdResult> {
    if (!this.ready || !window.CrazyGames?.SDK) return "unavailable";
    this.gameplayStop();
    try {
      await this.requestAd("rewarded");
      // CrazyGames' rewarded ads don't expose a distinct "user declined"
      // signal — adFinished means it played, adError covers everything
      // else (blocked, unavailable, closed early).
      return "granted";
    } catch {
      return "unavailable";
    } finally {
      this.gameplayStart();
    }
  }

  private requestAd(type: "midgame" | "rewarded"): Promise<void> {
    return new Promise((resolve, reject) => {
      const sdk = window.CrazyGames?.SDK;
      if (!sdk) {
        reject(new Error("CrazyGames SDK unavailable"));
        return;
      }
      sdk.ad.requestAd(type, {
        adFinished: () => resolve(),
        adError: (error) => reject(error ?? new Error("CrazyGames ad error")),
      });
    });
  }
}

let adapter: AdAdapter | null = null;

/** Call once at boot. Resolves once we know which adapter is live. */
export async function initAds(): Promise<AdAdapter> {
  if (adapter) return adapter;
  const portal = detectPortal();
  if (portal === "poki") {
    const poki = new PokiAdapter();
    await poki.init().catch(() => {});
    adapter = window.PokiSDK ? poki : new NullAdapter();
  } else if (portal === "crazygames") {
    const crazyGames = new CrazyGamesAdapter();
    await crazyGames.init().catch(() => {});
    adapter = window.CrazyGames?.SDK ? crazyGames : new NullAdapter();
  } else {
    // Not framed by a known ad portal — own domain, itch.io, or local dev.
    // No ad SDK to load here.
    adapter = new NullAdapter();
  }
  return adapter;
}

/** Safe to call any time; returns a no-op adapter before initAds() resolves. */
export function getAdAdapter(): AdAdapter {
  return adapter ?? new NullAdapter();
}
