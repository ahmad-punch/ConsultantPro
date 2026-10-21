/**
 * Payment link helpers. A Stripe Payment Link accepts `client_reference_id`
 * as a query parameter; the Stripe webhook reads it back to match the
 * payment to the case.
 */
import { site } from "@/lib/site";

/** The case's payment link with `client_reference_id=<caseNumber>` added for Stripe links. */
export function paymentLinkForCase(c: { caseNumber: string; paymentLink: string | null }): string | null {
  const link = c.paymentLink?.trim();
  if (!link || !/^https?:\/\//i.test(link)) return null;
  try {
    const url = new URL(link);
    if (/(^|\.)stripe\.com$/i.test(url.hostname)) {
      url.searchParams.set("client_reference_id", c.caseNumber);
    }
    return url.toString();
  } catch {
    return null;
  }
}

/** Full URL of the client status page for a case. */
export function caseStatusUrl(publicToken: string): string {
  return `${site.url.replace(/\/$/, "")}/c/${publicToken}`;
}
