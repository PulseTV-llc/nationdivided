"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/lib/db";
import { audit, createSession } from "@/lib/server/auth";
import { log } from "@/lib/server/log";
import { clientKey, hashPassword, hmac, rateLimit, verifyPassword } from "@/lib/server/security";

export type LoginState = { error: string | null; email: string };

const GENERIC = "Email or password is incorrect.";
const WINDOW = 15 * 60;
const LIMIT = 10;

// Verified against when the email is unknown so response time doesn't reveal
// which accounts exist. Generated once per server instance.
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= hashPassword(`dummy-${Math.random()}-${Date.now()}`));

/** Only same-site admin paths are allowed as post-login destinations. */
function safeNext(raw: unknown): string {
  if (typeof raw !== "string" || raw.length > 512) return "/admin/casting";
  try {
    const base = "http://admin.invalid";
    const url = new URL(raw, base);
    if (url.origin !== base || !raw.startsWith("/admin/") || raw.startsWith("//") || raw.includes("\\")) {
      return "/admin/casting";
    }
    if (url.pathname === "/admin/login" || url.pathname.startsWith("/admin/login/")) return "/admin/casting";
    return `${url.pathname}${url.search}`;
  } catch {
    return "/admin/casting";
  }
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 254);
  const password = String(formData.get("password") ?? "").slice(0, 1024);
  const next = safeNext(formData.get("next"));

  if (!email || !password) return { error: "Enter your email and password.", email };

  let userId: string | null = null;
  try {
    const ip = clientKey(await headers());
    const [byIp, byEmail] = await Promise.all([
      rateLimit("admin-login-ip", ip, LIMIT, WINDOW),
      rateLimit("admin-login-email", hmac(`email:${email}`).slice(0, 32), LIMIT, WINDOW),
    ]);
    if (!byIp.ok || !byEmail.ok) {
      log.warn("admin.login_rate_limited", { by: !byIp.ok ? "ip" : "email" });
      const minutes = Math.max(1, Math.ceil(Math.max(byIp.retryAfter, byEmail.retryAfter) / 60));
      return { error: `Too many sign-in attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`, email };
    }

    const db = await getDb();
    const [user] = await db
      .select({
        id: schema.adminUsers.id,
        email: schema.adminUsers.email,
        name: schema.adminUsers.name,
        role: schema.adminUsers.role,
        disabled: schema.adminUsers.disabled,
        passwordHash: schema.adminUsers.passwordHash,
      })
      .from(schema.adminUsers)
      .where(eq(schema.adminUsers.email, email))
      .limit(1);

    const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
    if (!user || !valid || user.disabled) {
      log.warn("admin.login_failed", { reason: !user ? "unknown" : user.disabled ? "disabled" : "password" });
      return { error: GENERIC, email };
    }

    await createSession(user.id);
    await audit({ id: user.id, email: user.email, name: user.name, role: user.role }, "admin.login");
    log.info("admin.login", { userId: user.id });
    userId = user.id;
  } catch (e) {
    log.error("admin.login_error", { error: String(e) });
    return { error: "Sign-in is temporarily unavailable. Please try again shortly.", email };
  }

  if (userId) redirect(next);
  return { error: GENERIC, email };
}
