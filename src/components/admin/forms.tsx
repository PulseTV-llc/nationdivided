"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin/casting/actions";
import { STATUS_LABELS, STATUS_VALUES, type ApplicationStatus } from "@/lib/validation/casting";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const buttonBase =
  "label inline-flex items-center justify-center rounded-sm px-4 py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const primaryButton = `${buttonBase} bg-ivory text-ink hover:bg-bone`;
const quietButton = `${buttonBase} border border-line-strong text-ivory hover:border-ivory`;

/** Polite live region announcing the result of the last action. */
function Result({ state, id }: { state: ActionState; id: string }) {
  return (
    <p id={id} aria-live="polite" aria-atomic="true" role="status" className="min-h-5 text-sm">
      {state ? <span className={state.ok ? "text-bone" : "text-crimson-lit"}>{state.message}</span> : null}
    </p>
  );
}

/* ── Status ──────────────────────────────────────────────────── */

export function StatusForm({
  action,
  id,
  status,
}: {
  action: Action;
  id: string;
  status: ApplicationStatus;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="status-select" className="label block text-ash">
        Status
      </label>
      <div className="flex flex-wrap items-end gap-3">
        <select
          id="status-select"
          name="status"
          defaultValue={status}
          key={status}
          className="field max-w-xs flex-1"
          aria-describedby="status-result"
        >
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : "Save status"}
        </button>
      </div>
      <Result state={state} id="status-result" />
    </form>
  );
}

/* ── Notes ───────────────────────────────────────────────────── */

export function NoteForm({ action, id, max }: { action: Action; id: string; max: number }) {
  const [state, formAction, pending] = useActionState(action, null);
  // Remount the fields (clearing the textarea) after each successful save.
  const fieldsKey = state?.ok ? `saved-${state.at}` : "draft";

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <NoteFields key={fieldsKey} max={max} pending={pending} />
      <Result state={state} id="note-result" />
    </form>
  );
}

function NoteFields({ max, pending }: { max: number; pending: boolean }) {
  // Controlled so a failed save never discards what was typed.
  const [value, setValue] = useState("");
  const length = value.length;
  return (
    <>
      <label htmlFor="note-body" className="label block text-ash">
        Add a note
      </label>
      <textarea
        id="note-body"
        name="body"
        required
        maxLength={max}
        rows={4}
        className="field"
        aria-describedby="note-help note-result"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p id="note-help" className="text-xs text-ash">
          Visible to all casting staff. {length.toLocaleString()}/{max.toLocaleString()} characters.
        </p>
        <button type="submit" disabled={pending} className={quietButton}>
          {pending ? "Saving…" : "Save note"}
        </button>
      </div>
    </>
  );
}

/* ── Typed confirmation (delete / purge) ─────────────────────── */

export function ConfirmForm({
  action,
  phrase,
  inputLabel,
  submitLabel,
  pendingLabel,
  hidden,
  idPrefix,
}: {
  action: Action;
  phrase: string;
  inputLabel: string;
  submitLabel: string;
  pendingLabel: string;
  hidden?: Record<string, string>;
  idPrefix: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="space-y-3">
      {Object.entries(hidden ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <label htmlFor={`${idPrefix}-confirm`} className="block text-sm text-bone">
        {inputLabel} <code className="font-mono text-ivory">{phrase}</code>
      </label>
      <div className="flex flex-wrap items-end gap-3">
        <input
          id={`${idPrefix}-confirm`}
          name="confirm"
          type="text"
          required
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={64}
          className="field max-w-xs flex-1 font-mono"
          aria-describedby={`${idPrefix}-result`}
        />
        <button
          type="submit"
          disabled={pending}
          className={`${buttonBase} border border-crimson-lit/60 text-crimson-lit hover:bg-crimson/20`}
        >
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
      <Result state={state} id={`${idPrefix}-result`} />
    </form>
  );
}
