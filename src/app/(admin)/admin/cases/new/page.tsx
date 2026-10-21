import { Suspense } from "react";

import { CaseNewForm } from "@/components/admin/forms/case-new-form";
import { PageHeader } from "@/components/admin/page-header";
import { DetailSkeleton } from "@/components/admin/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import {
  getAmbassadorOptions,
  getCaseOptions,
  getClientOptions,
  getPartnerOptions,
  getTeamOptions,
} from "@/lib/queries/options";
import { uuidParam } from "@/lib/queries/params";

export const metadata = { title: "New case" };

export default function NewCasePage({ searchParams }: PageProps<"/admin/cases/new">) {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        helpTopic="cases"
        title="New case"
        description="The price defaults to the list price in the catalogue; change it if you quoted differently."
      />
      <Suspense fallback={<DetailSkeleton />}>
        <NewCase searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function NewCase({ searchParams }: { searchParams: PageProps<"/admin/cases/new">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const [clients, team, partners, ambassadors, cases] = await Promise.all([
    getClientOptions(),
    getTeamOptions(),
    getPartnerOptions(),
    getAmbassadorOptions(),
    getCaseOptions(),
  ]);
  return (
    <Card>
      <CardContent>
        <CaseNewForm
          clients={clients}
          team={team}
          partners={partners}
          ambassadors={ambassadors}
          cases={cases}
          defaultClientId={uuidParam(sp, "clientId")}
        />
      </CardContent>
    </Card>
  );
}
