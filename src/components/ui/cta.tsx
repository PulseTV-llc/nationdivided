"use client";

import Link from "next/link";
import { useRef, type ReactNode, type PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";

type Variant = "solid" | "outline" | "ghost";

/**
 * Magnetic call-to-action. The label drifts toward the pointer on fine
 * pointers; keyboard and touch users get a plain, fully accessible link.
 */
export function Cta({
  href,
  children,
  variant = "solid",
  className = "",
  icon = true,
  cursor,
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: boolean;
  cursor?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  const move = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || document.documentElement.dataset.motion === "reduced") return;
    const el = ref.current!;
    const b = el.getBoundingClientRect();
    const x = (e.clientX - (b.left + b.width / 2)) / b.width;
    const y = (e.clientY - (b.top + b.height / 2)) / b.height;
    el.style.transform = `translate3d(${x * 10}px, ${y * 10}px, 0)`;
    inner.current!.style.transform = `translate3d(${x * 6}px, ${y * 5}px, 0)`;
  };
  const leave = () => {
    ref.current!.style.transform = "";
    inner.current!.style.transform = "";
  };

  const styles: Record<Variant, string> = {
    solid: "bg-ivory text-ink hover:bg-gold",
    outline: "border border-ivory/40 text-ivory hover:border-gold hover:text-gold",
    ghost: "text-ivory hover:text-gold",
  };

  const external = /^https?:/.test(href);
  const Comp = external ? "a" : Link;

  return (
    <Comp
      ref={ref}
      href={href}
      onPointerMove={move}
      onPointerLeave={leave}
      onClick={onClick}
      data-cursor={cursor}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden whitespace-nowrap rounded-full px-6 py-3.5 text-[0.75rem] font-medium uppercase tracking-[0.14em] sm:px-7 sm:tracking-[0.2em] transition-[background-color,color,border-color,transform] duration-500 ease-[var(--ease-out-expo)] ${styles[variant]} ${className}`}
    >
      <span ref={inner} className="relative inline-flex items-center gap-3 transition-transform duration-500 ease-[var(--ease-out-expo)]">
        <span className="relative block overflow-hidden">
          <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">
            {children}
          </span>
          <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0">
            {children}
          </span>
        </span>
        {icon && (
          <ArrowUpRight
            aria-hidden
            className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45"
            strokeWidth={1.5}
          />
        )}
      </span>
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </Comp>
  );
}
