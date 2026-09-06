/**
 * Client-side orchestration for opt-in cloud save (client-safe — the actual
 * DB access is server-only, see `./cloud-sync.server.ts`).
 *
 * Design, deliberately simple for a v1: localStorage stays the source of
 * truth for anonymous play. Signing in layers cloud sync on top:
 *   - On sign-in (or app boot while already signed in), pull the cloud
 *     profile and keep whichever of {local, cloud} has more progress
 *     (`highestWaveReached`, then `totalRunsCompleted` as a tiebreak) —
 *     this is "highest progress wins", not a field-level merge. A player
 *     who made real progress on two different signed-in devices between
 *     syncs will lose the lesser run's *additional* items — an accepted v1
 *     limitation, not silent data loss (the losing side was strictly behind).
 *   - Every meaningful local save (`meta.ts` `saveProfile`, called from
 *     `engine.ts` `flushProfile`) also schedules a debounced cloud push, so
 *     both sides converge without a sync button.
 * Never throws into game code — cloud sync is a nice-to-have layered on a
 * game that fully works without it (and without a signed-in session).
 */
import { authClient } from "../auth/client";
import { pullCloudProfile, pushCloudProfile } from "./cloud-sync-api";
import type { PlayerProfile } from "./types";

const PUSH_DEBOUNCE_MS = 15_000;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingProfile: PlayerProfile | null = null;

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await authClient.getSession();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

function betterProgress(a: PlayerProfile, b: PlayerProfile): PlayerProfile {
  if (a.highestWaveReached !== b.highestWaveReached) {
    return a.highestWaveReached > b.highestWaveReached ? a : b;
  }
  return a.totalRunsCompleted >= b.totalRunsCompleted ? a : b;
}

/**
 * Call once at boot (after loading the local profile) and again right after
 * a successful sign-in. Returns the profile to actually use — either the
 * local one unchanged (not signed in, or local already wins/pushed) or the
 * cloud one (a fresh device pulling down existing progress).
 */
export async function syncOnSignIn(local: PlayerProfile): Promise<PlayerProfile> {
  const userId = await currentUserId();
  if (!userId) return local;
  try {
    const cloud = await pullCloudProfile();
    if (!cloud) {
      // First sync from this account — seed the cloud with local progress.
      void pushCloudProfile({ data: local }).catch(() => {});
      return local;
    }
    const winner = betterProgress(local, cloud.data);
    // Push only when local wins — cloud is behind and needs updating.
    // When cloud wins we return its data (caller saves it locally), so no push needed.
    if (winner !== cloud.data) {
      void pushCloudProfile({ data: winner }).catch(() => {});
    }
    return winner;
  } catch {
    return local; // offline / server hiccup — keep playing locally
  }
}

/** Debounced background push — safe to call after every local save. */
export function schedulePush(profile: PlayerProfile): void {
  pendingProfile = profile;
  if (pushTimer) return;
  pushTimer = setTimeout(() => {
    pushTimer = null;
    const toPush = pendingProfile;
    pendingProfile = null;
    if (!toPush) return;
    void flushPushNow(toPush);
  }, PUSH_DEBOUNCE_MS);
}

/** Immediate push — call on pagehide/visibilitychange so a debounced push
 *  isn't lost when the tab closes before its timer fires. */
export async function flushPushNow(profile: PlayerProfile): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  try {
    await pushCloudProfile({ data: profile });
  } catch {
    /* best-effort — the next successful sync will catch up */
  }
}
