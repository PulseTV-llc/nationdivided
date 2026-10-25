/**
 * The NATION DIVIDED wordmark: the title cut horizontally, the lower half
 * nudged off-register, with a hairline seam between them.
 */
export function Wordmark({ className = "", seam = true }: { className?: string; seam?: boolean }) {
  return (
    <span className={`display relative inline-flex w-fit select-none flex-col leading-[0.82] ${className}`} role="img" aria-label="Nation Divided">
      <span aria-hidden className="relative block">
        <span className="block [clip-path:inset(0_0_50%_0)]">Nation</span>
        <span className="absolute inset-0 block translate-x-[0.04em] [clip-path:inset(50%_0_0_0)]">Nation</span>
      </span>
      <span aria-hidden className="relative block">
        <span className="block [clip-path:inset(0_0_50%_0)]">Divided</span>
        <span className="absolute inset-0 block -translate-x-[0.05em] text-ivory/80 [clip-path:inset(50%_0_0_0)]">Divided</span>
        {seam && <span className="absolute left-[-6%] right-[-6%] top-1/2 h-px bg-gold/70" />}
      </span>
    </span>
  );
}
