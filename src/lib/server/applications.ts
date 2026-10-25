import "server-only";
import { and, asc, count, desc, eq, ilike, lt, or, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { STATUS_VALUES, type ApplicationStatus } from "@/lib/validation/casting";
import { getAdmin, type AdminUser } from "./auth";
import { env } from "./env";
import { log } from "./log";
import { deleteObject } from "./storage";

/**
 * Admin data access for casting applications.
 *
 * Every exported function takes the AdminUser returned by `requireAdmin()` /
 * `adminFromRequest()` and re-verifies it against the current request's
 * session (deduplicated per request by `getAdmin`'s React cache), so a caller
 * cannot reach applicant data by constructing an AdminUser object by hand.
 * There is deliberately no unauthenticated accessor in this module.
 */

const t = schema.castingApplications;
const notes = schema.castingNotes;

export const PAGE_SIZE = 25;
export const NOTE_MAX = 4000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class AdminAccessError extends Error {
  constructor(message = "Not authorized.") {
    super(message);
    this.name = "AdminAccessError";
  }
}

async function verify(actor: AdminUser, role?: "admin"): Promise<AdminUser> {
  const current = await getAdmin();
  if (!current || current.id !== actor.id) throw new AdminAccessError();
  if (role === "admin" && current.role !== "admin") throw new AdminAccessError("This action requires the admin role.");
  return current;
}

export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);
export const isStatus = (v: unknown): v is ApplicationStatus =>
  typeof v === "string" && (STATUS_VALUES as readonly string[]).includes(v);

/* ── Filters ─────────────────────────────────────────────────── */

export type ListFilters = { q: string; status: ApplicationStatus | null; page: number };

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

/** Normalizes untrusted query params into safe filters. */
export function parseFilters(params: RawParams): ListFilters {
  const get = (k: string) => {
    const v = params instanceof URLSearchParams ? params.get(k) : params[k];
    return (Array.isArray(v) ? v[0] : v) ?? "";
  };
  const q = get("q").trim().slice(0, 100);
  const s = get("status");
  const page = Math.min(10_000, Math.max(1, Number.parseInt(get("page"), 10) || 1));
  return { q, status: isStatus(s) ? s : null, page };
}

/** Escapes LIKE wildcards so user input is matched literally. */
const likeEscape = (v: string) => v.replace(/[\\%_]/g, (c) => `\\${c}`);

function searchCondition(q: string): SQL | undefined {
  if (!q) return undefined;
  const pattern = `%${likeEscape(q)}%`;
  return or(
    ilike(t.fullName, pattern),
    ilike(t.preferredName, pattern),
    ilike(t.email, pattern),
    ilike(t.city, pattern),
    ilike(t.reference, pattern),
  );
}

function filterCondition(f: Pick<ListFilters, "q" | "status">): SQL | undefined {
  return and(searchCondition(f.q), f.status ? eq(t.status, f.status) : undefined);
}

