/**
 * Applies pending migrations from ./drizzle to DATABASE_URL.
 *   npx tsx scripts/migrate.ts
 */
import { connect, loadEnv, redactUrl } from "./_db";

async function main() {
  loadEnv();
  const { close, kind } = await connect(); // connect() runs migrations
  await close();
  console.log(`Migrations applied (${kind}: ${redactUrl(process.env.DATABASE_URL ?? "")}).`);
}

main().catch((err) => {
  console.error(`Migration failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
