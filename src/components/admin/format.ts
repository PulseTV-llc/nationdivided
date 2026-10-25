import { COMFORT_OPTIONS, FEELING_OPTIONS, INTRO_OPTIONS, VOTE_OPTIONS } from "@/content/casting";

/**
 * Display helpers for the admin. Dates are rendered on the server in a single
 * fixed time zone so every staff member sees the same timestamp.
 */
export const ADMIN_TIME_ZONE = "America/New_York";
export const ADMIN_TIME_ZONE_LABEL = "ET";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: ADMIN_TIME_ZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: ADMIN_TIME_ZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const formatDate = (d: Date) => dateFmt.format(d);
export const formatDateTime = (d: Date) => `${dateTimeFmt.format(d)} ${ADMIN_TIME_ZONE_LABEL}`;

type Option = { readonly value: string; readonly label: string };
const labeler = (opts: readonly Option[]) => (value: string | null | undefined) =>
  value ? (opts.find((o) => o.value === value)?.label ?? value) : "—";

export const voteLabel = labeler(VOTE_OPTIONS);
export const feelingLabel = labeler(FEELING_OPTIONS);
export const comfortLabel = labeler(COMFORT_OPTIONS);
export const introLabel = labeler(INTRO_OPTIONS);

export function formatBytes(n: number | null | undefined) {
  if (!n) return "—";
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