export function retentionCutoff() {
  return new Date(Date.now() - env().CASTING_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

/* ── Reads ───────────────────────────────────────────────────── */

export type ApplicationListItem = {
  id: string;
  reference: string;
  fullName: string;
  preferredName: string | null;
  city: string;
  state: string;
  createdAt: Date;
  status: ApplicationStatus;
  hasVideo: boolean;
  pastRetention: boolean;
};

export type ApplicationList = {
  items: ApplicationListItem[];
  total: number;
  page: number;
  pageCount: number;
  counts: Record<ApplicationStatus | "all", number>;
  expiredCount: number;
  retentionDays: number;
};

export async function listApplications(actor: AdminUser, filters: ListFilters): Promise<ApplicationList> {
  await verify(actor);
  const db = await getDb();
  const where = filterCondition(filters);
  const cutoff = retentionCutoff();

  const [countRows, expiredRows] = await Promise.all([
    db.select({ status: t.status, n: count() }).from(t).where(searchCondition(filters.q)).groupBy(t.status),
    db
      .select({ n: count() })
      .from(t)
      .where(and(eq(t.status, "not_selected"), lt(t.createdAt, cutoff))),
  ]);

  const counts = Object.fromEntries([["all", 0], ...STATUS_VALUES.map((s) => [s, 0])]) as ApplicationList["counts"];
  for (const r of countRows) {
    counts[r.status] = Number(r.n);
    counts.all += Number(r.n);
  }
  const total = filters.status ? counts[filters.status] : counts.all;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);

  const rows = await db
    .select({
      id: t.id,
      reference: t.reference,
      fullName: t.fullName,
      preferredName: t.preferredName,
      city: t.city,
      state: t.state,
      createdAt: t.createdAt,
      status: t.status,
      videoKey: t.videoKey,
    })
    .from(t)
    .where(where)
    .orderBy(desc(t.createdAt), desc(t.id))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return {
    items: rows.map(({ videoKey, ...r }) => ({
      ...r,
      hasVideo: Boolean(videoKey),
      pastRetention: r.status === "not_selected" && r.createdAt < cutoff,
    })),
    total,
    page,
    pageCount,
    counts,
    expiredCount: Number(expiredRows[0]?.n ?? 0),
    retentionDays: env().CASTING_RETENTION_DAYS,
  };
}

export type ApplicationDetail = typeof t.$inferSelect & {
  notes: (typeof notes.$inferSelect)[];
  pastRetention: boolean;
};

export async function getApplication(actor: AdminUser, id: string): Promise<ApplicationDetail | null> {
  await verify(actor);
  if (!isUuid(id)) return null;
  const db = await getDb();
  const [row] = await db.select().from(t).where(eq(t.id, id)).limit(1);
  if (!row) return null;
  const noteRows = await db.select().from(notes).where(eq(notes.applicationId, id)).orderBy(asc(notes.createdAt));
  return {
    ...row,
    notes: noteRows,
    pastRetention: row.status === "not_selected" && row.createdAt < retentionCutoff(),
  };
}

/** Minimal lookup for the media route. */
export async function getApplicationVideo(actor: AdminUser, id: string) {
  await verify(actor);
  if (!isUuid(id)) return null;
  const db = await getDb();
  const [row] = await db
    .select({ id: t.id, videoKey: t.videoKey, videoContentType: t.videoContentType, videoSize: t.videoSize })
    .from(t)
    .where(eq(t.id, id))
    .limit(1);
  return row ?? null;
}

/** All rows matching the list filters, for CSV export (admin role only). */
export async function exportApplications(actor: AdminUser, filters: Pick<ListFilters, "q" | "status">) {
  await verify(actor, "admin");
  const db = await getDb();
  return db.select().from(t).where(filterCondition(filters)).orderBy(desc(t.createdAt), desc(t.id));
}

/* ── Writes ──────────────────────────────────────────────────── */

export async function updateStatus(actor: AdminUser, id: string, status: ApplicationStatus) {
  await verify(actor);
  if (!isUuid(id) || !isStatus(status)) throw new Error("Invalid input.");
  const db = await getDb();
  const [before] = await db.select({ status: t.status }).from(t).where(eq(t.id, id)).limit(1);
  if (!before) return { found: false as const };
  if (before.status === status) return { found: true as const, changed: false, from: before.status, to: status };
  await db.update(t).set({ status, updatedAt: new Date() }).where(eq(t.id, id));
  return { found: true as const, changed: true, from: before.status, to: status };
}

export async function addNote(actor: AdminUser, id: string, body: string) {
  const user = await verify(actor);
  if (!isUuid(id)) throw new Error("Invalid input.");
  const text = body.trim();
  if (!text || text.length > NOTE_MAX) throw new Error("Invalid note.");
  const db = await getDb();
  const [app] = await db.select({ id: t.id }).from(t).where(eq(t.id, id)).limit(1);
  if (!app) return null;
  const [note] = await db
    .insert(notes)
    .values({ applicationId: id, authorId: user.id, authorName: user.name, body: text })
    .returning({ id: notes.id });
  return note ?? null;
}

/**
 * Deletes the stored video (if any) and then the row, only when
 * `confirmReference` matches the application's reference. Admin role only.
 */
export async function deleteApplication(actor: AdminUser, id: string, confirmReference: string) {
  await verify(actor, "admin");
  if (!isUuid(id)) return { status: "not_found" as const };
  const db = await getDb();
  const [row] = await db.select({ id: t.id, reference: t.reference, videoKey: t.videoKey }).from(t).where(eq(t.id, id));
  if (!row) return { status: "not_found" as const };
  if (row.reference.toUpperCase() !== confirmReference.trim().toUpperCase()) return { status: "mismatch" as const };
  if (row.videoKey) await deleteObject(row.videoKey); // throws → row is kept, so no orphaned video
  await db.delete(t).where(eq(t.id, id)); // notes cascade
  return { status: "deleted" as const, reference: row.reference, hadVideo: Boolean(row.videoKey) };
}

/**
 * Deletes "not_selected" applications submitted more than
 * CASTING_RETENTION_DAYS ago, including their videos. Rows whose video could
 * not be deleted are kept so they can be retried. Admin role only.
 */
export async function purgeExpired(actor: AdminUser) {
  await verify(actor, "admin");
  const db = await getDb();
  const cutoff = retentionCutoff();
  const rows = await db
    .select({ id: t.id, videoKey: t.videoKey })
    .from(t)
    .where(and(eq(t.status, "not_selected"), lt(t.createdAt, cutoff)));

  let deleted = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      if (row.videoKey) await deleteObject(row.videoKey);
      await db.delete(t).where(and(eq(t.id, row.id), eq(t.status, "not_selected")));
      deleted++;
    } catch (e) {
      failed++;
      log.error("casting.purge_item_failed", { applicationId: row.id, error: String(e) });
    }
  }
  return { deleted, failed, retentionDays: env().CASTING_RETENTION_DAYS };
}
