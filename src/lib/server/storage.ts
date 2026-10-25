import "server-only";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env, isProd } from "./env";
import { hmac, safeEqual } from "./security";

/**
 * Private media storage for casting videos.
 *
 *  - "s3":    any S3-compatible bucket (AWS S3, Cloudflare R2, Backblaze B2…).
 *             The bucket must be PRIVATE. Browsers upload directly with a
 *             short-lived signed PUT URL; staff view through signed GET URLs.
 *  - "local": development only. Files go to ./.data/uploads via a signed
 *             token handled by /api/casting/upload/local.
 *
 * Uploads land under casting/pending/ and are moved to casting/applications/
 * when the application is submitted. Configure a lifecycle rule to expire
 * casting/pending/ after 1–2 days so abandoned uploads are removed.
 */

export type Driver = "s3" | "local" | "none";

export function storageDriver(): Driver {
  const e = env();
  if (e.STORAGE_DRIVER === "local") return isProd() ? "none" : "local";
  if (e.STORAGE_DRIVER === "s3" || e.S3_BUCKET) {
    return e.S3_BUCKET && e.S3_ACCESS_KEY_ID && e.S3_SECRET_ACCESS_KEY ? "s3" : "none";
  }
  return "none";
}

let s3: S3Client | null = null;
function client() {
  if (!s3) {
    const e = env();
    s3 = new S3Client({
      region: e.S3_REGION || "auto",
      endpoint: e.S3_ENDPOINT,
      forcePathStyle: e.S3_FORCE_PATH_STYLE === "true",
      credentials: { accessKeyId: e.S3_ACCESS_KEY_ID!, secretAccessKey: e.S3_SECRET_ACCESS_KEY! },
    });
  }
  return s3;
}
const bucket = () => env().S3_BUCKET!;

const LOCAL_ROOT = () => path.resolve(process.cwd(), ".data", "uploads");
function localPath(key: string) {
  const p = path.resolve(LOCAL_ROOT(), key);
  if (!p.startsWith(LOCAL_ROOT() + path.sep)) throw new Error("Invalid storage key");
  return p;
}

/* ── Upload URLs ─────────────────────────────────────────────── */

export type UploadTicket = { url: string; method: "PUT"; headers: Record<string, string>; key: string; expiresIn: number };

const UPLOAD_TTL = 15 * 60; // seconds

export async function createUploadTicket(key: string, contentType: string, size: number): Promise<UploadTicket> {
  const driver = storageDriver();
  if (driver === "s3") {
    const cmd = new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    });
    const url = await getSignedUrl(client(), cmd, {
      expiresIn: UPLOAD_TTL,
      signableHeaders: new Set(["content-type", "content-length"]),
    });
    return { url, method: "PUT", headers: { "Content-Type": contentType }, key, expiresIn: UPLOAD_TTL };
  }
  if (driver === "local") {
    const payload = Buffer.from(JSON.stringify({ key, contentType, size, exp: Date.now() + UPLOAD_TTL * 1000 })).toString(
      "base64url",
    );
    const token = `${payload}.${hmac(`upload:${payload}`)}`;
    return {
      url: `/api/casting/upload/local?token=${encodeURIComponent(token)}`,
      method: "PUT",
      headers: { "Content-Type": contentType },
      key,
      expiresIn: UPLOAD_TTL,
    };
  }
  throw new Error("Media storage is not configured.");
}

export function verifyLocalToken(token: string): { key: string; contentType: string; size: number } | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, hmac(`upload:${payload}`))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      key: string;
      contentType: string;
      size: number;
      exp: number;
    };
    if (Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

export async function writeLocal(key: string, body: Buffer) {
  const p = localPath(key);
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, body);
}

/* ── Object operations ──────────────────────────────────────── */

export async function headObject(key: string): Promise<{ size: number; contentType?: string } | null> {
  const driver = storageDriver();
  try {
    if (driver === "s3") {
      const r = await client().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
      return { size: r.ContentLength ?? 0, contentType: r.ContentType };
    }
    if (driver === "local") {
      const s = await stat(localPath(key));
      return { size: s.size };
    }
  } catch {
    return null;
  }
  return null;
}

export async function moveObject(from: string, to: string) {
  const driver = storageDriver();
  if (driver === "s3") {
    await client().send(
      new CopyObjectCommand({ Bucket: bucket(), Key: to, CopySource: `${bucket()}/${encodeURIComponent(from)}` }),
    );
    await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: from }));
    return;
  }
  if (driver === "local") {
    const dest = localPath(to);
    await mkdir(path.dirname(dest), { recursive: true });
    await rename(localPath(from), dest);
    return;
  }
  throw new Error("Media storage is not configured.");
}

export async function deleteObject(key: string) {
  const driver = storageDriver();
  if (driver === "s3") await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
  else if (driver === "local") await rm(localPath(key), { force: true });
}

/** Short-lived signed URL for staff playback (S3), or null for local. */
export async function signedViewUrl(key: string, contentType?: string | null) {
  if (storageDriver() !== "s3") return null;
  return getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: bucket(),
      Key: key,
      ResponseContentType: contentType ?? undefined,
      ResponseContentDisposition: "inline",
    }),
    { expiresIn: 300 },
  );
}

export function localFilePath(key: string) {
  return localPath(key);
}
