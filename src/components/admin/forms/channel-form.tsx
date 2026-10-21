"use client";

import { createChannelAction, updateChannelAction } from "@/lib/actions/channels";
import { CHANNEL_PLATFORMS, CHANNEL_PLATFORM_LABELS, CHANNEL_STATUSES, CHANNEL_STATUS_LABELS } from "@/lib/db/enums";
import type { Channel } from "@/lib/db/schema";

import { ActionForm, SubmitButton } from "../action-form";
import { enumOptions, toDateInput, type Opt } from "../format";
import { FormActions, FormGrid, SelectField, TextareaField, TextField } from "../form-fields";

export function ChannelForm({ channel, ambassadors }: { channel?: Channel; ambassadors: Opt[] }) {
  return (
    <ActionForm action={channel ? updateChannelAction : createChannelAction} className="space-y-4">
      {channel ? <input type="hidden" name="id" value={channel.id} /> : null}
      <TextField name="name" label="Name" required defaultValue={channel?.name} autoComplete="off" />
      <FormGrid>
        <SelectField
          name="platform"
          label="Platform"
          required
          options={enumOptions(CHANNEL_PLATFORMS, CHANNEL_PLATFORM_LABELS)}
          defaultValue={channel?.platform ?? "whatsapp"}
        />
        <SelectField
          name="status"
          label="Status"
          required
          options={enumOptions(CHANNEL_STATUSES, CHANNEL_STATUS_LABELS)}
          defaultValue={channel?.status ?? "identified"}
        />
        <TextField name="country" label="Country" defaultValue={channel?.country ?? ""} />
        <TextField name="memberCount" label="Members" type="number" min={0} defaultValue={channel?.memberCount ?? ""} />
        <TextField name="adminContact" label="Admin contact" defaultValue={channel?.adminContact ?? ""} />
        <TextField
          name="cadenceDays"
          label="Post every (days)"
          type="number"
          min={1}
          max={365}
          defaultValue={channel?.cadenceDays ?? ""}
          description="Leave blank for no schedule."
        />
        <TextField name="lastPostedAt" label="Last posted" type="date" defaultValue={toDateInput(channel?.lastPostedAt)} />
        <SelectField name="ambassadorId" label="Ambassador" options={ambassadors} noneLabel="None" defaultValue={channel?.ambassadorId} />
      </FormGrid>
      <TextareaField name="notes" label="Notes" rows={3} defaultValue={channel?.notes ?? ""} />
      <FormActions>
        <SubmitButton>{channel ? "Save channel" : "Add channel"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
