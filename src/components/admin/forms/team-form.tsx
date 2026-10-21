"use client";

import { createTeamMemberAction, setActorAction } from "@/lib/actions/team";
import { TEAM_ROLES, TEAM_ROLE_LABELS } from "@/lib/db/enums";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions, type Opt } from "../format";
import { FormActions, FormGrid, SelectField, TextField } from "../form-fields";

export function TeamMemberForm() {
  return (
    <ActionForm action={createTeamMemberAction} className="space-y-4">
      <FormGrid>
        <TextField name="name" label="Name" required autoComplete="off" />
        <SelectField name="role" label="Role" required options={enumOptions(TEAM_ROLES, TEAM_ROLE_LABELS)} defaultValue="case_manager" />
        <TextField name="email" label="Email" type="email" required className="@md:col-span-2" />
      </FormGrid>
      <FormActions>
        <SubmitButton>Add team member</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}

export function ActorForm({ team, currentId }: { team: Opt[]; currentId?: string }) {
  return (
    <ActionForm action={setActorAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <SelectField name="id" label="Acting as" required options={team} defaultValue={currentId} className="sm:max-w-xs" />
      <SubmitButton variant="outline">Save</SubmitButton>
    </ActionForm>
  );
}
