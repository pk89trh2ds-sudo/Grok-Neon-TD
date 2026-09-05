/**
 * Server functions for opt-in cloud save (`createServerFn` — safe to import
 * from client code, per `authMiddleware`'s own example: the framework splits
 * the handler body into a server-only chunk automatically, unlike a raw
 * `*.server.ts` module, which its own import-protection blocks entirely from
 * a client-reachable file). The client-side orchestration (when to pull/push,
 * the merge rule) lives in `./cloud-sync.ts`.
 */
import { createServerFn } from "@tanstack/react-start";
import { getSql } from "../db";
import { authMiddleware } from "../auth/middleware";
import type { PlayerProfile } from "./types";

/** Loose runtime shape check — the checksum in meta.ts is the real tamper
 *  guard; this just rejects garbage before it reaches the database. */
function looksLikeProfile(value: unknown): value is PlayerProfile {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>).version === "number" &&
    typeof (value as Record<string, unknown>).displayName === "string"
  );
}

export const pullCloudProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ data: PlayerProfile; updatedAt: string } | null> => {
    const sql = await getSql();
    const rows = await sql<{ data: PlayerProfile; updated_at: string }>`
      select data, updated_at from profiles where user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) return null;
    return { data: row.data, updatedAt: row.updated_at };
  });

export const pushCloudProfile = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!looksLikeProfile(input)) throw new Error("Malformed profile payload");
    return input;
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<{ updatedAt: string }> => {
    const sql = await getSql();
    const rows = await sql<{ updated_at: string }>`
      insert into profiles (user_id, data, updated_at)
      values (${context.userId}, ${JSON.stringify(data)}::jsonb, now())
      on conflict (user_id) do update set data = excluded.data, updated_at = excluded.updated_at
      returning updated_at
    `;
    return { updatedAt: rows[0]!.updated_at };
  });
