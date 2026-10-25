import { STATUS_LABELS, type ApplicationStatus } from "@/lib/validation/casting";

/**
 * Deliberately neutral: no red/blue coding. Gold marks "Selected" only;
 * every other status shares the same quiet treatment.
 */
export function StatusPill({ status }: { status: ApplicationStatus }) {
  const tone =
    status === "selected"
      ? "border-gold/60 text-gold"
      : status === "new"
        ? "border-line-strong text-ivory"
        : "border-line text-ash";
  return (
    <span className={`label inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 ${tone}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function RetentionBadge() {
  return (
    <span
      className="label inline-flex items-center whitespace-nowrap rounded-full border border-dashed border-line-strong px-2.5 py-1 text-bone"
      title="Not selected and older than the retention period — eligible for purge"
    >
      Past retention
    </span>
  );
}
