import { CheckIcon } from "lucide-react";

import { CASE_STAGE_LABELS, type CaseStage, type ProductType } from "@/lib/db/enums";
import { cn } from "@/lib/utils";
import { stagePath } from "@/lib/validation/cases";

/** Client-facing names for the stages. Same order as the control panel. */
const CLIENT_STAGE_LABELS: Partial<Record<CaseStage, string>> = {
  intake: "Received",
  triage: "Reviewing",
  memo_drafting: "Writing your plan",
  memo_delivered: "Plan delivered",
  managed: "Managing your case",
  errand_in_progress: "Errand in progress",
  closed: "Closed",
};

export function clientStageLabel(stage: CaseStage): string {
  return CLIENT_STAGE_LABELS[stage] ?? CASE_STAGE_LABELS[stage];
}

/** Vertical on phones, horizontal from `sm` up. */
export function StatusStepper({ product, stage }: { product: ProductType; stage: CaseStage }) {
  const path = stagePath(product);
  const current = path.indexOf(stage);
  const declined = stage === "declined";
  return (
    <ol className="grid gap-3 sm:flex sm:gap-0" aria-label="Case progress">
      {path.map((s, i) => {
        const isDone = !declined && (i < current || (s === "closed" && stage === "closed"));
        const isCurrent = !declined && i === current && s !== "closed";
        return (
          <li key={s} className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:items-start sm:gap-2">
            <div className="flex items-center sm:w-full">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-highlight bg-highlight/15 text-primary ring-4 ring-highlight/15",
                  !isDone && !isCurrent && "border-border bg-background text-muted-foreground",
                )}
                aria-hidden
              >
                {isDone ? <CheckIcon className="size-3.5" /> : i + 1}
              </span>
              {i < path.length - 1 ? (
                <span
                  className={cn("mx-2 hidden h-px flex-1 sm:block", isDone ? "bg-primary" : "bg-border")}
                  aria-hidden
                />
              ) : null}
            </div>
            <span
              className={cn(
                "text-sm sm:pr-3",
                isCurrent ? "font-semibold text-primary" : isDone ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {clientStageLabel(s)}
              {isCurrent ? <span className="sr-only"> (current step)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
