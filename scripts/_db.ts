/**
 * Shared database bootstrap for CLI scripts (run with `npx tsx`).
 * Mirrors src/lib/db/index.ts, which can't be imported here because it is
 * `server-only`. Supports pglite:// (local development) and postgres:// URLs.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../src/lib/db/schema";

export type ScriptDb = PostgresJsDatabase<typeof schema>;

export function loadEnv() {
  const load = (process as unknown as { loadEnvFile?: (p: string) => void }).loadEnvFile;
  // Earlier files win: loadEnvFile never overrides variables that are already set.
  for (const file of [".env.local", ".env"]) {
    const p = path.resolve(process.cwd(), file);
    if (load && existsSync(p)) load(p);
  }
}

export async function connect(): Promise<{ db: ScriptDb; close: () => Promise<void>; kind: "pglite" | "postgres" }> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (checked the environment, .env.local and .env).");
  const migrationsFolder = path.resolve(process.cwd(), "drizzle");

  if (url.startsWith("pglite:")) {
    const dir = path.resolve(process.cwd(), url.replace(/^pglite:\/\//, "") || ".data/pglite");
    // Stop the dev server first: PGlite is single-process. Clears a stale lock left by a killed server.
    const fs = await import("node:fs");
    fs.mkdirSync(path.dirname(dir), { recursive: true });
    fs.rmSync(path.join(dir, "postmaster.pid"), { force: true });
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const client = new PGlite(dir);
    const db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder });
    return { db: db as unknown as ScriptDb, close: () => client.close(), kind: "pglite" };
  }

  const { default: postgres } = await import("postgres");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const client = postgres(url, {
    max: 1,
    prepare: false,
    onnotice: () => {},
    ssl: url.includes("localhost") || url.includes("127.0.0.1") ? false : "require",
  });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder });
  return { db, close: () => client.end({ timeout: 5 }), kind: "postgres" };
}

export const redactUrl = (url: string) => url.replace(/\/\/([^@/]*)@/, "//***@");
