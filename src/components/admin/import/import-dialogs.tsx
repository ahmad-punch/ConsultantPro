"use client";

import { importChannelsAction, previewChannelImportAction } from "@/lib/actions/channels";
import { importLeadsAction, previewLeadImportAction } from "@/lib/actions/leads";
import { CHANNEL_IMPORT_COLUMNS, LEAD_IMPORT_COLUMNS } from "@/lib/validation/imports";

import { CsvImportDialog } from "./csv-import-dialog";

export function ImportChannelsDialog() {
  return (
    <CsvImportDialog
      noun="channels"
      columns={CHANNEL_IMPORT_COLUMNS}
      preview={previewChannelImportAction}
      run={importChannelsAction}
    />
  );
}

export function ImportLeadsDialog() {
  return (
    <CsvImportDialog noun="leads" columns={LEAD_IMPORT_COLUMNS} preview={previewLeadImportAction} run={importLeadsAction} />
  );
}
