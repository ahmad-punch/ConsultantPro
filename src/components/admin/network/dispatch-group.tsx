"use client";

import { FootprintsIcon, LayersIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { SelectField, TextField } from "@/components/admin/form-fields";
import { PARTNER_TIER_LABELS, type PartnerTier } from "@/lib/db/enums";
import { cn } from "@/lib/utils";

import { createBatchAction, goingInAction } from "@/lib/actions/network";

export type DispatchItemView = {
  key: string;
  kind: "engagement" | "case";
  caseId: string;
  caseNumber: string;
  summary: string;
  engagementId?: string;
  status?: string;
  statusLabel?: string;
  providerName?: string;
  batchKey?: string | null;
  due?: string;
};

export type RankedProvider = { id: string; name: string; tier: PartnerTier; rating: number | null; completed: number };

/** One city + office group on the dispatch board: pick items, pick a provider, create a batch. */
export function DispatchGroupCard({
  city,
  department,
  items,
  providers,
  highlighted,
}: {
  city: string;
  department: string;
  items: DispatchItemView[];
  providers: RankedProvider[];
  highlighted?: boolean;
}) {
  const selectable = (i: DispatchItemView) => i.kind === "case" || i.status === "proposed";
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const toggle = (key: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const providerOptions = providers.map((p) => ({
    value: p.id,
    label: `${p.name} · ${PARTNER_TIER_LABELS[p.tier]}${p.rating ? ` · ${p.rating}/5` : ""} · ${p.completed} done`,
  }));
  const realCity = city !== "No city" ? city : "";
  const realDept = department !== "No office" ? department : "";

  return (
    <section className={cn("rounded-xl border bg-card p-4", highlighted && "border-primary ring-2 ring-primary/20")} aria-label={`${department} in ${city}`}>
      {highlighted ? (
        <p className="mb-3 rounded-md bg-secondary p-2 text-xs">
          Someone is going in here today. Tick the other pending items below and create a batch so they go on the same visit.
        </p>
      ) : null}
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">
          {department} <span className="text-muted-foreground">in</span> {city}
        </h2>
        <span className="text-xs text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"} · {providers.length} provider{providers.length === 1 ? "" : "s"} serve this
        </span>
      </header>

      <ActionForm action={createBatchAction} className="grid gap-3" resetOnSuccess>
        <input type="hidden" name="city" value={realCity} />
        <input type="hidden" name="department" value={realDept} />
        <ul className="grid gap-1.5">
          {items.map((i) => (
            <li key={i.key} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                aria-label={`Add ${i.caseNumber} to batch`}
                disabled={!selectable(i)}
                checked={picked.has(i.key)}
                onChange={() => toggle(i.key)}
                className="mt-1 size-4 accent-primary"
              />
              {picked.has(i.key) ? (
                <input type="hidden" name={i.kind === "case" ? "caseIds" : "engagementIds"} value={i.kind === "case" ? i.caseId : (i.engagementId ?? "")} />
              ) : null}
              <div className="min-w-0 flex-1">
                <Link href={`/admin/cases/${i.caseId}`} className="font-mono text-xs hover:underline">
                  {i.caseNumber}
                </Link>{" "}
                <span className="text-xs text-muted-foreground">
                  {i.kind === "case" ? "Unassigned" : `${i.statusLabel} · ${i.providerName}`}
                  {i.batchKey ? ` · batch ${i.batchKey}` : ""}
                  {i.due ? ` · due ${i.due}` : ""}
                </span>
                <p className="line-clamp-1 text-muted-foreground">{i.summary}</p>
              </div>
            </li>
          ))}
        </ul>
        {providers.length ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_7rem_9rem_auto] sm:items-end">
            <SelectField name="partnerId" label="Provider" options={providerOptions} defaultValue={providers[0]?.id} />
            <TextField name="agreedFeeUsd" label="Fee each (USD)" type="number" min={0} defaultValue="0" />
            <TextField name="visitOn" label="Visit date" type="date" />
            <SubmitButton size="sm" icon={<LayersIcon />} disabled={picked.size === 0}>
              Create batch
            </SubmitButton>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No signed provider lists this office and city. Add it to a provider&apos;s departments and service areas.</p>
        )}
      </ActionForm>

      {providers.length && realCity && realDept ? (
        <ActionForm
          action={goingInAction}
          className="mt-3 flex flex-wrap items-end gap-2 border-t pt-3"
          redirectTo={`/admin/network/dispatch?focus=${encodeURIComponent(`${realCity}|${realDept}`)}`}
        >
          <input type="hidden" name="city" value={realCity} />
          <input type="hidden" name="department" value={realDept} />
          <SelectField name="partnerId" label="Who is going in today" options={providerOptions} defaultValue={providers[0]?.id} className="min-w-56 flex-1" />
          <SubmitButton size="sm" variant="outline" icon={<FootprintsIcon />}>
            Going in
          </SubmitButton>
        </ActionForm>
      ) : null}
    </section>
  );
}
