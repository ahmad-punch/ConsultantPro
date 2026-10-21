import Link from "next/link";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** The mark: a winding path inside a rounded square. Matches public/icon.svg. */
export function LogoMark({ className, invert = false }: { className?: string; invert?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={cn("size-8", className)}>
      <rect width="32" height="32" rx="8" fill={invert ? "var(--paper)" : "var(--primary)"} />
      <path
        d="M21.5 5.5c0 4.5-11 4.5-11 10s11 5.5 11 11"
        fill="none"
        stroke={invert ? "var(--primary)" : "var(--paper)"}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="21.5" cy="26.5" r="2.2" fill="var(--highlight)" />
    </svg>
  );
}

/** Wordmark: mark, name and the Urdu name. */
export function Logo({ invert = false }: { invert?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      aria-label={`${site.name} home`}
    >
      <LogoMark invert={invert} />
      <span className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-display text-2xl leading-none font-semibold tracking-tight",
            invert ? "text-primary-foreground" : "text-primary",
          )}
        >
          {site.name}
        </span>
        <span
          lang="ur"
          dir="rtl"
          className={cn(
            "font-urdu text-base leading-none",
            invert ? "text-primary-foreground/70" : "text-highlight",
          )}
        >
          {site.urduName}
        </span>
      </span>
    </Link>
  );
}
