import { HandshakeIcon } from "lucide-react";
import Link from "next/link";

import { formatDate } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { EngagementActions } from "@/components/admin/network/engagement-actions";
import { EngagementForm } from "@/components/admin/network/engagement-form";
import { EngagementStatusBadge } from "@/components/admin/network/network-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cases, partners } from "@/lib/db/schema";
import { engagementsForCase } from "@/lib/queries/engagements";
import { CATEGORY_DEPARTMENT } from "@/lib/queries/network";
import { and, eq, isNotNull, isNull, ne } from "drizzle-orm";

/** Engagements for one case plus "Engage provider". Rendered inside the case page's Suspense boundary. */
export async function EngagementsPanel({ caseId }: { caseId: string }) {
  await requirePermission("cases.view");
  const [rows, [c], providers] = await Promise.all([
    engagementsForCase(caseId),
    db.select({ department: cases.department, locationCity: cases.locationCity, category: cases.category }).from(cases).where(eq(cases.id, caseId)).limit(1),
    db
      .select()
      .from(partners)
      .where(and(isNull(partners.archivedAt), isNotNull(partners.noPoachingAcceptedAt), ne(partners.onboardingStage, "suspended"))),
  ]);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Provider engagements</CardTitle>
        <FormDialog triggerLabel="Engage provider" triggerIcon={<HandshakeIcon />} triggerVariant="outline" triggerSize="sm" title="Engage a provider" wide>
          <EngagementForm
            caseId={caseId}
            defaultDepartment={c?.department ?? (c ? CATEGORY_DEPARTMENT[c.category] : null)}
            defaultCity={c?.locationCity}
            providers={providers.map((p) => ({
              id: p.id,
              name: p.name,
              type: p.type,
              tier: p.tier,
              city: p.city,
              departments: p.departments,
              serviceAreas: p.serviceAreas,
              slaDays: p.slaDays,
              rating: p.avgRating ?? p.rating,
            }))}
          />
        </FormDialog>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No provider engaged yet. Client contact details are shared only after a provider accepts.</p>
        ) : (
          rows.map((r) => (
            <div key={r.e.id} className="grid gap-2 rounded-lg border p-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Link href={`/admin/partners/${r.e.partnerId}`} className="font-medium hover:underline">
                  {r.partnerName}
                </Link>
                <EngagementStatusBadge status={r.e.status} />
                <span className="text-xs text-muted-foreground">
                  ${r.e.agreedFeeUsd} {r.e.feeBilledBy === "partner" ? "billed by provider" : "paid by us"} · due {formatDate(r.e.dueAt)}
                  {r.e.noPoachingAcknowledgedAt ? ` · no-poaching acknowledged ${formatDate(r.e.noPoachingAcknowledgedAt)}` : ""}
                  {r.e.batchKey ? ` · batch ${r.e.batchKey}` : ""}
                </span>
              </div>
              <EngagementActions
                e={r.e}
                caseNumber={r.caseNumber}
                caseSummary={r.caseSummary}
                client={{ name: r.clientName, whatsapp: r.clientWhatsapp, email: r.clientEmail }}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
