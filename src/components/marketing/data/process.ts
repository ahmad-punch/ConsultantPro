/**
 * The case lifecycle, from docs/BUSINESS-PLAN.md section 2.2. Turnarounds
 * come from src/lib/pricing.ts where a product sets them.
 */
import { getProduct } from "@/lib/pricing";

export interface ProcessStep {
  id: string;
  title: string;
  summary: string;
  detail: string[];
  output: string;
  timing: string;
  who: string;
}

export const processSteps: ProcessStep[] = [
  {
    id: "intake",
    title: "Intake",
    summary: "Tell us who, what, where and how urgent, through the form or on WhatsApp.",
    detail: [
      "A short web form, then a WhatsApp conversation if you prefer to talk.",
      "We ask which documents you have. You do not need to send originals.",
      "Nothing to pay at this stage.",
    ],
    output: "Your case file is opened and you get a reference.",
    timing: "We aim to reply the same working day.",
    who: "Case manager",
  },
  {
    id: "triage",
    title: "Triage",
    summary: "We work out the category, the office or court that owns it, and how serious it is.",
    detail: [
      "Land, inheritance, power of attorney, tax, NADRA, company, FIR or court.",
      "Which forum can act: OPC, special court, civil court, NADRA, FBR or a complaint cell.",
      "We recommend the smallest product that answers your question, with its price, before you pay.",
    ],
    output: "A short triage note and a recommended next step.",
    timing: "Usually alongside the first reply.",
    who: "Case manager, with an advocate check on legal matters",
  },
  {
    id: "memo",
    title: "Pathway Memo",
    summary: "A written plan in plain English: the problem, who owns it, remedies, timelines, costs and traps.",
    detail: [
      "We read your documents and write the memo. Urdu on request.",
      "An independent partner advocate reviews the legal content.",
      "A 45-minute call to walk you through it and answer questions.",
    ],
    output: "Your Pathway Memo, as a document you keep.",
    timing: getProduct("assessment").turnaround,
    who: "Case manager drafts, partner advocate reviews",
  },
  {
    id: "managed",
    title: "Managed execution",
    summary: "If you want, we run the case with an independent advocate you retain directly.",
    detail: [
      "You sign an engagement letter with the advocate and pay them directly.",
      "We agree a milestone plan, then handle documents, scheduling, errands and chasing.",
      "You pay our project fee in stages and never prepay more than the next stage.",
    ],
    output: "A milestone plan agreed before work starts.",
    timing: "Depends on the office or court. The memo gives the realistic range.",
    who: "Case manager, partner advocate, errand runner",
  },
  {
    id: "updates",
    title: "Tracked updates",
    summary: "Written updates at every milestone and on a fixed schedule, even when nothing has moved.",
    detail: [
      "A named case manager is your single point of contact.",
      "Every update is written down and kept in your case folder.",
      "When the case closes you get a closing summary and all documents handed back.",
    ],
    output: "An update log, then a closing summary and handover.",
    timing: getProduct("managed").turnaround,
    who: "Case manager",
  },
];
