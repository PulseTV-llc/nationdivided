"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm, type FieldPath, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import {
  COMFORT_OPTIONS,
  FEELING_OPTIONS,
  INTRO_OPTIONS,
  ISSUE_OPTIONS,
  US_STATES,
  VOTE_OPTIONS,
} from "@/content/casting";
import { site } from "@/content/site";
import { castingApplicationSchema } from "@/lib/validation/casting";
import { Checkbox, ChipGroup, ChoiceGroup, SelectField, TextArea, TextField } from "@/components/forms/fields";
import { Turnstile, TURNSTILE_SITE_KEY } from "@/components/forms/turnstile";
import { VideoUpload, type UploadedVideo } from "./video-upload";

type FormValues = {
  fullName: string;
  preferredName: string;
  email: string;
  phone: string;
  isAdult: boolean;
  city: string;
  state: string;
  votedTrump2024: string;
  feeling: string;
  feelingDetail: string;
  issues: string[];
  issuesOther: string;
  hopedChange: string;
  viewsEvolved: string;
  aboutYou: string;
  normalDay: string;
  whyDocument: string;
  lifeChanges: string;
  comfortableOnCamera: string;
  openToIntroductions: string;
  video: UploadedVideo | null;
  privacyAck: boolean;
  contactConsent: boolean;
  noFilmingPermissionAck: boolean;
  releasesAck: boolean;
  website: string;
  startedAt: number;
  turnstileToken: string;
};

const DEFAULTS: FormValues = {
  fullName: "",
  preferredName: "",
  email: "",
  phone: "",
  isAdult: false,
  city: "",
  state: "",
  votedTrump2024: "",
  feeling: "",
  feelingDetail: "",
  issues: [],
  issuesOther: "",
  hopedChange: "",
  viewsEvolved: "",
  aboutYou: "",
  normalDay: "",
  whyDocument: "",
  lifeChanges: "",
  comfortableOnCamera: "",
  openToIntroductions: "",
  video: null,
  privacyAck: false,
  contactConsent: false,
  noFilmingPermissionAck: false,
  releasesAck: false,
  website: "",
  startedAt: 0,
  turnstileToken: "",
};

const STEPS: { title: string; kicker: string; fields: FieldPath<FormValues>[] }[] = [
  { title: "About you", kicker: "The basics", fields: ["fullName", "preferredName", "email", "phone", "isAdult", "city", "state"] },
  {
    title: "Your experience",
    kicker: "Your vote and since",
    fields: ["votedTrump2024", "feeling", "feelingDetail", "issues", "issuesOther", "hopedChange", "viewsEvolved"],
  },
  {
    title: "Your story",
    kicker: "Your everyday life",
    fields: ["aboutYou", "normalDay", "whyDocument", "lifeChanges", "comfortableOnCamera", "openToIntroductions"],
  },
  { title: "Introduce yourself", kicker: "Optional video", fields: ["video"] },
  { title: "Review & submit", kicker: "Check and confirm", fields: ["privacyAck", "contactConsent", "noFilmingPermissionAck", "releasesAck"] },
];

const DRAFT_KEY = "nd-casting-draft";
const labelOf = (opts: readonly { value: string; label: string }[], v: string) => opts.find((o) => o.value === v)?.label ?? "—";

