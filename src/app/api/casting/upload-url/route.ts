import { randomUUID } from "node:crypto";
import { VIDEO_LIMITS } from "@/content/casting";
import { uploadRequestSchema } from "@/lib/validation/casting";
import { clientKey, rateLimit, sameOrigin } from "@/lib/server/security";
import { createUploadTicket, storageDriver } from "@/lib/server/storage";
import { BodyTooLargeError, fail, json, readJson } from "@/lib/server/http";
import { log } from "@/lib/server/log";

/**
 * Issues a short-lived signed URL so the applicant's browser can upload an
 * introduction video directly to private storage. The video never passes
 * through this server (except in local development).
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Request blocked.");
  if (storageDriver() === "none") {
    return fail(503, "Video uploads aren't available right now. You can still apply without a video.");
  }

  let body: unknown;
  try {
    body = await readJson(req, 2_000);
  } catch (e) {
    return fail(e instanceof BodyTooLargeError ? 413 : 400, "Invalid request.");
  }
  const parsed = uploadRequestSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "Invalid file.");

  try {
    const limit = await rateLimit("upload", clientKey(req.headers), 10, 3600);
    if (!limit.ok) {
      return fail(429, "Too many upload attempts. Please try again later.", undefined, {
        "Retry-After": String(limit.retryAfter),
      });
    }
    const ext = VIDEO_LIMITS.types[parsed.data.contentType];
    const key = `casting/pending/${randomUUID()}.${ext}`;
    const ticket = await createUploadTicket(key, parsed.data.contentType, parsed.data.size);
    log.info("casting.upload_ticket", { driver: storageDriver(), size: parsed.data.size });
    return json({ ok: true, ...ticket });
  } catch (e) {
    log.error("casting.upload_ticket_failed", { error: String(e) });
    return fail(500, "We couldn't prepare your upload. Please try again, or apply without a video.");
  }
}
