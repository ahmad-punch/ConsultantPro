import { PencilIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ActionButton } from "@/components/admin/action-form";
import { ArchiveButton, ArchivedBadge, ShowArchivedToggle } from "@/components/admin/archive-controls";
import { ChannelStatusBadge, ToneBadge } from "@/components/admin/badges";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { ageLabel, buildHref, enumOptions, formatDate } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { HelpButton } from "@/components/admin/help-button";
import { ChannelForm } from "@/components/admin/forms/channel-form";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { archiveChannelAction, logChannelPostAction, unarchiveChannelAction } from "@/lib/actions/channels";
import { ImportChannelsDialog } from "@/components/admin/import/import-dialogs";
import { requireAdmin } from "@/lib/auth";
import {
  CHANNEL_PLATFORMS,
  CHANNEL_PLATFORM_LABELS,
  CHANNEL_STATUSES,
  CHANNEL_STATUS_LABELS,
} from "@/lib/db/enums";
import { listChannels, readChannelFilters } from "@/lib/queries/channels";
import { getAmbassadorOptions } from "@/lib/queries/options";
import { cn } from "@/lib/utils";

export const metadata = { title: "Channels" };

export default function ChannelsPage({ searchParams }: PageProps<"/admin/channels">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Channels" />
          <TableSkeleton />
        </>
      }
    >
      <Channels searchParams={searchParams} />
    </Suspense>
  );
}

async function Channels({ searchParams }: { searchParams: PageProps<"/admin/channels">["searchParams"] }) {
  await requireAdmin();
  const f = readChannelFilters(await searchParams);
  const now = new Date();
  const [rows, ambassadors] = await Promise.all([listChannels(f, now), getAmbassadorOptions(true)]);
  const base = "/admin/channels";
  const params = {
    q: f.q,
    status: f.status,
    platform: f.platform,
    view: f.view === "due" ? "due" : undefined,
    archived: f.archived ? "1" : undefined,
  };

  return (
    <>
      <PageHeader
        helpTopic="channels"
        title="Channels"
        description="WhatsApp groups, Facebook groups, associations and community centres we post in. Set a cadence to get reminders."
        actions={
          <>
            <ImportChannelsDialog />
            <FormDialog triggerLabel="New channel" title="New channel" wide>
              <ChannelForm ambassadors={ambassadors} />
            </FormDialog>
          </>
        }
      />
      <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-lg border bg-card p-0.5" role="group" aria-label="View">
        {[
          { label: "All channels", view: undefined },
          { label: "Due to post", view: "due" },
        ].map((v) => (
          <Link
            key={v.label}
            href={buildHref(base, params, { view: v.view })}
            scroll={false}
            aria-current={params.view === v.view ? "page" : undefined}
            className={cn(
              "rounded-md px-2.5 py-1 text-sm text-muted-foreground",
              params.view === v.view && "bg-primary text-primary-foreground",
            )}
          >
            {v.label}
          </Link>
        ))}
      </div>
      <ShowArchivedToggle basePath={base} params={params} on={f.archived} />
      </div>
      <FilterBar
        basePath={base}
        values={params}
        searchPlaceholder="Name, country, admin"
        filters={[
          { name: "status", label: "Statuses", options: enumOptions(CHANNEL_STATUSES, CHANNEL_STATUS_LABELS) },
          { name: "platform", label: "Platforms", options: enumOptions(CHANNEL_PLATFORMS, CHANNEL_PLATFORM_LABELS) },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState
          title={f.view === "due" ? "Nothing due to post" : "No channels"}
          description={
            f.view === "due"
              ? "Every channel with a cadence has been posted to recently."
              : "Add the groups and associations from marketing/channels.csv."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell text-right">Members</TableHead>
                <TableHead className="hidden lg:table-cell">Ambassador</TableHead>
                <TableHead className="hidden sm:table-cell">Last post</TableHead>
                <TableHead className="hidden sm:table-cell">Next due</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                  <HelpButton topic="channels" section="log-post" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ channel: c, ambassadorName, nextDue, isDue }) => (
                <TableRow key={c.id}>
                  <TableCell className="max-w-72">
                    <span className={cn("block truncate font-medium", c.archivedAt && "text-muted-foreground")}>
                      {c.name}
                      <ArchivedBadge archivedAt={c.archivedAt} />
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {CHANNEL_PLATFORM_LABELS[c.platform]}
                      {c.country ? ` · ${c.country}` : ""}
                      {c.adminContact ? ` · admin: ${c.adminContact}` : ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ChannelStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">
                    {c.memberCount?.toLocaleString("en-GB") ?? "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{ambassadorName ?? "-"}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {c.lastPostedAt ? <span title={formatDate(c.lastPostedAt)}>{ageLabel(c.lastPostedAt, now)}</span> : <span className="text-muted-foreground">Never</span>}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {nextDue ? (
                      isDue ? (
                        <ToneBadge tone="danger">{nextDue.getTime() === 0 ? "Due now" : `Due since ${formatDate(nextDue)}`}</ToneBadge>
                      ) : (
                        formatDate(nextDue)
                      )
                    ) : (
                      <span className="text-muted-foreground">{c.cadenceDays ? "Paused" : "No cadence"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ActionButton action={logChannelPostAction} fields={{ id: c.id }} icon={<SendIcon />} variant={isDue ? "default" : "outline"}>
                        Log post
                      </ActionButton>
                      <FormDialog
                        triggerLabel={<span className="sr-only">Edit {c.name}</span>}
                        triggerIcon={<PencilIcon />}
                        triggerVariant="ghost"
                        triggerSize="icon-sm"
                        title="Edit channel"
                        wide
                      >
                        <ChannelForm channel={c} ambassadors={ambassadors} />
                      </FormDialog>
                      <ArchiveButton
                        id={c.id}
                        archivedAt={c.archivedAt}
                        archive={archiveChannelAction}
                        unarchive={unarchiveChannelAction}
                        noun="channel"
                        size="icon-sm"
                        iconOnly
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">{rows.length} channels</p>
    </>
  );
}
