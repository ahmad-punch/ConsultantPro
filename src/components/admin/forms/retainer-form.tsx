"use client";

import { useState } from "react";

import { createRetainerAction } from "@/lib/actions/retainers";
import { RETAINER_TIERS, RETAINER_TIER_LABELS, type RetainerTier } from "@/lib/db/enums";
import { defaultPriceUsd } from "@/lib/pricing";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions, toDateInput, type Opt } from "../format";
import { FormActions, FormGrid, SelectField, TextField } from "../form-fields";

export function RetainerForm({ clients, defaultClientId }: { clients: Opt[]; defaultClientId?: string }) {
  const [tier, setTier] = useState<RetainerTier>("watch");
  const [monthly, setMonthly] = useState(String(defaultPriceUsd("watch")));
  return (
    <ActionForm action={createRetainerAction} className="space-y-4">
      <SelectField name="clientId" label="Client" required options={clients} defaultValue={defaultClientId} />
      <FormGrid>
        <SelectField
          name="tier"
          label="Tier"
          required
          options={enumOptions(RETAINER_TIERS, RETAINER_TIER_LABELS)}
          value={tier}
          onValueChange={(v) => {
            setTier(v as RetainerTier);
            setMonthly(String(defaultPriceUsd(v as RetainerTier)));
          }}
        />
        <TextField
          name="monthlyUsd"
          label="Monthly (USD)"
          type="number"
          min={0}
          required
          value={monthly}
          onChange={(e) => setMonthly(e.target.value)}
        />
        <TextField name="startedAt" label="Started on" type="date" required defaultValue={toDateInput(new Date())} />
      </FormGrid>
      <FormActions>
        <SubmitButton>Start retainer</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
