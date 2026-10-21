import { ToneBadge, type Tone } from "@/components/admin/badges";
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/lib/db/enums";

const TONE: Record<InvoiceStatus, Tone> = { draft: "neutral", sent: "info", paid: "success", void: "danger" };

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <ToneBadge tone={TONE[status]}>{INVOICE_STATUS_LABELS[status]}</ToneBadge>;
}
