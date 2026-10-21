import { Suspense } from "react";

import { PageHeader } from "@/components/admin/page-header";
import { ProjectTabs, type ProjectTab } from "@/components/admin/project/project-tabs";
import {
  ChangelogTab,
  docDate,
  DecisionsTab,
  LearningsTab,
  MissingDoc,
  OpenDecisionsTab,
  realItems,
  SourceNote,
  StatusTab,
} from "@/components/admin/project/sections";
import { CardsSkeleton, TableSkeleton } from "@/components/admin/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth";
import { getChangelog, getDecisions, getLearnings, getStatus, PROJECT_DOC_PATHS } from "@/lib/project-docs";
import { enumParam } from "@/lib/queries/params";

export const metadata = { title: "Project" };

const TAB_VALUES = ["status", "open-decisions", "decisions", "changelog", "learnings"] as const;
type TabValue = (typeof TAB_VALUES)[number];

export default function ProjectPage({ searchParams }: PageProps<"/admin/project">) {
  return (
    <>
      <PageHeader
        helpTopic="project"
        title="Project"
        description="Where the build stands: status, open and recorded decisions, the changelog and lessons learned. Every tab is read from markdown in the repo's docs folder."
      />
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-9 w-full max-w-lg" />
            <CardsSkeleton count={5} />
            <TableSkeleton rows={5} />
          </div>
        }
      >
        <Project searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Project({ searchParams }: { searchParams: PageProps<"/admin/project">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const initial: TabValue = enumParam(sp, "tab", TAB_VALUES) ?? "status";

  const status = getStatus();
  const changelog = getChangelog();
  const learnings = getLearnings();
  const decisions = getDecisions();
  const openItems = status ? realItems(status.sections["Open decisions"]) : [];

  const tabs: ProjectTab[] = [
    {
      value: "status",
      label: "Status",
      content: (
        <>
          <SourceNote path={PROJECT_DOC_PATHS.status}>
            {status?.updated ? (
              <>
                Last updated <span className="font-medium text-foreground">{docDate(status.updated)}</span>.
              </>
            ) : null}
          </SourceNote>
          {status ? <StatusTab status={status} /> : <MissingDoc path={PROJECT_DOC_PATHS.status} />}
        </>
      ),
    },
    {
      value: "open-decisions",
      label: "Open decisions",
      count: openItems.length,
      content: (
        <>
          <SourceNote path={PROJECT_DOC_PATHS.status}>
            These are the items under &ldquo;Open decisions&rdquo;. Once one is made, record it in{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">docs/decisions/</code> as a numbered file and
            remove it here.
          </SourceNote>
          {status ? (
            <OpenDecisionsTab items={openItems} decisions={decisions ?? []} />
          ) : (
            <MissingDoc path={PROJECT_DOC_PATHS.status} />
          )}
        </>
      ),
    },
    {
      value: "decisions",
      label: "Decisions",
      count: decisions?.length,
      content: (
        <>
          <SourceNote path={`${PROJECT_DOC_PATHS.decisions}NNNN-title.md`}>
            One file per decision; never edit an accepted decision, supersede it with a new record.
          </SourceNote>
          {decisions ? <DecisionsTab decisions={decisions} /> : <MissingDoc path={PROJECT_DOC_PATHS.decisions} />}
        </>
      ),
    },
    {
      value: "changelog",
      label: "Changelog",
      content: (
        <>
          <SourceNote path={PROJECT_DOC_PATHS.changelog}>New work goes under Unreleased.</SourceNote>
          {changelog ? <ChangelogTab releases={changelog} /> : <MissingDoc path={PROJECT_DOC_PATHS.changelog} />}
        </>
      ),
    },
    {
      value: "learnings",
      label: "Learnings",
      count: learnings?.length,
      content: (
        <>
          <SourceNote path={PROJECT_DOC_PATHS.learnings}>Newest first; read the entry for an area before changing it.</SourceNote>
          {learnings ? <LearningsTab learnings={learnings} /> : <MissingDoc path={PROJECT_DOC_PATHS.learnings} />}
        </>
      ),
    },
  ];

  return <ProjectTabs key={initial} tabs={tabs} initial={initial} />;
}
