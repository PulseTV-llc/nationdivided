import "server-only";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { drizzle as drizzlePg, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env, isProd } from "@/lib/server/env";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

type GlobalDb = { __ndDb?: Promise<Db> };
const g = globalThis as unknown as GlobalDb;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not configured.");
    this.name = "DatabaseNotConfiguredError";
  }
}

async function connect(): Promise<Db> {
  const url = env().DATABASE_URL;
  if (!url) throw new DatabaseNotConfiguredError();

  if (url.startsWith("pglite:")) {
    // Embedded Postgres for local development and testing only. It writes to
    // a folder on disk, which does not persist on serverless platforms.
    if (isProd() && process.env.ALLOW_PGLITE_IN_PRODUCTION !== "true") {
      throw new Error("pglite:// databases are for local development. Use a hosted PostgreSQL URL in production.");
    }
    const dir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), url.replace(/^pglite:\/\//, "") || ".data/pglite");
    mkdirSync(path.dirname(dir), { recursive: true });
    // PGlite leaves a lock file behind if the dev server is killed. It is single-process,
    // so only run one of: the dev server, or a script (npm run admin:create / db:migrate).
    rmSync(path.join(dir, "postmaster.pid"), { force: true });
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const client = new PGlite(dir);
    const db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder: path.resolve(/*turbopackIgnore: true*/ process.cwd(), "drizzle") });
    return db as unknown as Db;
  }

  const client = postgres(url, {
    max: 5,
    prepare: false, // compatible with transaction-mode poolers (Supabase, Neon, PgBouncer)
    idle_timeout: 20,
    ssl: url.includes("localhost") || url.includes("127.0.0.1") ? false : "require",
  });
  return drizzlePg(client, { schema });
}

/** Lazily connects on first use so builds and static pages never need a database. */
export function getDb(): Promise<Db> {
  if (!g.__ndDb) {
    g.__ndDb = connect().catch((err) => {
      g.__ndDb = undefined;
      throw err;
    });
  }
  return g.__ndDb;
}

export { schema };
