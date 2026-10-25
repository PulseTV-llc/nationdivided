import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { isProd } from "./env";
import { log } from "./log";
import { randomToken, sha256 } from "./security";

/**
 * Admin authentication — database-backed sessions.
 *
 * The browser holds a random 256-bit token in an HttpOnly, SameSite=Strict
 * cookie. The database stores only its SHA-256, so a database leak does not
 * leak usable sessions. Every admin page, Server Action, and API route must
 * call `requireAdmin()` itself; proxy.ts only does an optimistic redirect.
 */

export const SESSION_COOKIE = isProd() ? "__Host-nd_admin" : "nd_admin";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export type AdminUser = { id: string; email: string; name: string; role: "admin" | "reviewer" };

export async function createSession(userId: string) {
  const token = randomToken(32);
  const db = await getDb();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(schema.adminSessions).values({ id: sha256(token), userId, expiresAt });
  await db.update(schema.adminUsers).set({ lastLoginAt: new Date() }).where(eq(schema.adminUsers.id, userId));
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(schema.adminSessions).where(eq(schema.adminSessions.id, sha256(token)));
  }
  jar.delete(SESSION_COOKIE);
}

/** Current admin or null. Deduplicated per request. */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 128) return null;
  await connection(); // session validity depends on the current time
  try {
    const db = await getDb();
    const rows = await db
      .select({
        id: schema.adminUsers.id,
        email: schema.adminUsers.email,
        name: schema.adminUsers.name,
        role: schema.adminUsers.role,
        disabled: schema.adminUsers.disabled,
      })
      .from(schema.adminSessions)
      .innerJoin(schema.adminUsers, eq(schema.adminSessions.userId, schema.adminUsers.id))
      .where(and(eq(schema.adminSessions.id, sha256(token)), gt(schema.adminSessions.expiresAt, new Date())))
      .limit(1);
    const u = rows[0];
    if (!u || u.disabled) return null;
    return { id: u.id, email: u.email, name: u.name, role: u.role };
  } catch (e) {
    log.error("auth.session_lookup_failed", { error: String(e) });
    return null;
  }
});

/** Use at the top of every admin page / action / route. */
export async function requireAdmin(role?: "admin"): Promise<AdminUser> {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  if (role === "admin" && user.role !== "admin") redirect("/admin/casting?error=forbidden");
  return user;
}

/** For API routes: returns null instead of redirecting. */
export async function adminFromRequest(role?: "admin"): Promise<AdminUser | null> {
  const user = await getAdmin();
  if (!user) return null;
  if (role === "admin" && user.role !== "admin") return null;
  return user;
}

export async function audit(actor: AdminUser, action: string, targetId?: string | null, detail?: Record<string, unknown>) {
  try {
    const db = await getDb();
    await db.insert(schema.auditLog).values({
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      targetId: targetId ?? null,
      detail: detail ?? null,
    });
  } catch (e) {
    log.error("audit.write_failed", { action, error: String(e) });
  }
}
