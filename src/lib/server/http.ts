import "server-only";
import { NextResponse } from "next/server";

export function json(data: unknown, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function fail(status: number, error: string, extra?: Record<string, unknown>, headers?: Record<string, string>) {
  return json({ ok: false, error, ...extra }, status, headers);
}

/** Reads a JSON body with a hard size cap (bytes). */
export async function readJson(req: Request, maxBytes: number): Promise<unknown> {
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > maxBytes) throw new BodyTooLargeError();
  const text = await req.text();
  if (text.length > maxBytes) throw new BodyTooLargeError();
  return JSON.parse(text);
}

export class BodyTooLargeError extends Error {}
