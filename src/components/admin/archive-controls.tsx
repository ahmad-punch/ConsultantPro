import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react";
import Link from "next/link";

import { ActionButton, type FormAction } from "@/components/admin/action-form";
import { ToneBadge } from "@/components/admin/badges";
import { buildHref } from "@/components/admin/format";
import { cn } from "@/lib/utils";

/** Archive or Unarchive, depending on whether the row is archived. */
export function ArchiveButton({
  id,
  archivedAt,
  archive,
  unarchive,
  noun,
  size = "sm",
  iconOnly,
}: {
  id: string;
  archivedAt: Date | null;
  archive: FormAction;
  unarchive: FormAction;
  noun: string;
  size?: "sm" | "icon-sm";
  iconOnly?: boolean;
}) {
  if (archivedAt) {
    return (
      <ActionButton action={unarchive} fields={{ id }} icon={<ArchiveRestoreIcon />} size={size} variant="outline">
        {iconOnly ? <span className="sr-only">Unarchive {noun}</span> : "Unarchive"}
      </ActionButton>
    );
  }
  return (
    <ActionButton
      action={archive}
      fields={{ id }}
      icon={<ArchiveIcon />}
      size={size}
      variant={iconOnly ? "ghost" : "outline"}
      confirm={`Archive this ${noun}? It will be hidden from lists until you unarchive it.`}
    >
      {iconOnly ? <span className="sr-only">Archive {noun}</span> : "Archive"}
    </ActionButton>
  );
}

export function ArchivedBadge({ archivedAt }: { archivedAt: Date | null }) {
  if (!archivedAt) return null;
  return (
    <ToneBadge tone="neutral" className="ml-1.5 align-middle">
      Archived
    </ToneBadge>
  );
}

/** "Show archived" toggle that flips `?archived=1` while keeping other filters. */
export function ShowArchivedToggle({
  basePath,
  params,
  on,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  on: boolean;
}) {
  return (
    <Link
      href={buildHref(basePath, params, { archived: on ? undefined : "1" })}
      scroll={false}
      aria-pressed={on}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md border bg-card px-2.5 text-sm text-muted-foreground hover:bg-muted",
        on && "border-primary text-foreground",
      )}
    >
      <ArchiveIcon className="size-3.5" aria-hidden />
      {on ? "Hide archived" : "Show archived"}
    </Link>
  );
}
