import { HelpButton } from "@/components/admin/help-button";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
  helpTopic,
  helpSection,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
  /** Screen help file name (docs/help/screens/<topic>.md); renders a HelpButton by the title. */
  helpTopic?: string;
  /** Optional section slug within that file. */
  helpSection?: string | string[];
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow ? <div className="text-xs font-medium text-muted-foreground">{eyebrow}</div> : null}
        {helpTopic ? (
          <div className="flex items-center gap-1.5">
            <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-balance">{title}</h1>
            <HelpButton topic={helpTopic} section={helpSection} />
          </div>
        ) : (
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        )}
        {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-sm font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}
