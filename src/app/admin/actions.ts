"use server";

import { redirect } from "next/navigation";
import { audit, destroySession, getAdmin } from "@/lib/server/auth";
import { log } from "@/lib/server/log";

export async function logoutAction() {
  try {
    const user = await getAdmin();
    if (user) await audit(user, "admin.logout");
    await destroySession();
  } catch (e) {
    log.error("admin.logout_failed", { error: String(e) });
  }
  redirect("/admin/login");
}
