import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import Link from "next/link";

import { buildHref } from "./format";

/** Column header link that toggles ?sort=&dir= in the URL. */
export function SortLink({
  label,
  sortKey,
  basePath,
  params,
  current,
  dir,
}: {
  label: string;
  sortKey: string;
  basePath: string;
  params: Record<string, string | undefined>;
  current: string;
  dir: "asc" | "desc";
}) {
  const active = current === sortKey;
  const nextDir = active && dir === "desc" ? "asc" : "desc";
  const Icon = !active ? ArrowUpDownIcon : dir === "asc" ? ArrowUpIcon : ArrowDownIcon;
  return (
    <Link
      href={buildHref(basePath, params, { sort: sortKey, dir: nextDir })}
      scroll={false}
      className="inline-flex items-center gap-1 hover:text-foreground"
      aria-label={`Sort by ${label}`}
    >
      {label}
      <Icon className={active ? "size-3.5" : "size-3.5 opacity-40"} aria-hidden />
    </Link>
  );
}
