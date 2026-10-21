import { ArrowUpRightIcon, ClockIcon } from "lucide-react";
import Link from "next/link";

import { CASE_CATEGORY_LABELS } from "@/lib/db/enums";
import type { GuideFrontmatter } from "@/lib/guides";
import { cn } from "@/lib/utils";

export function formatGuideDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Card for a pathway guide. `showUrdu` renders the Urdu summary inside a toggle group. */
export function GuideCard({
  guide,
  showUrdu = false,
  className,
}: {
  guide: GuideFrontmatter;
  showUrdu?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-xl border bg-card p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_32px_-16px_rgb(15_61_46/0.25)]",
        className,
      )}
    >
      <p className="text-xs font-semibold tracking-[0.14em] text-highlight uppercase">
        {CASE_CATEGORY_LABELS[guide.category]}
      </p>
      <h3 className="mt-3 font-display text-xl leading-snug font-medium text-primary">
        <Link
          href={`/guides/${guide.slug}`}
          className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {guide.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{guide.summary}</p>
      {showUrdu && guide.summaryUrdu ? (
        <p
          lang="ur"
          dir="rtl"
          className="mt-4 hidden border-t pt-4 font-urdu text-base leading-[2.2] text-foreground/85 group-data-[urdu=on]/urdu:block"
        >
          {guide.summaryUrdu}
        </p>
      ) : null}
      <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon className="size-3.5" aria-hidden="true" />
          {guide.readingMinutes} min read
        </span>
        <ArrowUpRightIcon
          className="size-4 text-primary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </div>
    </article>
  );
}
