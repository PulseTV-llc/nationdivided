/**
 * Creates or updates a staff account for the casting admin.
 *
 *   npx tsx scripts/create-admin.ts --email you@example.com --name "Your Name" [--role admin|reviewer]
 *
 * Password: taken from ADMIN_PASSWORD (min 12 characters) if set, otherwise a
 * strong random password is generated and printed once. Existing accounts
 * (matched by email) get the new password/name/role, are re-enabled, and all
 * of their sessions are signed out.
 */
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { parseArgs } from "node:util";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import { connect, loadEnv } from "./_db";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number, opts: object) => Promise<Buffer>;

// Must match hashPassword() in src/lib/server/security.ts.
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize("NFKC"), salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${salt.toString("base64")}$${key.toString("base64")}`;
}

function usage(message?: string): never {
  if (message) console.error(`Error: ${message}\n`);
  console.error('Usage: npx tsx scripts/create-admin.ts --email you@example.com --name "Name" [--role admin|reviewer]');
  process.exit(1);
}

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      role: { type: "string", default: "reviewer" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
  });
  if (values.help) usage();

  const email = (values.email ?? "").trim().toLowerCase();
  const name = (values.name ?? "").trim();
  const role = values.role;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) usage("--email must be a valid email address.");
  if (!name || name.length > 120) usage("--name is required (max 120 characters).");
  if (role !== "admin" && role !== "reviewer") usage('--role must be "admin" or "reviewer".');

  loadEnv();

  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv !== undefined && fromEnv.length < 12) usage("ADMIN_PASSWORD must be at least 12 characters.");
  const password = fromEnv ?? randomBytes(18).toString("base64url"); // 24 chars, ~144 bits
  const passwordHash = await hashPassword(password);

  const { db, close } = await connect();
  try {
    const [existing] = await db
      .select({ id: schema.adminUsers.id })
      .from(schema.adminUsers)
      .where(eq(schema.adminUsers.email, email))
      .limit(1);

    if (existing) {
      await db
        .update(schema.adminUsers)
        .set({ name, role, passwordHash, disabled: false })
        .where(eq(schema.adminUsers.id, existing.id));
      await db.delete(schema.adminSessions).where(eq(schema.adminSessions.userId, existing.id));
      console.log(`Updated ${role} account for ${email} (existing sessions signed out).`);
    } else {
      await db.insert(schema.adminUsers).values({ email, name, role, passwordHash });
      console.log(`Created ${role} account for ${email}.`);
    }
  } finally {
    await close();
  }

  if (fromEnv === undefined) {
    console.log("\nGenerated password (shown once — store it in a password manager):\n");
    console.log(`  ${password}\n`);
  } else {
    console.log("Password set from ADMIN_PASSWORD.");
  }
}

main().catch((err) => {
  console.error(`Failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
