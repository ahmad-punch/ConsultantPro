import Link from "next/link";

import { cn } from "@/lib/utils";

import { TONE_DOT, type Tone } from "./badges";

export function StatCard({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  tone?: Tone;
}) {
  const body = (
    <>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {tone ? <span className={cn("size-2 rounded-full", TONE_DOT[tone])} aria-hidden /> : null}
        {label}
      </div>
      <div className="mt-1.5 font-mono text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </>
  );
  const cls = "block rounded-xl border bg-card p-4 shadow-xs";
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:border-primary/30 hover:bg-card/70")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
