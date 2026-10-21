"use client";

import { addCaseNoteAction, closeCaseAction, setStageAction } from "@/lib/actions/cases";
import { CASE_STAGES, CASE_STAGE_LABELS, type CaseStage } from "@/lib/db/enums";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions, toDateInput } from "../format";
import { FormActions, FormGrid, SelectField, TextareaField, TextField } from "../form-fields";

export function SetStageForm({ id, stage }: { id: string; stage: CaseStage }) {
  return (
    <ActionForm action={setStageAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <SelectField
        name="stage"
        label="New stage"
        required
        options={enumOptions(CASE_STAGES, CASE_STAGE_LABELS).filter((o) => o.value !== stage)}
      />
      <TextareaField name="note" label="Reason (goes in the activity log)" rows={3} />
      <FormActions>
        <SubmitButton>Set stage</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}

export function CloseCaseForm({
  id,
  nps,
  wouldRecommend,
  closedAt,
}: {
  id: string;
  nps: number | null;
  wouldRecommend: boolean | null;
  closedAt: Date | null;
}) {
  return (
    <ActionForm action={closeCaseAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <FormGrid>
        <TextField
          name="nps"
          label="NPS score (0-10)"
          type="number"
          min={0}
          max={10}
          step={1}
          defaultValue={nps ?? ""}
          description="How likely to recommend us, 0-10."
        />
        <SelectField
          name="wouldRecommend"
          label="Would recommend?"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          noneLabel="Not asked yet"
          defaultValue={wouldRecommend === null ? null : wouldRecommend ? "yes" : "no"}
        />
        <TextField
          name="closedAt"
          label="Closed on"
          type="date"
          required
          defaultValue={toDateInput(closedAt ?? new Date())}
        />
      </FormGrid>
      <TextareaField name="note" label="Closing note" rows={3} placeholder="Outcome, documents handed over, anything to remember." />
      <FormActions>
        <SubmitButton>Save close-out</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}

export function AddNoteForm({ caseId }: { caseId: string }) {
  return (
    <ActionForm action={addCaseNoteAction} resetOnSuccess className="space-y-2">
      <input type="hidden" name="caseId" value={caseId} />
      <TextareaField
        name="body"
        label="Add a note"
        required
        rows={3}
        placeholder="Call notes, client update sent, documents received..."
      />
      <FormActions className="pt-0">
        <SubmitButton size="sm">Add note</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
