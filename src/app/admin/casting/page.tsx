import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { purgeExpiredAction } from "./actions";
import { ConfirmForm } from "@/components/admin/forms";
import { formatDate } from "@/components/admin/format";
import { RetentionBadge, StatusPill } from "@/components/admin/status-pill";
import { listApplications, parseFilters, type ListFilters } from "@/lib/server/applications";
import { requireAdmin } from "@/lib/server/auth";
import { STATUS_LABELS, STATUS_VALUES, type ApplicationStatus } from "@/lib/validation/casting";

export const metadata: Metadata = { title: "Applications" };
export const instant = false;

type SearchParams = PageProps<"/admin/casting">["searchParams"];

export default function CastingListPage({ searchParams }: PageProps<"/admin/casting">) {
  return (
    <div className="space-y-10">
      <div>
        <p className="label text-ash">Casting</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">Applications</h1>
      </div>
      <Suspense fallback={<ListSkeleton />}>
        <ApplicationList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function hrefFor(f: Partial<ListFilters>) {
  const p = new URLSearchParams();
  if (f.status) p.set("status", f.status);
  if (f.q) p.set("q", f.q);
  if (f.page && f.page > 1) p.set("page", String(f.page));
  const s = p.toString();
  return s ? `/admin/casting?${s}` : "/admin/casting";
}

async function ApplicationList({ searchParams }: { searchParams: SearchParams }) {
  await connection(); // per-request: dates, session, applicant data
  const user = await requireAdmin();
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const data = await listApplications(user, filters);
  const isAdmin = user.role === "admin";
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]);
  const deleted = one("deleted");
  const forbidden = one("error") === "forbidden";

  const exportParams = new URLSearchParams();
  if (filters.status) exportParams.set("status", filters.status);
  if (filters.q) exportParams.set("q", filters.q);
  const exportQuery = exportParams.toString();
  const exportHref = `/api/admin/casting/export${exportQuery ? `?${exportQuery}` : ""}`;

  const tabs: { key: ApplicationStatus | null; label: string; n: number }[] = [
    { key: null, label: "All", n: data.counts.all },
    ...STATUS_VALUES.map((s) => ({ key: s, label: STATUS_LABELS[s], n: data.counts[s] })),
  ];

  return (
    <div className="space-y-8">
      <div aria-live="polite" className="empty:hidden">
        {deleted ? (
          <p className="rounded-sm border border-line-strong px-4 py-3 text-sm text-bone">
            Application <span className="font-mono">{deleted.slice(0, 32)}</span> and its media were deleted.
          </p>
        ) : null}
        {forbidden ? (
          <p className="rounded-sm border border-line-strong px-4 py-3 text-sm text-bone">
            That action requires the admin role.
          </p>
        ) : null}
      </div>

      {/* Search + export */}
      <div className="flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
        <form role="search" action="/admin/casting" method="get" className="flex w-full max-w-xl items-end gap-3">
          {filters.status ? <input type="hidden" name="status" value={filters.status} /> : null}
          <div className="flex-1">
            <label htmlFor="q" className="label block text-ash">
              Search name, email, city or reference
            </label>
            <input id="q" name="q" type="search" defaultValue={filters.q} maxLength={100} className="field" />
          </div>
          <button
            type="submit"
            className="label rounded-sm border border-line-strong px-4 py-3 text-ivory transition-colors hover:border-ivory"
          >
            Search
          </button>
          {filters.q ? (
            <Link href={hrefFor({ status: filters.status })} className="label px-2 py-3 text-ash hover:text-ivory">
              Clear
            </Link>
          ) : null}
        </form>
        {isAdmin ? (
          <a
            href={exportHref}
            className="label inline-flex shrink-0 items-center justify-center rounded-sm border border-line-strong px-4 py-3 text-ivory transition-colors hover:border-ivory"
          >
            Export CSV{filters.status || filters.q ? " (filtered)" : ""}
          </a>
        ) : null}
      </div>

      {/* Status tabs */}
      <nav aria-label="Filter by status" className="-mx-1 overflow-x-auto">
        <ul className="flex min-w-max gap-1 px-1">
          {tabs.map((tab) => {
            const active = tab.key === filters.status;
            return (
              <li key={tab.key ?? "all"}>
                <Link
                  href={hrefFor({ status: tab.key, q: filters.q })}
                  aria-current={active ? "page" : undefined}
                  className={`label flex items-center gap-2 rounded-sm border px-3 py-2 transition-colors ${
                    active ? "border-ivory text-ivory" : "border-transparent text-ash hover:border-line-strong hover:text-ivory"
                  }`}
                >
                  {tab.label}
                  <span className={active ? "text-gold" : "text-smoke"}>{tab.n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Results */}
      {data.items.length === 0 ? (
        <p className="border-y border-line py-16 text-center text-ash">
          {filters.q || filters.status ? "No applications match these filters." : "No applications yet."}
        </p>
      ) : (
        <div className="overflow-x-auto border-y border-line">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <caption className="sr-only">
              Casting applications, newest first. Page {data.page} of {data.pageCount}.
            </caption>
            <thead>
              <tr className="border-b border-line">
                {["Reference", "Name", "City / State", "Submitted", "Video", "Status"].map((h) => (
                  <th key={h} scope="col" className="label px-3 py-3 font-normal text-ash">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-b-0 hover:bg-night">
                  <td className="px-3 py-4 font-mono text-xs">
                    <Link
                      href={`/admin/casting/${a.id}`}
                      prefetch={false}
                      className="text-ivory underline decoration-line-strong underline-offset-4 hover:decoration-ivory"
                    >
                      {a.reference}
                    </Link>
                  </td>
                  <td className="px-3 py-4">
                    <span className="text-ivory">{a.fullName}</span>
                    {a.preferredName ? <span className="text-ash"> ({a.preferredName})</span> : null}
                  </td>
                  <td className="px-3 py-4 text-bone">
                    {a.city}, {a.state}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-bone">
                    <time dateTime={a.createdAt.toISOString()}>{formatDate(a.createdAt)}</time>
                  </td>
                  <td className="px-3 py-4 text-bone">{a.hasVideo ? "Yes" : <span className="text-ash">No</span>}</td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      <StatusPill status={a.status} />
                      {a.pastRetention ? <RetentionBadge /> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data.pageCount > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
          {data.page > 1 ? (
            <Link
              href={hrefFor({ ...filters, page: data.page - 1 })}
              className="label rounded-sm border border-line-strong px-4 py-3 hover:border-ivory"
            >
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <p className="label text-ash">
            Page {data.page} of {data.pageCount} · {data.total} total
          </p>
          {data.page < data.pageCount ? (
            <Link
              href={hrefFor({ ...filters, page: data.page + 1 })}
              className="label rounded-sm border border-line-strong px-4 py-3 hover:border-ivory"
            >
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : (
        <p className="label text-ash">{data.total} total</p>
      )}

      {/* Retention purge (admin only) */}
      {isAdmin ? (
        <section aria-labelledby="purge-heading" className="border-t border-line pt-10">
          <h2 id="purge-heading" className="label text-ash">
            Data retention
          </h2>
          <p className="mt-3 max-w-[70ch] text-bone">
            “Not Selected” applications are kept for {data.retentionDays} days after submission.{" "}
            {data.expiredCount === 0
              ? "None are past the retention period."
              : `${data.expiredCount} ${data.expiredCount === 1 ? "is" : "are"} past the retention period and can be permanently deleted, including any videos.`}
          </p>
          {data.expiredCount > 0 ? (
            <details className="mt-6 max-w-xl rounded-sm border border-line p-5">
              <summary className="label cursor-pointer text-ivory">Purge expired applications…</summary>
              <div className="mt-5 space-y-4">
                <p className="text-sm text-bone">
                  This permanently deletes {data.expiredCount} application{data.expiredCount === 1 ? "" : "s"} and
                  their stored videos. It cannot be undone.
                </p>
                <ConfirmForm
                  action={purgeExpiredAction}
                  phrase="PURGE"
                  inputLabel="To confirm, type"
                  submitLabel="Purge permanently"
                  pendingLabel="Purging…"
                  idPrefix="purge"
                />
              </div>
            </details>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading applications" className="space-y-6">
      <div className="h-14 max-w-xl animate-pulse rounded-sm bg-night" />
      <div className="h-9 animate-pulse rounded-sm bg-night" />
      <div className="h-96 animate-pulse rounded-sm bg-night" />
    </div>
  );
}
