import { CopyIcon, FileDownIcon, FilePlus2Icon, PencilIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ActionButton } from "@/components/admin/action-form";
import { ToneBadge } from "@/components/admin/badges";
import { BrandingForm } from "@/components/admin/documents/branding-form";
import { ExportLinks } from "@/components/admin/documents/export-links";
import { GenerateDocumentForm } from "@/components/admin/documents/small-forms";
import { TemplateForm } from "@/components/admin/documents/template-form";
import { EmptyState } from "@/components/admin/empty-state";
import { FormDialog } from "@/components/admin/form-dialog";
import { formatDate } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { duplicateTemplateAction, setDefaultTemplateAction } from "@/lib/actions/documents";
import { can, requirePermission, type Permission } from "@/lib/rbac";
import { DOCUMENT_TYPE_LABELS } from "@/lib/db/enums";
import { getBranding, listGeneratedDocuments, listTemplates } from "@/lib/queries/documents";
import { getCaseOptions } from "@/lib/queries/options";
import { param, type SearchParams } from "@/lib/queries/params";
import { cn } from "@/lib/utils";

export const metadata = { title: "Documents" };

const TABS = [
  { id: "templates", label: "Templates" },
  { id: "generated", label: "Generated" },
  { id: "branding", label: "Branding" },
  { id: "exports", label: "Exports" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const TAB_PERMISSIONS: Record<Tab, Permission> = {
  templates: "documents.templates",
  generated: "documents.view",
  branding: "documents.templates",
  exports: "data.export",
};

export default function DocumentsPage({ searchParams }: PageProps<"/admin/documents">) {
  return (
    <>
      <PageHeader
        helpTopic="documents"
        title="Documents"
        description="Branding, templates for invoices, receipts, quotes, engagement letters and case summaries, generated documents, and CSV exports."
      />
      <Suspense fallback={<TableSkeleton />}>
        <Documents searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Documents({ searchParams }: { searchParams: PageProps<"/admin/documents">["searchParams"] }) {
  const { role } = await requirePermission("documents.view");
  // Templates and branding are super-admin only; exports need data.export.
  const tabs = TABS.filter((t) => can(role, TAB_PERMISSIONS[t.id]));
  const sp = (await searchParams) as SearchParams;
  const raw = param(sp, "tab");
  const tab: Tab = tabs.some((t) => t.id === raw) ? (raw as Tab) : (tabs[0]?.id ?? "generated");
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-1 border-b" aria-label="Documents sections">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin/documents?tab=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
              tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {tab === "templates" ? <Templates /> : null}
      {tab === "generated" ? <Generated /> : null}
      {tab === "branding" ? <BrandingForm branding={await getBranding()} /> : null}
      {tab === "exports" ? <ExportLinks /> : null}
    </div>
  );
}

async function Templates() {
  const templates = await listTemplates();
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <FormDialog triggerLabel="New template" triggerIcon={<FilePlus2Icon />} title="New template" wide>
          <TemplateForm />
        </FormDialog>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Title</TableHead>
              <TableHead className="hidden sm:table-cell">Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{DOCUMENT_TYPE_LABELS[t.type]}</TableCell>
                <TableCell>
                  <span className="mr-2">{t.name}</span>
                  {t.isDefault ? <ToneBadge tone="primary">Default</ToneBadge> : null}
                </TableCell>
                <TableCell className="hidden md:table-cell">{t.title}</TableCell>
                <TableCell className="hidden sm:table-cell">{formatDate(t.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-1">
                    <FormDialog triggerLabel="Edit" triggerIcon={<PencilIcon />} triggerVariant="outline" triggerSize="sm" title={`Edit ${t.name}`} wide>
                      <TemplateForm
                        template={{
                          ...t,
                          sections: t.sections ?? [],
                          options: t.options ?? {},
                        }}
                      />
                    </FormDialog>
                    <ActionButton action={duplicateTemplateAction} fields={{ id: t.id }} icon={<CopyIcon />}>
                      Duplicate
                    </ActionButton>
                    {!t.isDefault ? (
                      <ActionButton action={setDefaultTemplateAction} fields={{ id: t.id }} icon={<StarIcon />}>
                        Make default
                      </ActionButton>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

async function Generated() {
  const [docs, cases, templates] = await Promise.all([listGeneratedDocuments(), getCaseOptions(), listTemplates()]);
  const letterTemplates = templates
    .filter((t) => t.type === "engagement_letter" || t.type === "case_summary")
    .map((t) => ({ value: t.id, label: `${DOCUMENT_TYPE_LABELS[t.type]}: ${t.name}` }));
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <FormDialog triggerLabel="Generate document" triggerIcon={<FilePlus2Icon />} title="Generate a document for a case" description="Engagement letters and case summaries. The document is frozen when generated." wide>
          <GenerateDocumentForm cases={cases} templates={letterTemplates} />
        </FormDialog>
      </div>
      {docs.length === 0 ? (
        <EmptyState title="No generated documents" description="Generate an engagement letter or case summary for a case." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Client</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="text-right">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((r) => (
                <TableRow key={r.doc.id}>
                  <TableCell className="font-mono">{r.doc.documentNumber}</TableCell>
                  <TableCell>
                    {r.doc.title}
                    <span className="block text-xs text-muted-foreground">{DOCUMENT_TYPE_LABELS[r.doc.type]}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{r.clientName ?? "-"}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(r.doc.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/documents/${r.doc.id}/pdf`} target="_blank" rel="noopener">
                        <FileDownIcon /> PDF
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
