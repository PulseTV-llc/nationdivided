"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

/* Shared building blocks for every public form. Each field wires its label,
   hint and error to the control with aria-describedby / aria-invalid. */

type Base = { label: ReactNode; hint?: ReactNode; error?: string; optional?: boolean; className?: string };

function FieldShell({
  id,
  label,
  hint,
  error,
  optional,
  className = "",
  counter,
  children,
}: Base & { id: string; counter?: ReactNode; children: ReactNode }) {
  return (
    <div className={`group/field ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="block text-[0.95rem] text-ivory">
          {label}
          {optional ? <span className="ml-2 text-sm text-ash">(optional)</span> : null}
        </label>
        {counter}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm leading-relaxed text-ash">
          {hint}
        </p>
      ) : null}
      {children}
      <p id={`${id}-error`} role={error ? "alert" : undefined} className="mt-2 min-h-[1.25rem] text-sm text-crimson-lit">
        {error ?? ""}
      </p>
    </div>
  );
}

const describedBy = (id: string, hint?: ReactNode) => [hint ? `${id}-hint` : null, `${id}-error`].filter(Boolean).join(" ");

export const TextField = forwardRef<HTMLInputElement, Base & InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { label, hint, error, optional, className, id: idProp, ...rest },
  ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <input
        ref={ref}
        id={id}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint)}
        aria-required={!optional || undefined}
        {...rest}
      />
    </FieldShell>
  );
});

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  Base & TextareaHTMLAttributes<HTMLTextAreaElement> & { length?: number; maxLength?: number }
>(function TextArea({ label, hint, error, optional, className, id: idProp, length = 0, maxLength, ...rest }, ref) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={className}
      counter={
        maxLength ? (
          <span className={`label shrink-0 tabular-nums ${length > maxLength * 0.9 ? "text-gold" : "text-smoke"}`} aria-hidden>
            {length}/{maxLength}
          </span>
        ) : null
      }
    >
      <textarea
        ref={ref}
        id={id}
        rows={5}
        maxLength={maxLength}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint)}
        aria-required={!optional || undefined}
        data-lenis-prevent
        {...rest}
      />
    </FieldShell>
  );
});

export const SelectField = forwardRef<
  HTMLSelectElement,
  Base & SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] | readonly { value: string; label: string }[]; placeholder?: string }
>(function SelectField({ label, hint, error, optional, className, id: idProp, options, placeholder, ...rest }, ref) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <select
        ref={ref}
        id={id}
        className="field pr-8"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint)}
        aria-required={!optional || undefined}
        {...rest}
      >
        <option value="">{placeholder ?? "Choose…"}</option>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    </FieldShell>
  );
});

/** Radio group rendered as large, tappable choice tiles. */
export function ChoiceGroup({
  legend,
  hint,
  error,
  name,
  options,
  value,
  onChange,
  columns = 3,
}: {
  legend: ReactNode;
  hint?: ReactNode;
  error?: string;
  name: string;
  options: readonly { value: string; label: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
  columns?: 2 | 3;
}) {
  const id = useId();
  return (
    <fieldset aria-describedby={describedBy(id, hint)} aria-invalid={error ? true : undefined}>
      <legend className="text-[0.95rem] text-ivory">{legend}</legend>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ash">
          {hint}
        </p>
      ) : null}
      <div className={`mt-4 grid gap-2 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}>
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={`relative flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
                checked ? "border-gold bg-gold/10 text-ivory" : "border-line-strong text-bone hover:border-ash"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${checked ? "border-gold" : "border-ash"}`}
              >
                {checked && <span className="h-2 w-2 rounded-full bg-gold" />}
              </span>
              {o.label}
            </label>
          );
        })}
      </div>
      <p id={`${id}-error`} role={error ? "alert" : undefined} className="mt-2 min-h-[1.25rem] text-sm text-crimson-lit">
        {error ?? ""}
      </p>
    </fieldset>
  );
}

/** Multi-select chips (checkboxes). */
export function ChipGroup({
  legend,
  hint,
  error,
  options,
  value,
  onChange,
  max,
}: {
  legend: ReactNode;
  hint?: ReactNode;
  error?: string;
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const id = useId();
  return (
    <fieldset aria-describedby={describedBy(id, hint)}>
      <legend className="text-[0.95rem] text-ivory">{legend}</legend>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ash">
          {hint}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = value.includes(o);
          const disabled = !checked && max !== undefined && value.length >= max;
          return (
            <label
              key={o}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
                checked
                  ? "border-ivory bg-ivory text-ink"
                  : disabled
                    ? "cursor-not-allowed border-line text-smoke"
                    : "border-line-strong text-bone hover:border-ash"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(checked ? value.filter((v) => v !== o) : [...value, o])}
              />
              {o}
            </label>
          );
        })}
      </div>
      <p id={`${id}-error`} role={error ? "alert" : undefined} className="mt-2 min-h-[1.25rem] text-sm text-crimson-lit">
        {error ?? ""}
      </p>
    </fieldset>
  );
}

export const Checkbox = forwardRef<HTMLInputElement, { label: ReactNode; error?: string } & InputHTMLAttributes<HTMLInputElement>>(
  function Checkbox({ label, error, id: idProp, ...rest }, ref) {
    const auto = useId();
    const id = idProp ?? auto;
    return (
      <div>
        <div className="flex items-start gap-4">
          <span className="relative mt-0.5 flex h-5 w-5 shrink-0">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              aria-invalid={error ? true : undefined}
              aria-describedby={`${id}-error`}
              className="peer h-5 w-5 cursor-pointer appearance-none border border-ash bg-transparent transition-colors checked:border-gold checked:bg-gold aria-[invalid=true]:border-crimson-lit"
              {...rest}
            />
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="pointer-events-none absolute inset-0 m-auto hidden h-3.5 w-3.5 text-ink peer-checked:block"
            >
              <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <label htmlFor={id} className="cursor-pointer text-[0.95rem] leading-relaxed text-bone">
            {label}
          </label>
        </div>
        <p id={`${id}-error`} role={error ? "alert" : undefined} className="ml-9 mt-1 min-h-[1.25rem] text-sm text-crimson-lit">
          {error ?? ""}
        </p>
      </div>
    );
  },
);
