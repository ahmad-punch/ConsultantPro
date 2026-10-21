"use client";

import { useMemo, useState } from "react";

import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { FormActions, FormGrid, SelectField, TextField, TextareaField } from "@/components/admin/form-fields";
import { createEngagementAction } from "@/lib/actions/engagements";
import { PARTNER_TIER_LABELS, PARTNER_TYPE_LABELS, type PartnerTier, type PartnerType } from "@/lib/db/enums";
import { DEPARTMENTS, listHas } from "@/lib/validation/applications";
import { FEE_BILLED_BY, FEE_BILLED_BY_LABELS, NO_POACHING_POLICY } from "@/lib/validation/engagements";

export type ProviderChoice = {
  id: string;
  name: string;
  type: PartnerType;
  tier: PartnerTier;
  city: string | null;
  departments: string | null;
  serviceAreas: string | null;
  slaDays: number | null;
  rating: number | null;
};

const TIER_ORDER: Record<PartnerTier, number> = { gold: 0, silver: 1, bronze: 2, probation: 3 };

/** Propose an engagement on a case. Providers are filtered by office + city, best tier first. */
export function EngagementForm({
  caseId,
  providers,
  defaultDepartment,
  defaultCity,
}: {
  caseId: string;
  providers: ProviderChoice[];
  defaultDepartment?: string | null;
  defaultCity?: string | null;
}) {
  const [department, setDepartment] = useState(defaultDepartment ?? "");
  const [city, setCity] = useState(defaultCity ?? "");
  const [showAll, setShowAll] = useState(false);
  const [partnerId, setPartnerId] = useState<string>("");
  const [billedBy, setBilledBy] = useState<string>("partner");

  const filtered = useMemo(() => {
    const list = showAll
      ? providers
      : providers.filter(
          (p) =>
            (!department || listHas(p.departments, department)) &&
            (!city.trim() || listHas(p.serviceAreas, city) || p.city?.toLowerCase() === city.trim().toLowerCase()),
        );
    return [...list].sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || (b.rating ?? 0) - (a.rating ?? 0));
  }, [providers, department, city, showAll]);

  const chosen = providers.find((p) => p.id === partnerId);

  return (
    <ActionForm action={createEngagementAction} className="grid gap-4">
      <input type="hidden" name="caseId" value={caseId} />
      <FormGrid>
        <SelectField
          name="department"
          label="Office"
          options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
          value={department || undefined}
          onValueChange={setDepartment}
          placeholder="Any office"
        />
        <TextField name="locationCity" label="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <div className="@md:col-span-2">
          <SelectField
            name="partnerId"
            label={`Provider (${filtered.length} match${filtered.length === 1 ? "" : "es"})`}
            required
            value={partnerId || undefined}
            onValueChange={(v) => {
              setPartnerId(v);
              const p = providers.find((x) => x.id === v);
              if (p && p.type !== "advocate") setBilledBy("company");
              if (p?.type === "advocate") setBilledBy("partner");
            }}
            options={filtered.map((p) => ({
              value: p.id,
              label: `${p.name} · ${PARTNER_TYPE_LABELS[p.type]} · ${PARTNER_TIER_LABELS[p.tier]}${p.rating ? ` · ${p.rating}/5` : ""}`,
            }))}
            placeholder={filtered.length ? "Choose a provider" : "No provider serves this office and city"}
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="accent-primary" />
            Show all signed providers
          </label>
        </div>
        <TextField name="agreedFeeUsd" label="Agreed fee (USD)" type="number" min={0} defaultValue="0" required />
        <SelectField
          name="feeBilledBy"
          label="Fee billed by"
          value={billedBy}
          onValueChange={setBilledBy}
          options={FEE_BILLED_BY.map((v) => ({ value: v, label: FEE_BILLED_BY_LABELS[v] }))}
        />
        <TextField name="slaDays" label="SLA (days)" type="number" min={0} max={365} placeholder={chosen?.slaDays ? String(chosen.slaDays) : ""} />
        <TextField name="dueAt" label="Due" type="date" />
        <TextareaField name="notes" label="Brief for the provider" className="@md:col-span-2" rows={3} description="Do not paste the client's phone or email here; they are shared only after the provider accepts." />
      </FormGrid>
      <p className="rounded-md border bg-muted/50 p-3 text-xs text-muted-foreground">{NO_POACHING_POLICY}</p>
      <FormActions>
        <SubmitButton>Propose engagement</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
