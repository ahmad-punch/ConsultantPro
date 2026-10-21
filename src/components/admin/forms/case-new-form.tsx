"use client";

import { useState } from "react";

import { createCaseAction } from "@/lib/actions/cases";
import { CASE_CATEGORIES, CASE_CATEGORY_LABELS } from "@/lib/db/enums";
import { NONE } from "@/lib/validation/fields";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions, type Opt } from "../format";
import { FormActions, FormGrid, SelectField, TextareaField, TextField } from "../form-fields";
import { ProductPriceFields } from "./product-price-fields";

export function CaseNewForm({
  clients,
  team,
  partners,
  ambassadors,
  cases,
  defaultClientId,
}: {
  clients: Opt[];
  team: Opt[];
  partners: Opt[];
  ambassadors: Opt[];
  cases: Opt[];
  defaultClientId?: string;
}) {
  const [clientId, setClientId] = useState<string>(
    defaultClientId && clients.some((c) => c.value === defaultClientId) ? defaultClientId : NONE,
  );
  const newClient = clientId === NONE;
  return (
    <ActionForm action={createCaseAction} redirectTo="/admin/cases/{id}" className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Client</h2>
        <SelectField
          name="clientId"
          label="Existing client"
          options={clients}
          noneLabel="New client (enter details below)"
          value={clientId}
          onValueChange={setClientId}
        />
        {newClient ? (
          <FormGrid className="rounded-lg border border-dashed p-4">
            <TextField name="newClientName" label="Client name" required autoComplete="off" />
            <TextField name="newClientWhatsapp" label="WhatsApp" placeholder="+44 7700 900000" inputMode="tel" />
            <TextField name="newClientEmail" label="Email" type="email" />
            <TextField name="newClientCountry" label="Country" />
            <TextField name="newClientCity" label="City" />
          </FormGrid>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Case</h2>
        <FormGrid>
          <SelectField
            name="category"
            label="Category"
            required
            options={enumOptions(CASE_CATEGORIES, CASE_CATEGORY_LABELS)}
            defaultValue="property"
          />
          <div className="hidden @md:block" />
          <ProductPriceFields />
        </FormGrid>
        <TextareaField
          name="summary"
          label="Summary"
          required
          rows={4}
          description="One paragraph: the problem, where, and what the client wants."
        />
        <FormGrid>
          <SelectField name="caseManagerId" label="Case manager" options={team} noneLabel="Unassigned" />
          <SelectField name="partnerId" label="Partner" options={partners} noneLabel="None yet" />
          <TextField name="nextAction" label="Next action" placeholder="Send payment link" />
          <TextField name="nextActionDue" label="Next action due" type="date" />
          <TextField name="paymentLink" label="Payment link" type="url" placeholder="https://" />
        </FormGrid>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Referral</h2>
        <FormGrid>
          <SelectField name="ambassadorId" label="Referred by ambassador" options={ambassadors} noneLabel="None" />
          <SelectField name="referredByCaseId" label="Referred by earlier case" options={cases} noneLabel="None" />
        </FormGrid>
      </section>

      <FormActions>
        <SubmitButton>Open case</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
