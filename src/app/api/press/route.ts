import { pressInquirySchema } from "@/lib/validation/casting";
import { site } from "@/content/site";
import { getDb, schema, DatabaseNotConfiguredError } from "@/lib/db";
import { botSignals, clientKey, rateLimit, sameOrigin, verifyTurnstile } from "@/lib/server/security";
import { pressNotice, sendEmail } from "@/lib/server/email";
import { env } from "@/lib/server/env";
import { BodyTooLargeError, fail, json, readJson } from "@/lib/server/http";
import { log } from "@/lib/server/log";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Request blocked.");
  let body: unknown;
  try {
    body = await readJson(req, 16_000);
  } catch (e) {
    return fail(e instanceof BodyTooLargeError ? 413 : 400, "Invalid request.");
  }
  const parsed = pressInquirySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0] ?? "form")] ??= i.message;
    return fail(400, "Some fields need attention.", { fieldErrors });
  }
  const p = parsed.data;
  if (botSignals(p, 5)) return fail(400, "We couldn't verify your message. Please try again.");
  if (!(await verifyTurnstile(p.turnstileToken))) return fail(400, "Please complete the verification check.");

  try {
    const limit = await rateLimit("press", clientKey(req.headers), 5, 3600);
    if (!limit.ok) return fail(429, "Too many messages. Please try again later.");

    const db = await getDb();
    await db.insert(schema.pressInquiries).values({
      name: p.name,
      outlet: p.outlet,
      email: p.email,
      kind: p.kind,
      deadline: p.deadline || null,
      message: p.message,
    });
    const to = env().PRESS_NOTIFY_EMAIL;
    const notified = to ? await sendEmail({ to, ...pressNotice(p) }) : false;
    log.info("press.inquiry_received", { notified });
    return json({ ok: true });
  } catch (e) {
    if (e instanceof DatabaseNotConfiguredError) {
      return fail(503, `The form isn't available right now. Please email ${site.contact.press}.`);
    }
    log.error("press.inquiry_failed", { error: String(e) });
    return fail(500, "Something went wrong. Nothing was sent — please try again.");
  }
}
