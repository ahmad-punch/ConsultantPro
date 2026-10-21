import { CheckIcon, MinusIcon } from "lucide-react";

import { formatPrice, formatPriceRange, type Offering } from "@/lib/pricing";
import { cn } from "@/lib/utils";

import { PayButton } from "./pay-button";

/** Full catalogue card: price, turnaround, inclusions, exclusions, pay button. */
export function OfferingCard({
  offering,
  featured = false,
  badge,
}: {
  offering: Offering;
  featured?: boolean;
  badge?: string;
}) {
  const ranged = offering.priceFrom !== undefined && offering.priceTo !== undefined;
  return (
    <article
      aria-labelledby={`offering-${offering.id}`}
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-card p-6 sm:p-7",
        featured && "border-primary/40 shadow-[0_24px_48px_-28px_rgb(15_61_46/0.45)] ring-1 ring-primary/15",
      )}
    >
      {badge ? (
        <span className="absolute -top-3 left-6 rounded-full bg-highlight px-3 py-1 text-xs font-semibold text-highlight-foreground">
          {badge}
        </span>
      ) : null}
      <h3 id={`offering-${offering.id}`} className="font-display text-2xl font-medium text-primary">
        {offering.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{offering.summary}</p>

      <div className="mt-6 border-t pt-6">
        <p className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-medium tracking-tight text-foreground">
            {formatPrice(offering, { withUnit: false })}
          </span>
          <span className="text-sm text-muted-foreground">{offering.unit}</span>
        </p>
        {ranged ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Typical range {formatPriceRange(offering)}, quoted in writing before you start.
          </p>
        ) : null}
        {offering.extraCosts ? (
          <p className="mt-2 text-sm font-medium text-highlight">{offering.extraCosts}</p>
        ) : null}
        <p className="mt-3 text-sm text-foreground/80">{offering.turnaround}</p>
      </div>

      <div className="mt-6 grid gap-5 text-sm">
        <div>
          <h4 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Included</h4>
          <ul className="mt-3 space-y-2">
            {offering.includes.map((item) => (
              <li key={item} className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Not included</h4>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            {offering.excludes.map((item) => (
              <li key={item} className="flex gap-2.5">
                <MinusIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-auto pt-7">
        <PayButton id={offering.id} name={offering.name} featured={featured} />
      </div>
    </article>
  );
}
