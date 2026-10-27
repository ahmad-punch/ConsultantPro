import { ExternalLinkIcon, PencilIcon } from "lucide-react";
import { Suspense } from "react";

import { ActionButton } from "@/components/admin/action-form";
import { ArchiveButton, ArchivedBadge, ShowArchivedToggle } from "@/components/admin/archive-controls";
import { ContentStatusBadge, ToneBadge } from "@/components/admin/badges";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { enumOptions, formatDate, formatShortDate } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { HelpButton } from "@/components/admin/help-button";
import { ContentForm, MarkPostedForm } from "@/components/admin/forms/content-form";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { archiveContentAction, setContentStatusAction, unarchiveContentAction } from "@/lib/actions/content";
import { requirePermission } from "@/lib/rbac";
import {
  CONTENT_FORMATS,
  CONTENT_FORMAT_LABELS,
  CONTENT_LANGUAGE_LABELS,
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  type ContentStatus,
} from "@/lib/db/enums";
import type { ContentItem } from "@/lib/db/schema";
import { listContent, readContentFilters } from "@/lib/queries/content";
import { addDays, startOfWeekUtc } from "@/lib/queries/time";

export const metadata = { title: "Content" };

const NEXT_STATUS: Partial<Record<ContentStatus, ContentStatus>> = { idea: "drafted", drafted: "approved" };

export default function ContentPage({ searchParams }: PageProps<"/admin/content">) {
  return (
    <>
      <PageHeader
        helpTopic="content"
        title="Content"
        description="Posts, scripts, guides, videos and emails, grouped by the week they are scheduled for."
        actions={
          <FormDialog triggerLabel="New item" title="New content item" wide>
            <ContentForm />
          </FormDialog>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <ContentCalendar searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ContentCalendar({ searchParams }: { searchParams: PageProps<"/admin/content">["searchParams"] }) {
  await requirePermission("content.view");
  const f = readContentFilters(await searchParams);
  const rows = await listContent(f);
  const now = new Date();
  const thisWeek = startOfWeekUtc(now).getTime();
  const values = { q: f.q, status: f.status, format: f.format, archived: f.archived ? "1" : undefined };

  const groups = new Map<string, { title: string; sort: number; items: ContentItem[] }>();
  for (const item of rows) {
    let key: string;
    let title: string;
    let sort: number;
    if (item.scheduledFor) {
      const week = startOfWeekUtc(item.scheduledFor);
      key = week.toISOString();
      sort = week.getTime();
      const label = `${formatShortDate(week)} - ${formatShortDate(addDays(week, 6))}`;
      title = week.getTime() === thisWeek ? `This week · ${label}` : `Week of ${label}`;
    } else {
      key = "unscheduled";
      title = "Unscheduled";
      sort = Number.MAX_SAFE_INTEGER;
    }
    const g = groups.get(key) ?? { title, sort, items: [] };
    g.items.push(item);
    groups.set(key, g);
  }
  const ordered = [...groups.values()].sort((a, b) => a.sort - b.sort);

  return (
    <>
      <div className="mb-3">
        <ShowArchivedToggle basePath="/admin/content" params={values} on={f.archived} />
      </div>
      <FilterBar
        basePath="/admin/content"
        values={values}
        searchPlaceholder="Title"
        filters={[
          { name: "status", label: "Statuses", options: enumOptions(CONTENT_STATUSES, CONTENT_STATUS_LABELS) },
          { name: "format", label: "Formats", options: enumOptions(CONTENT_FORMATS, CONTENT_FORMAT_LABELS) },
        ]}
      />
      {ordered.length === 0 ? (
        <EmptyState title="No content items" description="Add ideas here; schedule them when they are drafted." />
      ) : (
        <div className="space-y-6">
          {ordered.map((g, gi) => (
            <section key={g.title}>
              <h2 className="mb-2 flex items-center gap-1 text-sm font-semibold">
                <span>
                  {g.title} <span className="font-normal text-muted-foreground">· {g.items.length}</span>
                </span>
                {gi === 0 ? <HelpButton topic="content" section="mark-posted" className="ml-auto" /> : null}
              </h2>
              <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {g.items.map((item) => {
                  const next = NEXT_STATUS[item.status];
                  const late = item.scheduledFor && item.status !== "posted" && item.scheduledFor < now;
                  return (
                    <li key={item.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          <ContentStatusBadge status={item.status} />
                          <ArchivedBadge archivedAt={item.archivedAt} />
                          {late ? <ToneBadge tone="danger">Late</ToneBadge> : null}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {CONTENT_FORMAT_LABELS[item.format]} · {CONTENT_LANGUAGE_LABELS[item.language]}
                          {item.targetPlatform ? ` · ${item.targetPlatform}` : ""}
                          {item.scheduledFor ? ` · scheduled ${formatDate(item.scheduledFor)}` : ""}
                          {item.postedAt ? ` · posted ${formatDate(item.postedAt)}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 text-sm text-primary hover:underline">
                            Open <ExternalLinkIcon className="size-3" />
                          </a>
                        ) : null}
                        {next ? (
                          <ActionButton action={setContentStatusAction} fields={{ id: item.id, status: next }}>
                            Mark {CONTENT_STATUS_LABELS[next].toLowerCase()}
                          </ActionButton>
                        ) : null}
                        {item.status !== "posted" ? (
                          <FormDialog triggerLabel="Mark posted" triggerVariant={item.status === "approved" ? "default" : "outline"} triggerSize="sm" title="Mark posted">
                            <MarkPostedForm id={item.id} url={item.url} />
                          </FormDialog>
                        ) : null}
                        <FormDialog
                          triggerLabel={<span className="sr-only">Edit {item.title}</span>}
                          triggerIcon={<PencilIcon />}
                          triggerVariant="ghost"
                          triggerSize="icon-sm"
                          title="Edit content item"
                          wide
                        >
                          <ContentForm item={item} />
                        </FormDialog>
                        <ArchiveButton
                          id={item.id}
                          archivedAt={item.archivedAt}
                          archive={archiveContentAction}
                          unarchive={unarchiveContentAction}
                          noun="content item"
                          size="icon-sm"
                          iconOnly
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