export function ApplicationForm({ uploadsEnabled }: { uploadsEnabled: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const restored = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    setError,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: DEFAULTS,
    resolver: zodResolver(castingApplicationSchema) as unknown as Resolver<FormValues>,
    mode: "onTouched",
    shouldFocusError: true,
  });

  // Restore an unsent draft from this tab (sessionStorage clears when the tab closes).
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    let draft: Partial<FormValues> = {};
    try {
      draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "{}");
    } catch {}
    reset({ ...DEFAULTS, ...draft, video: null, turnstileToken: "", website: "", startedAt: draft.startedAt || Date.now() });
  }, [reset]);

  // Save the draft as they type (never the video or bot-check token).
  useEffect(() => {
    let t = 0;
    const sub = watch((values) => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        try {
          const { video: _v, turnstileToken: _t, website: _w, ...rest } = values as FormValues;
          void _v;
          void _t;
          void _w;
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
        } catch {}
      }, 400);
    });
    return () => {
      sub.unsubscribe();
      window.clearTimeout(t);
    };
  }, [watch]);

  const go = useCallback((next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    setServerError(null);
    window.__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo({ top: 0 });
  }, [step]);

  // Move focus to the new step's heading so screen readers announce it.
  useEffect(() => {
    const id = window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 80);
    return () => window.clearTimeout(id);
  }, [step]);

  const next = async () => {
    const ok = await trigger(STEPS[step].fields, { shouldFocus: true });
    if (ok) go(step + 1);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/casting/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const fe = (data.fieldErrors ?? {}) as Record<string, string>;
        let first = -1;
        for (const [k, msg] of Object.entries(fe)) {
          if (k in DEFAULTS) {
            setError(k as FieldPath<FormValues>, { message: msg });
            const s = STEPS.findIndex((st) => st.fields.includes(k as FieldPath<FormValues>));
            if (s >= 0 && (first < 0 || s < first)) first = s;
          }
        }
        setServerError(data.error || "Something went wrong. Please try again.");
        if (first >= 0 && first !== step) go(first);
        return;
      }
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      router.push(`/casting/thank-you?ref=${encodeURIComponent(data.reference)}${data.emailSent ? "&email=1" : ""}`);
    } catch {
      setServerError("We couldn't reach the server. Check your connection and try again — nothing was submitted.");
    } finally {
      setSubmitting(false);
    }
  });

  const v = watch();
  const progress = (step + 1) / STEPS.length;

  return (
    <MotionConfig reducedMotion="user">
      <form onSubmit={onSubmit} noValidate className="relative grid gap-12 lg:grid-cols-12" aria-describedby="form-privacy">
        {/* Honeypot: hidden from people and assistive tech. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" {...register("website")} />
          </label>
        </div>

        {/* Progress rail */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
            <div className="mb-6 h-px w-full bg-line" aria-hidden>
              <div
                className="h-px origin-left bg-gold transition-transform duration-700 ease-[var(--ease-out-expo)]"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
            <p className="label mb-6 text-ash" aria-live="polite">
              Step {step + 1} of {STEPS.length}
            </p>
            <ol className="hidden space-y-1 lg:block">
              {STEPS.map((s, i) => {
                const state = i === step ? "current" : i < step ? "done" : "todo";
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      disabled={i > step}
                      onClick={() => go(i)}
                      aria-current={state === "current" ? "step" : undefined}
                      className="group flex min-h-12 w-full items-center gap-5 text-left disabled:cursor-default"
                    >
                      <span
                        className={`display w-10 text-3xl transition-colors ${
                          state === "current" ? "text-gold" : state === "done" ? "text-ivory" : "text-smoke"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className={`block text-sm ${state === "todo" ? "text-smoke" : "text-ivory"}`}>{s.title}</span>
                        <span className="label text-[0.6rem] text-ash">{state === "done" ? "Complete · Edit" : s.kicker}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p id="form-privacy" className="mt-10 flex gap-3 border-t border-line pt-6 text-sm leading-relaxed text-ash">
              <Lock aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
              <span>
                Your answers are private and only seen by the StockHouse Films casting team. Unsent answers stay in this browser
                tab until you submit or close it.
              </span>
            </p>
          </div>
        </aside>

        {/* Step content */}
        <div className="min-h-[60vh] lg:col-span-8">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.section
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: dir * -40, filter: "blur(6px)" }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              aria-labelledby={`step-${step}-title`}
            >
              <p className="label mb-4 text-gold">
                {String(step + 1).padStart(2, "0")} — {STEPS[step].kicker}
              </p>
              <h2
                id={`step-${step}-title`}
                ref={headingRef}
                tabIndex={-1}
                className="display mb-12 text-[clamp(2.8rem,6vw,5.5rem)] outline-none"
              >
                {STEPS[step].title}
              </h2>

              {step === 0 && (
                <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
                  <TextField label="Full name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
                  <TextField
                    label="Preferred name"
                    optional
                    autoComplete="nickname"
                    hint="What should we call you?"
                    error={errors.preferredName?.message}
                    {...register("preferredName")}
                  />
                  <TextField
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                  <TextField
                    label="Phone number"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    hint="Only used to talk to you about casting."
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                  <TextField label="City or town" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
                  <SelectField
                    label="State or territory"
                    autoComplete="address-level1"
                    options={US_STATES}
                    error={errors.state?.message}
                    {...register("state")}
                  />
                  <div className="md:col-span-2">
                    <Checkbox label="I confirm I am 18 years of age or older." error={errors.isAdult?.message} {...register("isAdult")} />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-10">
                  <Controller
                    control={control}
                    name="votedTrump2024"
                    render={({ field }) => (
                      <ChoiceGroup
                        legend="Did you vote for Donald Trump in the 2024 presidential election?"
                        hint="This is the current casting focus. Your answer is private."
                        name={field.name}
                        options={VOTE_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.votedTrump2024?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="feeling"
                    render={({ field }) => (
                      <ChoiceGroup
                        legend="How do you feel about the direction of the country today?"
                        hint="There's no right answer. Choose whatever is closest."
                        name={field.name}
                        options={FEELING_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.feeling?.message}
                      />
                    )}
                  />
                  <TextArea
                    label="Anything you'd like to add about that?"
                    optional
                    maxLength={2000}
                    length={v.feelingDetail?.length ?? 0}
                    rows={3}
                    error={errors.feelingDetail?.message}
                    {...register("feelingDetail")}
                  />
                  <Controller
                    control={control}
                    name="issues"
                    render={({ field }) => (
                      <ChipGroup
                        legend="Which issues mattered most to you?"
                        hint="Choose up to six."
                        options={ISSUE_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        max={6}
                        error={errors.issues?.message}
                      />
                    )}
                  />
                  {v.issues?.includes("Something else") && (
                    <TextField label="What else mattered?" optional error={errors.issuesOther?.message} {...register("issuesOther")} />
                  )}
                  <TextArea
                    label="What did you hope would change?"
                    hint="For the country, your community, or your own life."
                    maxLength={2000}
                    length={v.hopedChange?.length ?? 0}
                    error={errors.hopedChange?.message}
                    {...register("hopedChange")}
                  />
                  <TextArea
                    label="How have your views evolved since the election, if at all?"
                    optional
                    hint="It's completely fine if they haven't."
                    maxLength={2000}
                    length={v.viewsEvolved?.length ?? 0}
                    error={errors.viewsEvolved?.message}
                    {...register("viewsEvolved")}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10">
                  <TextArea
                    label="Tell us about yourself."
                    hint="Where you live, what you do, who matters to you. Write as much or as little as you like."
                    maxLength={4000}
                    length={v.aboutYou?.length ?? 0}
                    rows={6}
                    error={errors.aboutYou?.message}
                    {...register("aboutYou")}
                  />
                  <TextArea
                    label="What does a normal day look like for you?"
                    maxLength={3000}
                    length={v.normalDay?.length ?? 0}
                    error={errors.normalDay?.message}
                    {...register("normalDay")}
                  />
                  <TextArea
                    label="What makes your experience worth documenting?"
                    maxLength={3000}
                    length={v.whyDocument?.length ?? 0}
                    error={errors.whyDocument?.message}
                    {...register("whyDocument")}
                  />
                  <TextArea
                    label="Has anything significant changed in your life since the election?"
                    optional
                    hint="Please don't include anything you wouldn't want our casting team to read."
                    maxLength={3000}
                    length={v.lifeChanges?.length ?? 0}
                    error={errors.lifeChanges?.message}
                    {...register("lifeChanges")}
                  />
                  <Controller
                    control={control}
                    name="comfortableOnCamera"
                    render={({ field }) => (
                      <ChoiceGroup
                        legend="Would you feel comfortable discussing your experiences on camera?"
                        name={field.name}
                        options={COMFORT_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.comfortableOnCamera?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="openToIntroductions"
                    render={({ field }) => (
                      <ChoiceGroup
                        legend="Would you be open to introducing us to friends or family who might be willing to take part?"
                        hint="Only people who agree would ever be contacted or filmed."
                        name={field.name}
                        options={INTRO_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.openToIntroductions?.message}
                      />
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="max-w-2xl space-y-4 text-bone">
                    <p className="editorial text-3xl italic leading-tight text-ivory">This step is optional.</p>
                    <p className="leading-relaxed">
                      A short video of you talking about yourself helps us get to know you. It doesn&rsquo;t need to be polished — a
                      phone held at arm&rsquo;s length is perfect. Applications without video are read just as carefully.
                    </p>
                  </div>
                  {uploadsEnabled ? (
                    <Controller
                      control={control}
                      name="video"
                      render={({ field }) => (
                        <VideoUpload value={field.value} onChange={field.onChange} error={errors.video?.message} />
                      )}
                    />
                  ) : (
                    <p className="border border-line-strong p-6 text-bone">
                      Video uploads aren&rsquo;t available at the moment. Please continue without one — if we&rsquo;d like to see
                      a video, we&rsquo;ll ask.
                    </p>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-12">
                  <Summary values={v} onEdit={go} />

                  <fieldset className="space-y-2 border-t border-line pt-10">
                    <legend className="label mb-6 text-gold">Please confirm</legend>
                    <Checkbox
                      label={
                        <>
                          I&rsquo;ve read the{" "}
                          <Link href="/privacy" target="_blank" className="text-ivory underline underline-offset-4">
                            privacy notice
                            <span className="sr-only"> (opens in a new tab)</span>
                          </Link>{" "}
                          and understand how my application will be stored and used.
                        </>
                      }
                      error={errors.privacyAck?.message}
                      {...register("privacyAck")}
                    />
                    <Checkbox
                      label="StockHouse Films may contact me by email or phone about casting for Nation Divided."
                      error={errors.contactConsent?.message}
                      {...register("contactConsent")}
                    />
                    <Checkbox
                      label="I understand that applying does not give StockHouse Films permission to film me or to publish my name, image, voice or likeness."
                      error={errors.noFilmingPermissionAck?.message}
                      {...register("noFilmingPermissionAck")}
                    />
                    <Checkbox
                      label="I understand that applying doesn't guarantee selection, and that any filming would require a separate conversation and signed release forms."
                      error={errors.releasesAck?.message}
                      {...register("releasesAck")}
                    />
                  </fieldset>

                  {TURNSTILE_SITE_KEY && (
                    <div>
                      <Turnstile onToken={(t) => setValue("turnstileToken", t)} />
                      {errors.turnstileToken?.message && (
                        <p role="alert" className="mt-2 text-sm text-crimson-lit">
                          {errors.turnstileToken.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          </AnimatePresence>

          {serverError && (
            <div role="alert" className="mt-10 border-l-2 border-crimson-lit bg-crimson/10 px-5 py-4 text-ivory">
              {serverError}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-14 flex items-center justify-between gap-4 border-t border-line pt-8">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => go(step - 1)}
                className="label inline-flex min-h-12 items-center gap-3 px-1 text-ash transition-colors hover:text-ivory"
              >
                <ArrowLeft aria-hidden className="h-4 w-4" /> Back
              </button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="label inline-flex min-h-12 items-center gap-3 rounded-full bg-ivory px-8 text-ink transition-colors hover:bg-gold"
              >
                {step === 3 && !getValues("video") ? "Continue without video" : "Continue"}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="label inline-flex min-h-12 items-center gap-3 rounded-full bg-gold px-8 text-ink transition-colors hover:bg-ivory disabled:opacity-60"
              >
                {submitting ? "Sending securely…" : "Submit application"}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-6 text-sm text-ash">
            Trouble with the form? Email{" "}
            <a className="text-bone underline underline-offset-4" href={`mailto:${site.contact.casting}`}>
              {site.contact.casting}
            </a>
            .
          </p>
        </div>
      </form>
    </MotionConfig>
  );
}

function Summary({ values: v, onEdit }: { values: FormValues; onEdit: (step: number) => void }) {
  const sections: { step: number; title: string; rows: [string, string][] }[] = [
    {
      step: 0,
      title: "About you",
      rows: [
        ["Name", v.fullName + (v.preferredName ? ` (${v.preferredName})` : "")],
        ["Email", v.email],
        ["Phone", v.phone],
        ["Location", [v.city, v.state].filter(Boolean).join(", ")],
        ["18 or older", v.isAdult ? "Yes" : "—"],
      ],
    },
    {
      step: 1,
      title: "Your experience",
      rows: [
        ["Voted for Donald Trump in 2024", labelOf(VOTE_OPTIONS, v.votedTrump2024)],
        ["Direction of the country", labelOf(FEELING_OPTIONS, v.feeling)],
        ["More on that", v.feelingDetail],
        ["Issues", [...v.issues, v.issuesOther].filter(Boolean).join(", ")],
        ["Hoped would change", v.hopedChange],
        ["How views evolved", v.viewsEvolved],
      ],
    },
    {
      step: 2,
      title: "Your story",
      rows: [
        ["About you", v.aboutYou],
        ["A normal day", v.normalDay],
        ["Why document it", v.whyDocument],
        ["Changes since the election", v.lifeChanges],
        ["Comfortable on camera", labelOf(COMFORT_OPTIONS, v.comfortableOnCamera)],
        ["Introductions to friends/family", labelOf(INTRO_OPTIONS, v.openToIntroductions)],
      ],
    },
    { step: 3, title: "Video", rows: [["Introduction video", v.video ? v.video.fileName : "None — that's fine"]] },
  ];

  return (
    <div className="space-y-10">
      {sections.map((s) => (
        <section key={s.title} aria-label={s.title} className="border-t border-line pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="label text-ivory">{s.title}</h3>
            <button
              type="button"
              onClick={() => onEdit(s.step)}
              className="label min-h-11 px-2 text-gold underline-offset-4 hover:underline"
            >
              Edit<span className="sr-only"> {s.title}</span>
            </button>
          </div>
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[13rem_1fr]">
            {s.rows.map(([k, val]) => (
              <div key={k} className="contents">
                <dt className="text-sm text-ash">{k}</dt>
                <dd className="whitespace-pre-wrap break-words text-bone">{val || <span className="text-smoke">—</span>}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
