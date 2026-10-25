import { storageDriver, verifyLocalToken, writeLocal } from "@/lib/server/storage";
import { fail, json } from "@/lib/server/http";
import { log } from "@/lib/server/log";

/**
 * DEVELOPMENT ONLY — stands in for an S3 signed PUT so the full upload flow
 * can be tested without cloud storage. Disabled whenever the storage driver
 * isn't "local" (which is never the case in production).
 */
export async function PUT(req: Request) {
  if (storageDriver() !== "local") return fail(404, "Not found.");
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const ticket = verifyLocalToken(token);
  if (!ticket) return fail(403, "Upload link expired or invalid.");
  if (req.headers.get("content-type") !== ticket.contentType) return fail(400, "Content type mismatch.");

  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared && declared !== ticket.size) return fail(400, "File size mismatch.");

  const body = Buffer.from(await req.arrayBuffer());
  if (body.length !== ticket.size) return fail(400, "File size mismatch.");
  await writeLocal(ticket.key, body);
  log.info("casting.local_upload", { size: body.length });
  return json({ ok: true });
}
