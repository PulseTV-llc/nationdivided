import { comfortLabel, feelingLabel, introLabel, voteLabel } from "@/components/admin/format";
import { exportApplications, parseFilters } from "@/lib/server/applications";
import { adminFromRequest, audit } from "@/lib/server/auth";
import { log } from "@/lib/server/log";
import { STATUS_LABELS } from "@/lib/validation/casting";

/**
 * CSV export of casting applications (admin role only). Uses the same filters
 * as the list. Video storage keys are never exported. Every cell is escaped
 * for CSV and neutralized against spreadsheet formula injection.
 */

const HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

/** Leading characters that make Excel/Sheets/LibreOffice treat a cell as a formula. */
const BOM = String.fromCharCode(0xfeff);
const FORMULA_START = /^[=+\-@\t\r]/;

function csvCell(value: unknown): string {
  let s: string;
  if (value === null || value === undefined) s = "";
  else if (value instanceof Date) s = value.toISOString();
  else if (Array.isArray(value)) s = value.join("; ");
  else s = String(value);
  if (FORMULA_START.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const csvRow = (cells: unknown[]) => cells.map(csvCell).join(",");

export async function GET(request: Request) {
  const anyUser = await adminFromRequest();
  if (!anyUser) return new Response("Unauthorized", { status: 401, headers: HEADERS });
  const user = await adminFromRequest("admin");
  if (!user) return new Response("Forbidden", { status: 403, headers: HEADERS });

  const filters = parseFilters(new URL(request.url).searchParams);

  let rows: Awaited<ReturnType<typeof exportApplications>>;
  try {
    rows = await exportApplications(user, { q: filters.q, status: filters.status });
  } catch (e) {
    log.error("casting.export_failed", { error: String(e) });
    return new Response("Export failed", { status: 500, headers: HEADERS });
  }

  const columns: [string, (r: (typeof rows)[number]) => unknown][] = [
    ["reference", (r) => r.reference],
    ["status", (r) => STATUS_LABELS[r.status]],
    ["submitted_at", (r) => r.createdAt],
    ["updated_at", (r) => r.updatedAt],
    ["full_name", (r) => r.fullName],
    ["preferred_name", (r) => r.preferredName],
    ["email", (r) => r.email],
    ["phone", (r) => r.phone],
    ["is_adult", (r) => (r.isAdult ? "yes" : "no")],
    ["city", (r) => r.city],
    ["state", (r) => r.state],
    ["voted_trump_2024", (r) => voteLabel(r.votedTrump2024)],
    ["feeling", (r) => feelingLabel(r.feeling)],
    ["feeling_detail", (r) => r.feelingDetail],
    ["issues", (r) => r.issues],
    ["issues_other", (r) => r.issuesOther],
    ["hoped_change", (r) => r.hopedChange],
    ["views_evolved", (r) => r.viewsEvolved],
    ["about_you", (r) => r.aboutYou],
    ["normal_day", (r) => r.normalDay],
    ["why_document", (r) => r.whyDocument],
    ["life_changes", (r) => r.lifeChanges],
    ["comfortable_on_camera", (r) => comfortLabel(r.comfortableOnCamera)],
    ["open_to_introductions", (r) => introLabel(r.openToIntroductions)],
    ["has_video", (r) => (r.videoKey ? "yes" : "no")],
    ["consented_at", (r) => r.consentedAt],
    ["consent_version", (r) => r.consentVersion],
  ];

  const lines = [csvRow(columns.map(([name]) => name)), ...rows.map((r) => csvRow(columns.map(([, get]) => get(r))))];
  // BOM so Excel opens UTF-8 correctly; CRLF line endings per RFC 4180.
  const body = BOM + `${lines.join("\r\n")}\r\n`;

  await audit(user, "applications.export", null, {
    status: filters.status,
    q: filters.q || null, // staff search text (for accountability), never applicant answers
    rows: rows.length,
  });

  const date = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    status: 200,
    headers: {
      ...HEADERS,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="casting-export-${date}.csv"`,
    },
  });
}
