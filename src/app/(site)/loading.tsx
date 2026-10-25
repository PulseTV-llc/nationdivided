/** Shown while a route streams in: a film leader countdown. */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[100svh] items-center justify-center">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-ivory/20">
        <span aria-hidden className="absolute inset-0 animate-spin rounded-full border-t border-gold [animation-duration:1.4s]" />
        <span aria-hidden className="absolute left-1/2 top-0 h-full w-px bg-ivory/10" />
        <span aria-hidden className="absolute left-0 top-1/2 h-px w-full bg-ivory/10" />
        <span className="label text-ash">Loading</span>
      </div>
    </div>
  );
}
