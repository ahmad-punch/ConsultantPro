"use client";

import { createClientAction, updateClientAction } from "@/lib/actions/clients";
import type { Client } from "@/lib/db/schema";

import { ActionForm, SubmitButton } from "../action-form";
import type { Opt } from "../format";
import { FormActions, FormGrid, SelectField, TextareaField, TextField } from "../form-fields";

export function ClientForm({ client, ambassadors }: { client?: Client; ambassadors: Opt[] }) {
  return (
    <ActionForm
      action={client ? updateClientAction : createClientAction}
      redirectTo={client ? undefined : "/admin/clients/{id}"}
      className="space-y-4"
    >
      {client ? <input type="hidden" name="id" value={client.id} /> : null}
      <FormGrid>
        <TextField name="name" label="Name" required defaultValue={client?.name} autoComplete="off" />
        <TextField name="whatsapp" label="WhatsApp" defaultValue={client?.whatsapp ?? ""} inputMode="tel" placeholder="+44 7700 900000" />
        <TextField name="email" label="Email" type="email" defaultValue={client?.email ?? ""} />
        <TextField name="country" label="Country" defaultValue={client?.country ?? ""} />
        <TextField name="city" label="City" defaultValue={client?.city ?? ""} />
        <SelectField name="ambassadorId" label="Ambassador" options={ambassadors} noneLabel="None" defaultValue={client?.ambassadorId} />
      </FormGrid>
      <TextareaField name="notes" label="Notes" rows={3} defaultValue={client?.notes ?? ""} />
      <FormActions>
        <SubmitButton>{client ? "Save client" : "Add client"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
