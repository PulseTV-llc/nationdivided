import { z } from "zod";
import {
  COMFORT_OPTIONS,
  FEELING_OPTIONS,
  INTRO_OPTIONS,
  ISSUE_OPTIONS,
  US_STATES,
  VIDEO_LIMITS,
  VOTE_OPTIONS,
} from "@/content/casting";

/**
 * Casting application schema — shared by the browser form (per-step
 * validation) and the API route (authoritative validation).
 */

const values = <T extends readonly { value: string }[]>(opts: T) =>
  opts.map((o) => o.value) as unknown as [T[number]["value"], ...T[number]["value"][]];

const text = (max: number) => z.string().trim().max(max, { error: `Please keep this under ${max} characters.` });
const required = (max: number, min = 1, msg = "This field is required.") =>
  text(max).min(min, { error: min > 1 ? `Please write at least ${min} characters.` : msg });

const phoneRe = /^[+()\-.\s\d]{7,32}$/;

export const aboutSchema = z.object({
  fullName: required(120, 2, "Please enter your full name."),
  preferredName: text(60).optional().default(""),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email({ error: "Please enter a valid email address." })),
  phone: z
    .string()
    .trim()
    .regex(phoneRe, { error: "Please enter a valid phone number." })
    .refine((v) => v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 15, {
      error: "Please enter a valid phone number.",
    }),
  isAdult: z.literal(true, { error: "You must be 18 or older to apply." }),
  city: required(80, 2, "Please enter your city or town."),
  state: z.enum(US_STATES, { error: "Please choose your state or territory." }),
});

export const experienceSchema = z.object({
  votedTrump2024: z.enum(values(VOTE_OPTIONS), { error: "Please choose an answer." }),
  feeling: z.enum(values(FEELING_OPTIONS), { error: "Please choose the closest answer." }),
  feelingDetail: text(2000).optional().default(""),
  issues: z
    .array(z.enum(ISSUE_OPTIONS))
    .min(1, { error: "Choose at least one issue." })
    .max(6, { error: "Choose up to six issues." }),
  issuesOther: text(200).optional().default(""),
  hopedChange: required(2000, 10),
  viewsEvolved: text(2000).optional().default(""),
});

export const storySchema = z.object({
  aboutYou: required(4000, 40),
  normalDay: required(3000, 20),
  whyDocument: required(3000, 20),
  lifeChanges: text(3000).optional().default(""),
  comfortableOnCamera: z.enum(values(COMFORT_OPTIONS), { error: "Please choose an answer." }),
  openToIntroductions: z.enum(values(INTRO_OPTIONS), { error: "Please choose an answer." }),
});

export const videoSchema = z.object({
  video: z
    .object({
      key: z.string().regex(/^casting\/pending\/[0-9a-f-]{36}\.(mp4|mov|webm|m4v)$/, { error: "Invalid upload reference." }),
      contentType: z.enum(Object.keys(VIDEO_LIMITS.types) as [string, ...string[]]),
      size: z.number().int().positive().max(VIDEO_LIMITS.maxBytes),
      fileName: text(200).optional().default(""),
    })
    .nullable()
    .default(null),
});

export const consentSchema = z.object({
  privacyAck: z.literal(true, { error: "Please confirm you've read the privacy notice." }),
  contactConsent: z.literal(true, { error: "We need your permission to contact you about casting." }),
  noFilmingPermissionAck: z.literal(true, { error: "Please confirm you understand this." }),
  releasesAck: z.literal(true, { error: "Please confirm you understand this." }),
});

export const metaSchema = z.object({
  /** Honeypot — real people never see or fill this field. */
  website: z.string().max(0).optional().default(""),
  /** Epoch ms when the form was opened, used as a weak bot signal. */
  startedAt: z.number().int().positive(),
  turnstileToken: z.string().max(4096).optional().default(""),
});

export const castingApplicationSchema = aboutSchema
  .extend(experienceSchema.shape)
  .extend(storySchema.shape)
  .extend(videoSchema.shape)
  .extend(consentSchema.shape)
  .extend(metaSchema.shape);

export type CastingApplicationInput = z.input<typeof castingApplicationSchema>;
export type CastingApplication = z.output<typeof castingApplicationSchema>;

export const stepSchemas = [aboutSchema, experienceSchema, storySchema, videoSchema, consentSchema] as const;

export const uploadRequestSchema = z.object({
  contentType: z.enum(Object.keys(VIDEO_LIMITS.types) as [string, ...string[]], {
    error: `Please upload ${VIDEO_LIMITS.typesLabel}.`,
  }),
  size: z
    .number()
    .int()
    .positive()
    .max(VIDEO_LIMITS.maxBytes, { error: `Videos must be ${VIDEO_LIMITS.maxLabel} or smaller.` }),
});

export const pressInquirySchema = z.object({
  name: required(120, 2, "Please enter your name."),
  outlet: required(160, 2, "Please enter your outlet or organization."),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email({ error: "Please enter a valid email address." })),
  kind: z.enum(["interview", "screener", "festival", "podcast", "imagery", "other"], {
    error: "Please choose a request type.",
  }),
  deadline: text(80).optional().default(""),
  message: required(4000, 20),
  website: z.string().max(0).optional().default(""),
  startedAt: z.number().int().positive(),
  turnstileToken: z.string().max(4096).optional().default(""),
});
export type PressInquiryInput = z.input<typeof pressInquirySchema>;

export const STATUS_VALUES = [
  "new",
  "under_review",
  "contacted",
  "interview_scheduled",
  "selected",
  "not_selected",
] as const;
export type ApplicationStatus = (typeof STATUS_VALUES)[number];
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New",
  under_review: "Under Review",
  contacted: "Contacted",
  interview_scheduled: "Interview Scheduled",
  selected: "Selected",
  not_selected: "Not Selected",
};
