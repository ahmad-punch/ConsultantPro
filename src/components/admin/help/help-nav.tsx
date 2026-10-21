import Link from "next/link";

import { ToneBadge, type Tone } from "@/components/admin/badges";
import type { HelpAudience, HelpNavGroup } from "@/lib/help";
import { cn } from "@/lib/utils";

const AUDIENCE_TONE: Record<HelpAudience, Tone> = {
  everyone: "primary",
  staff: "info",
  agents: "highlight",
};

const AUDIENCE_LABEL: Record<HelpAudience, string> = {
  everyone: "Everyone",
  staff: "Staff",
  agents: "Agents",
};

export function AudienceBadge({ audience }: { audience: HelpAudience }) {
  return <ToneBadge tone={AUDIENCE_TONE[audience]}>{AUDIENCE_LABEL[audience]}</ToneBadge>;
}

/** Grouped list of every help doc; `activeSlug` is highlighted. */
export function HelpNav({ groups, activeSlug }: { groups: HelpNavGroup[]; activeSlug?: string }) {
  return (
    <nav aria-label="Help pages" className="space-y-5">
      <Link
        href="/admin/help"
        className={cn(
          "block rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
          !activeSlug && "bg-muted font-medium text-foreground",
        )}
      >
        All help
      </Link>
      {groups.map((g) => (
        <div key={g.id}>
          <p className="mb-1 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{g.label}</p>
          <ul className="grid gap-0.5">
            {g.docs.map((d) => {
              const active = d.slug === activeSlug;
              return (
                <li key={d.slug}>
                  <Link
                    href={`/admin/help/${d.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-2 py-1 text-sm text-foreground/80 hover:bg-muted hover:text-foreground",
                      active && "bg-secondary font-medium text-secondary-foreground hover:bg-secondary",
                    )}
                  >
                    {d.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
