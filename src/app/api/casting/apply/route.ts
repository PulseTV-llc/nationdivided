import { castingApplicationSchema } from "@/lib/validation/casting";
import { VIDEO_LIMITS } from "@/content/casting";
import { site } from "@/content/site";
import { getDb, schema, DatabaseNotConfiguredError } from "@/lib/db";
import {
  applicationReference,
  botSignals,
  clientKey,
  hmac,
  rateLimit,
  sameOrigin,
  verifyTurnstile,
} from "@/lib/server/security";
import { headObject, moveObject, storageDriver } from "@/lib/server/storage";
import { castingConfirmationEmail, castingStaffNotice, sendEmail } from "@/lib/server/email";
import { env } from "@/lib/server/env";
import { BodyTooLargeError, fail, json, readJson } from "@/lib/server/http";
import { log } from "@/lib/server/log";
import { eq } from "drizzle-orm";

/** Bump when the consent wording on the review step changes. */
const CONSENT_VERSION = "2026-10-casting-v1";

const empty = (v: string | undefined | null) => (v && v.trim() ? v.trim() : null);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Request blocked.");

  let body: unknown;
  try {
    body = await readJson(req, 64_000);
  } catch (e) {
    return fail(e instanceof BodyTooLargeError ? 413 : 400, "We couldn't read your application. Please try again.");
  }

  // 1. Validate everything server-side (the browser's checks are a convenience only).
  const parsed = castingApplicationSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return fail(400, "Some answers need attention.", { fieldErrors });
  }
  const a = parsed.data;

  // 2. Bot protection: honeypot, fill time, Turnstile (when configured).
  const ip = clientKey(req.headers);
  const bot = botSignals({ website: a.website, startedAt: a.startedAt }, 20);
  if (bot) {
    log.warn("casting.bot_rejected", { reason: bot });
    return fail(400, "We couldn't verify your submission. Please wait a moment and try again.");
  }
  if (!(await verifyTurnstile(a.turnstileToken))) {
    return fail(400, "Please complete the verification check and try again.", { fieldErrors: { turnstileToken: "Verification failed." } });
  }

  try {
    // 3. Rate limit: 5 applications per network per hour, 3 per email per day.
    const [byIp, byEmail] = await Promise.all([
      rateLimit("apply-ip", ip, 5, 3600),
      rateLimit("apply-email", hmac(`email:${a.email}`).slice(0, 32), 3, 86400),
    ]);
    if (!byIp.ok || !byEmail.ok) {
      return fail(429, "We've received several applications from you recently. Please try again later.", undefined, {
        "Retry-After": String(Math.max(byIp.retryAfter, byEmail.retryAfter)),
      });
    }

    const reference = applicationReference();

    // 4. Optional video: confirm the upload exists and matches what was declared,
    //    then move it out of the pending area.
    let videoKey: string | null = null;
    if (a.video) {
      if (storageDriver() === "none") return fail(400, "Video uploads aren't available. Please remove the video and submit.");
      const head = await headObject(a.video.key);
      if (!head || head.size !== a.video.size || head.size > VIDEO_LIMITS.maxBytes) {
        return fail(400, "We couldn't find your uploaded video. Please upload it again or continue without one.", {
          fieldErrors: { video: "Upload not found." },
        });
      }
      const ext = a.video.key.split(".").pop();
      videoKey = `casting/applications/${reference}.${ext}`;
      await moveObject(a.video.key, videoKey);
    }

    // 5. Store.
    const db = await getDb();
    const [row] = await db
      .insert(schema.castingApplications)
      .values({
        reference,
        fullName: a.fullName,
        preferredName: empty(a.preferredName),
        email: a.email,
        phone: a.phone,
        isAdult: a.isAdult,
        city: a.city,
        state: a.state,
        votedTrump2024: a.votedTrump2024,
        feeling: a.feeling,
        feelingDetail: empty(a.feelingDetail),
        issues: a.issues,
        issuesOther: empty(a.issuesOther),
        hopedChange: a.hopedChange,
        viewsEvolved: empty(a.viewsEvolved),
        aboutYou: a.aboutYou,
        normalDay: a.normalDay,
        whyDocument: a.whyDocument,
        lifeChanges: empty(a.lifeChanges),
        comfortableOnCamera: a.comfortableOnCamera,
        openToIntroductions: a.openToIntroductions,
        videoKey,
        videoContentType: a.video?.contentType ?? null,
        videoSize: a.video?.size ?? null,
        videoFileName: a.video ? empty(a.video.fileName)?.slice(0, 200) ?? null : null,
        consentedAt: new Date(),
        consentVersion: CONSENT_VERSION,
      })
      .returning({ id: schema.castingApplications.id });

    // 6. Confirmation email (reported truthfully to the applicant).
    const emailSent = await sendEmail({
      to: a.email,
      ...castingConfirmationEmail(a.preferredName || a.fullName.split(" ")[0], reference),
    });
    if (emailSent) {
      await db
        .update(schema.castingApplications)
        .set({ confirmationEmailSent: true })
        .where(eq(schema.castingApplications.id, row.id));
    }
    const notify = env().CASTING_NOTIFY_EMAIL;
    if (notify) {
      void sendEmail({ to: notify, ...castingStaffNotice(reference, `${site.url}/admin/casting/${row.id}`) });
    }

    log.info("casting.application_received", { hasVideo: Boolean(videoKey), emailSent });
    return json({ ok: true, reference, emailSent });
  } catch (e) {
    if (e instanceof DatabaseNotConfiguredError) {
      log.error("casting.db_not_configured");
      return fail(503, `Applications can't be received right now. Please email ${site.contact.casting} instead.`);
    }
    log.error("casting.apply_failed", { error: String(e) });
    return fail(500, "Something went wrong saving your application. Nothing was submitted — please try again.");
  }
}
