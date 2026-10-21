"use client";

import { CameraIcon } from "lucide-react";

import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { FormActions, TextField } from "@/components/admin/form-fields";
import { saveMetricsSnapshotAction } from "@/lib/actions/metrics";

/** Stores the gate for the range on screen. Lives in a FormDialog. */
export function SnapshotForm({ from, to, label }: { from: string; to: string; label: string }) {
  return (
    <ActionForm action={saveMetricsSnapshotAction} className="space-y-4">
      <input type="hidden" name="from" value={from} />
      <input type="hidden" name="to" value={to} />
      <p className="text-sm text-muted-foreground">Range: {label}</p>
      <TextField name="note" label="Note (optional)" placeholder="e.g. Day 60 review" maxLength={1000} />
      <FormActions>
        <SubmitButton icon={<CameraIcon />}>Save snapshot</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
