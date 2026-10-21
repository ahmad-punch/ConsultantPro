import { ArrowRightIcon, CreditCardIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getStripeLink, type OfferingId } from "@/lib/pricing";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Stripe payment link when configured, otherwise "Pay on invoice", which
 * sends the visitor to the intake form.
 */
export function PayButton({
  id,
  name,
  featured = false,
  className,
}: {
  id: OfferingId;
  name: string;
  featured?: boolean;
  className?: string;
}) {
  const link = getStripeLink(id);
  const base = cn("h-11 w-full text-sm", className);
  if (link) {
    return (
      <Button asChild variant={featured ? "default" : "outline"} className={base}>
        <a href={link} rel="noopener noreferrer" target="_blank" aria-label={`Pay for ${name} by card (opens a secure payment page)`}>
          <CreditCardIcon data-icon="inline-start" />
          Pay by card
        </a>
      </Button>
    );
  }
  return (
    <Button asChild variant={featured ? "default" : "outline"} className={base}>
      <Link href={`${site.cta.href}?product=${id}`} aria-label={`Pay on invoice for ${name}: start with the intake form`}>
        Pay on invoice
        <ArrowRightIcon data-icon="inline-end" />
      </Link>
    </Button>
  );
}
