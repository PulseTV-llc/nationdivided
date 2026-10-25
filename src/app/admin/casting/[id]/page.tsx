import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { addNoteAction, deleteApplicationAction, updateStatusAction } from "../actions";
import { ConfirmForm, NoteForm, StatusForm } from "@/components/admin/forms";
import {
  comfortLabel,
  feelingLabel,
  formatBytes,
  formatDateTime,
  introLabel,
  voteLabel,
} from "@/components/admin/format";
import { RetentionBadge, StatusPill } from "@/components/admin/status-pill";
import { getApplication, NOTE_MAX } from "@/lib/server/applications";
import { audit, requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Application" };
export const instant = false;

export default function ApplicationPage({ params }: PageProps<"/admin/casting/[id]">) {
  return (
    <div className="space-y-10">
      <Link href="/admin/casting" className="label inline-block text-ash hover:text-ivory">
        ← All applications
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <ApplicationDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ApplicationDetail({ params }: { params: PageProps<"/admin/casting/[id]">["params"] }) {
  await connection(); // per-request: dates, session, applicant data
  const user = await requireAdmin();
  const { id } = await params;
  const app = await getApplication(user, id);
  if (!app) notFound();
  await audit(user, "application.view", app.id);

  const displayName = app.preferredName ? `${app.fullName} (${app.preferredName})` : app.fullName;

  return (
    <article className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-12">
        <header className="space-y-4 border-b border-line pb-8">
          <p className="label font-mono text-ash">{app.reference}</p>
          <h1 className="text-3xl font-medium leading-tight text-ivory sm:text-4xl">{displayName}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={app.status} />
            {app.pastRetention ? <RetentionBadge /> : null}
            <span className="text-sm text-ash">
              Submitted <time dateTime={app.createdAt.toISOString()}>{formatDateTime(app.createdAt)}</time>
              {app.updatedAt.getTime() !== app.createdAt.getTime() ? (
                <>
                  {" · "}Updated <time dateTime={app.updatedAt.toISOString()}>{formatDateTime(app.updatedAt)}</time>
                </>
              ) : null}
            </span>
          </div>
        </header>

        <Section title="About you" n="01">
          <Field label="Full name">{app.fullName}</Field>
          <Field label="Preferred name">{app.preferredName || <Empty />}</Field>
          <Field label="Email">
            <a href={`mailto:${app.email}`} className="underline decoration-line-strong underline-offset-4">
              {app.email}
            </a>
          </Field>
          <Field label="Phone">
            <a href={`tel:${app.phone.replace(/[^\d+]/g, "")}`} className="underline decoration-line-strong underline-offset-4">
              {app.phone}
            </a>
          </Field>
          <Field label="18 or older">{app.isAdult ? "Yes" : "No"}</Field>
          <Field label="Location">
            {app.city}, {app.state}
          </Field>
        </Section>

        <Section title="Experience" n="02">
          <Field label="Voted for Donald Trump in 2024">{voteLabel(app.votedTrump2024)}</Field>
          <Field label="How they feel now">{feelingLabel(app.feeling)}</Field>
          <LongField label="In their words">{app.feelingDetail}</LongField>
          <Field label="Issues that matter most" wide>
            {app.issues.length ? (
              <ul className="flex flex-wrap gap-2">
                {app.issues.map((issue) => (
                  <li key={issue} className="rounded-full border border-line px-3 py-1 text-sm text-bone">
                    {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty />
            )}
          </Field>
          {app.issuesOther ? <LongField label="Other issue">{app.issuesOther}</LongField> : null}
          <LongField label="What they hoped would change">{app.hopedChange}</LongField>
          <LongField label="How their views have evolved">{app.viewsEvolved}</LongField>
        </Section>

        <Section title="Story" n="03">
          <LongField label="About them">{app.aboutYou}</LongField>
          <LongField label="A normal day">{app.normalDay}</LongField>
          <LongField label="Why they want to be part of the documentary">{app.whyDocument}</LongField>
          <LongField label="How life has changed">{app.lifeChanges}</LongField>
          <Field label="Comfortable on camera">{comfortLabel(app.comfortableOnCamera)}</Field>
          <Field label="Open to introducing family or friends">{introLabel(app.openToIntroductions)}</Field>
        </Section>

        <Section title="Media" n="04" plain>
          {app.videoKey ? (
            <div className="space-y-3 sm:col-span-2">
              <video
                controls
                preload="none"
                playsInline
                controlsList="nodownload"
                src={`/api/admin/media/${app.id}`}
                className="aspect-video w-full max-w-3xl rounded-sm border border-line bg-night"
                aria-label={`Introduction video from ${displayName}`}
              >
                Your browser can’t play this video.
              </video>
              <p className="text-xs text-ash">
                {app.videoFileName ? <span className="font-mono">{app.videoFileName}</span> : "Introduction video"}
                {" · "}
                {app.videoContentType ?? "unknown type"} · {formatBytes(app.videoSize)}. Private — streamed only to
                signed-in staff; each view is logged.
              </p>
            </div>
          ) : (
            <p className="text-ash sm:col-span-2">No video was submitted.</p>
          )}
        </Section>

        <Section title="Consent" n="05">
          <Field label="Consent given">
            <time dateTime={app.consentedAt.toISOString()}>{formatDateTime(app.consentedAt)}</time>
          </Field>
          <Field label="Consent version">
            <span className="font-mono text-sm">{app.consentVersion}</span>
          </Field>
          <Field label="Confirmation email sent">{app.confirmationEmailSent ? "Yes" : "No"}</Field>
        </Section>
      </div>

      {/* Review sidebar */}
      <aside className="space-y-10 lg:sticky lg:top-8 lg:self-start" aria-label="Review">
        <section aria-labelledby="review-heading" className="space-y-4 border-t border-line pt-6">
          <h2 id="review-heading" className="label text-ash">
            Review
          </h2>
          <StatusForm action={updateStatusAction} id={app.id} status={app.status} />
        </section>

        <section aria-labelledby="notes-heading" className="space-y-5 border-t border-line pt-6">
          <h2 id="notes-heading" className="label text-ash">
            Notes <span className="text-smoke">{app.notes.length}</span>
          </h2>
          {app.notes.length ? (
            <ol className="space-y-5">
              {app.notes.map((note) => (
                <li key={note.id} className="space-y-2 border-l border-line-strong pl-4">
                  <p className="text-xs text-ash">
                    <span className="text-bone">{note.authorName}</span> ·{" "}
                    <time dateTime={note.createdAt.toISOString()}>{formatDateTime(note.createdAt)}</time>
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ivory">{note.body}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-ash">No notes yet.</p>
          )}
          <NoteForm action={addNoteAction} id={app.id} max={NOTE_MAX} />
        </section>

        {user.role === "admin" ? (
          <section aria-labelledby="delete-heading" className="space-y-4 border-t border-line pt-6">
            <h2 id="delete-heading" className="label text-ash">
              Delete
            </h2>
            <details className="rounded-sm border border-line p-4">
              <summary className="label cursor-pointer text-ivory">Delete this application…</summary>
              <div className="mt-4 space-y-4">
                <p className="text-sm text-bone">
                  Permanently deletes the application, its notes{app.videoKey ? ", and the stored video" : ""}. Use
                  this when an applicant asks to withdraw. It cannot be undone.
                </p>
                <ConfirmForm
                  action={deleteApplicationAction}
                  phrase={app.reference}
                  inputLabel="To confirm, type the reference"
                  submitLabel="Delete permanently"
                  pendingLabel="Deleting…"
                  hidden={{ id: app.id }}
                  idPrefix="delete"
                />
              </div>
            </details>
          </section>
        ) : null}
      </aside>
    </article>
  );
}

/* ── Layout helpers ──────────────────────────────────────────── */

function Section({ title, n, children, plain }: { title: string; n: string; children: ReactNode; plain?: boolean }) {
  const id = `section-${n}`;
  return (
    <section aria-labelledby={id} className="space-y-6">
      <h2 id={id} className="label flex items-baseline gap-3 text-ash">
        <span className="text-smoke">{n}</span>
        {title}
      </h2>
      {plain ? (
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">{children}</div>
      ) : (
        <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">{children}</dl>
      )}
    </section>
  );
}

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="label text-ash">{label}</dt>
      <dd className="mt-2 break-words text-ivory">{children}</dd>
    </div>
  );
}

function LongField({ label, children }: { label: string; children: string | null | undefined }) {
  return (
    <div className="sm:col-span-2">
      <dt className="label text-ash">{label}</dt>
      <dd className="mt-2 max-w-[70ch] whitespace-pre-wrap break-words text-[1.0625rem] leading-relaxed text-ivory">
        {children?.trim() ? children : <Empty />}
      </dd>
    </div>
  );
}

function Empty() {
  return <span className="text-smoke">Not provided</span>;
}

function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading application" className="space-y-6">
      <div className="h-10 w-2/3 animate-pulse rounded-sm bg-night" />
      <div className="h-64 animate-pulse rounded-sm bg-night" />
      <div className="h-64 animate-pulse rounded-sm bg-night" />
    </div>
  );
}
