import {
  FileTextIcon,
  FolderLockIcon,
  LayersIcon,
  ReceiptTextIcon,
  ScaleIcon,
  UserRoundCheckIcon,
} from "lucide-react";

import { formatPrice } from "@/lib/pricing";

const items = [
  {
    icon: ReceiptTextIcon,
    title: "Fixed, published prices",
    body: `Every price is on the page before you ask. A written answer is ${formatPrice("question")}; a full Pathway Memo is ${formatPrice("assessment")}.`,
  },
  {
    icon: LayersIcon,
    title: "Pay per stage",
    body: "You pay for one step at a time and never prepay more than the next stage. Receipts every time.",
  },
  {
    icon: FileTextIcon,
    title: "A written memo, not a promise",
    body: "You hold a document that sets out the problem, the options, the costs and the traps.",
  },
  {
    icon: UserRoundCheckIcon,
    title: "A named case manager",
    body: "One accountable person per case, on video or WhatsApp, with updates in writing.",
  },
  {
    icon: ScaleIcon,
    title: "Independent advocates",
    body: "Legal advice comes from an advocate you retain, who bills you directly. We take no cut.",
  },
  {
    icon: FolderLockIcon,
    title: "Your documents stay in your Drive",
    body: "Files live in a Google Drive folder you control. We keep links, not copies, and share only with your agreement.",
  },
];

export function TrustStack() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, title, body }) => (
        <li key={title} className="bg-card p-6 sm:p-8">
          <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <h3 className="mt-5 font-display text-xl font-medium text-primary">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </li>
      ))}
    </ul>
  );
}
