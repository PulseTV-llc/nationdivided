import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { getApplicationVideo } from "@/lib/server/applications";
import { adminFromRequest, audit } from "@/lib/server/auth";
import { log } from "@/lib/server/log";
import { localFilePath, signedViewUrl, storageDriver } from "@/lib/server/storage";

/**
 * Staff-only video playback.
 *  - S3: 302 to a 5-minute signed GET URL (the bucket stays private).
 *  - local (development): streams the file with HTTP Range support so seeking works.
 * Views are audited once per playback (the first, non-ranged or bytes=0- request).
 */

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
};

const EXT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".m4v": "video/x-m4v",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

const plain = (status: number, body: string, extra?: Record<string, string>) =>
  new Response(body, { status, headers: { ...PRIVATE_HEADERS, "Content-Type": "text/plain; charset=utf-8", ...extra } });

/** Parses a single-range `Range` header. Returns null for "serve whole file", "invalid" for 416. */
function parseRange(header: string | null, size: number): { start: number; end: number } | null | "invalid" {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return header.includes(",") ? null : "invalid"; // multi-range → send the whole file
  const [, s, e] = m;
  let start: number;
  let end: number;
  if (s === "" && e === "") return "invalid";
  if (s === "") {
    const suffix = Number(e);
    if (suffix === 0) return "invalid";
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(s);
    end = e === "" ? size - 1 : Math.min(Number(e), size - 1);
  }
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) return "invalid";
  return { start, end };
}

export async function GET(request: Request, ctx: RouteContext<"/api/admin/media/[id]">) {
  const user = await adminFromRequest();
  if (!user) return plain(401, "Unauthorized");

  const { id } = await ctx.params;
  let video: Awaited<ReturnType<typeof getApplicationVideo>>;
  try {
    video = await getApplicationVideo(user, id);
  } catch (e) {
    log.error("media.lookup_failed", { applicationId: id.slice(0, 64), error: String(e) });
    return plain(500, "Server error");
  }
  if (!video?.videoKey) return plain(404, "Not found");

  const rangeHeader = request.headers.get("range");
  const isFirstRequest = !rangeHeader || /^bytes=0-/.test(rangeHeader.trim());
  const driver = storageDriver();

  if (driver === "s3") {
    try {
      const url = await signedViewUrl(video.videoKey, video.videoContentType);
      if (!url) return plain(503, "Media storage unavailable");
      if (isFirstRequest) await audit(user, "media.view", video.id, { driver });
      return new Response(null, { status: 302, headers: { ...PRIVATE_HEADERS, Location: url } });
    } catch (e) {
      log.error("media.sign_failed", { applicationId: video.id, error: String(e) });
      return plain(502, "Media storage error");
    }
  }

  if (driver === "local") {
    let file: string;
    let size: number;
    try {
      file = localFilePath(video.videoKey);
      size = (await stat(file)).size;
    } catch {
      return plain(404, "Video file not found");
    }
    if (size === 0) return plain(404, "Video file is empty");
    const contentType =
      video.videoContentType || EXT_TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    const range = parseRange(rangeHeader, size);
    if (range === "invalid") return plain(416, "Range not satisfiable", { "Content-Range": `bytes */${size}` });

    if (isFirstRequest) await audit(user, "media.view", video.id, { driver });

    const start = range?.start ?? 0;
    const end = range?.end ?? size - 1;
    const stream = Readable.toWeb(createReadStream(file, { start, end })) as unknown as ReadableStream<Uint8Array>;
    const headers: Record<string, string> = {
      ...PRIVATE_HEADERS,
      "Content-Type": contentType,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
      "Content-Disposition": "inline",
    };
    if (range) headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
    return new Response(stream, { status: range ? 206 : 200, headers });
  }

  return plain(503, "Media storage is not configured");
}
