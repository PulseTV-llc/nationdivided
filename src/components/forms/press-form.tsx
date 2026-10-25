"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pressInquirySchema } from "@/lib/validation/casting";
import { SelectField, TextArea, TextField } from "./fields";
import { Turnstile, TURNSTILE_SITE_KEY } from "./turnstile";

type Values = {
  name: string;
  outlet: string;
  email: string;
  kind: string;
  deadline: string;
  message: string;
  website: string;
  startedAt: number;
  turnstileToken: string;
};

const KINDS = [
  { value: "interview", label: "Interview request" },
  { value: "screener", label: "Screener request" },
  { value: "festival", label: "Festival programming" },
  { value: "podcast", label: "Podcast / broadcast" },
  { value: "imagery", label: "Images & assets" },
  { value: "other", label: "Something else" },
];

export function PressForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, setError: setFieldError, formState } = useForm<Values>({
    defaultValues: { name: "", outlet: "", email: "", kind: "", deadline: "", message: "", website: "", startedAt: 0, turnstileToken: "" },
    resolver: zodResolver(pressInquirySchema) as unknown as Resolver<Values>,
    mode: "onTouched",
  });
  const e = formState.errors;

  useEffect(() => setValue("startedAt", Date.now()), [setValue]);

  const submit = handleSubmit(async (values) => {
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/press", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        Object.entries((data.fieldErrors ?? {}) as Record<string, string>).forEach(([k, m]) =>
          setFieldError(k as keyof Values, { message: m }),
        );
        setError(data.error || "Something went wrong.");
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setError("We couldn't reach the server. Nothing was sent — please try again.");
      setStatus("idle");
    }
  });

  if (status === "sent") {
    return (
      <div role="status" className="border border-gold/50 p-8">
        <p className="label mb-3 text-gold">Message received</p>
        <p className="editorial text-3xl italic">Thank you. Our press team will be in touch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-x-10 gap-y-2 md:grid-cols-2">
      <div aria-hidden className="absolute -left-[9999px]">
        <input tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <TextField label="Your name" autoComplete="name" error={e.name?.message} {...register("name")} />
      <TextField label="Outlet or organization" autoComplete="organization" error={e.outlet?.message} {...register("outlet")} />
      <TextField label="Email" type="email" autoComplete="email" error={e.email?.message} {...register("email")} />
      <SelectField label="Request type" options={KINDS} error={e.kind?.message} {...register("kind")} />
      <TextField label="Deadline" optional placeholder="e.g. Friday 5pm ET" error={e.deadline?.message} {...register("deadline")} className="md:col-span-2" />
      <TextArea
        label="Message"
        maxLength={4000}
        length={watch("message")?.length ?? 0}
        error={e.message?.message}
        className="md:col-span-2"
        {...register("message")}
      />
      {TURNSTILE_SITE_KEY && (
        <div className="md:col-span-2">
          <Turnstile onToken={(t) => setValue("turnstileToken", t)} />
        </div>
      )}
      {error && (
        <p role="alert" className="border-l-2 border-crimson-lit bg-crimson/10 px-4 py-3 text-ivory md:col-span-2">
          {error}
        </p>
      )}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="label mt-4 inline-flex min-h-12 items-center rounded-full bg-ivory px-8 text-ink transition-colors hover:bg-gold disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
