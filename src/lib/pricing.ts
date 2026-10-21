/**
 * The only price list (CLAUDE.md: "Prices live in one place").
 * Source: docs/BUSINESS-PLAN.md sections 2.3, 2.4 and 4.2. All prices are
 * launch assumptions in whole US dollars. Never hardcode a price elsewhere:
 * import from here and render with `formatPrice()`.
 */
import type { ProductType, RetainerTier } from "@/lib/db/enums";

export type OneOffProductId = Exclude<ProductType, "retainer">;
export type RetainerTierId = RetainerTier;
export type OfferingId = OneOffProductId | RetainerTierId;

export type PriceUnit = "one-off" | "per project" | "per errand" | "per month";

export interface Offering {
  id: OfferingId;
  /** The `product` enum value used on cases and payments. */
  product: ProductType;
  kind: "product" | "retainer";
  name: string;
  /** One sentence for cards and tables. */
  summary: string;
  /** Fixed price in USD. Set for fixed-price items. */
  price?: number;
  /** Lowest price in USD for ranged items (displayed "from $X"). */
  priceFrom?: number;
  /** Highest price in USD for ranged items. */
  priceTo?: number;
  /** Typical price in USD for ranged items (plan assumption). */
  typicalPrice?: number;
  unit: PriceUnit;
  turnaround: string;
  includes: string[];
  excludes: string[];
  /** Costs paid on top of our fee, stated next to the price. */
  extraCosts?: string;
  /** Name of the env var holding the Stripe payment link. */
  stripeLinkEnv: string;
}

export const products = [
  {
    id: "question",
    product: "question",
    kind: "product",
    name: "Pathway Question",
    summary: "One clear question, answered in writing by a case manager.",
    price: 15,
    unit: "one-off",
    turnaround: "Written answer within 48 hours",
    includes: [
      "A written answer to one specific question",
      "Which office or forum owns the problem",
      "The next step to take and what it usually costs",
    ],
    excludes: [
      "Review of documents",
      "Legal advice or a legal opinion",
      "Contact with any office on your behalf",
    ],
    stripeLinkEnv: "NEXT_PUBLIC_STRIPE_LINK_QUESTION",
  },
  {
    id: "call",
    product: "call",
    kind: "product",
    name: "Pathway Call",
    summary: "30 minutes with a case manager and the relevant expert.",
    price: 49,
    unit: "one-off",
    turnaround: "30-minute video or WhatsApp call, booked at a time that suits your time zone",
    includes: [
      "30-minute call with a case manager and the relevant expert",
      "Short written summary of the next steps after the call",
    ],
    excludes: [
      "Written Pathway Memo",
      "Detailed document review",
      "Legal advice in our name (advocates advise and bill directly)",
    ],
    stripeLinkEnv: "NEXT_PUBLIC_STRIPE_LINK_CALL",
  },
  {
    id: "assessment",
    product: "assessment",
    kind: "product",
    name: "Case Assessment",
    summary: "We read your documents and write your Pathway Memo, then walk you through it.",
    price: 249,
    unit: "one-off",
    turnaround: "Pathway Memo within 5 working days of receiving your documents",
    includes: [
      "Review of your documents",
      "Written Pathway Memo: the problem, who owns it, remedies, realistic timelines, costs and traps",
      "45-minute call to walk through the memo",
      "Legal content reviewed by an independent partner advocate",
    ],
    excludes: [
      "Running the case (see Managed Case)",
      "Advocate fees for any court or legal work",
      "Government fees",
    ],
    stripeLinkEnv: "NEXT_PUBLIC_STRIPE_LINK_ASSESSMENT",
  },
  {
    id: "managed",
    product: "managed",
    kind: "product",
    name: "Managed Case",
    summary: "We project-manage your case to closure with an independent partner advocate.",
    priceFrom: 400,
    priceTo: 1500,
    typicalPrice: 700,
    unit: "per project",
    turnaround: "Fixed milestone plan; written update at least every 14 days, even when nothing has moved",
    includes: [
      "Milestone plan agreed before work starts",
      "Documents, scheduling, errands and chasing",
      "Written updates at every milestone and at least every 14 days",
      "Closing summary and handover of all documents",
      "Fees charged in stages: you never prepay more than the next stage",
    ],
    excludes: [
      "Advocate's fees, billed to you directly by the advocate",
      "Government and court fees",
      "Any promise of an outcome",
    ],
    extraCosts: "Plus advocate's fees, billed directly by the advocate",
    stripeLinkEnv: "NEXT_PUBLIC_STRIPE_LINK_MANAGED",
  },
  {
    id: "errand",
    product: "errand",
    kind: "product",
    name: "Errand",
    summary:
      "NADRA/NICOP, HEC/MOFA/IBCC attestation, FBR filer/NTN, SECP, land-record and court-record copies.",
    priceFrom: 35,
    priceTo: 75,
    typicalPrice: 50,
    unit: "per errand",
    turnaround: "Quoted before we start; timeline depends on the office involved",
    includes: [
      "A fixed, published fee agreed before we start",
      "Collection and submission of documents",
      "Receipts for every government fee paid",
    ],
    excludes: ["Government fees (charged at cost, with receipts)", "Courier costs abroad"],
    extraCosts: "Plus government fees at cost",
    stripeLinkEnv: "NEXT_PUBLIC_STRIPE_LINK_ERRAND",
  },
] as const satisfies readonly Offering[];

export const retainerTiers = [
  {
    id: "watch",
    product: "retainer",
    kind: "retainer",
    name: "Watch",
    summary: "Someone keeps an eye on your property and answers your questions.",
    price: 79,
    unit: "per month",
    turnaround: "Questions answered within 48 hours",
    includes: ["Quarterly land-record check", "2 Pathway Questions a month"],
    excludes: ["Calls", "Errands", "Advocate fees"],
    stripeLinkEnv: "NEXT_PUBLIC_STRIPE_LINK_RETAINER_WATCH",
  },
  {
    id: "plus",
    product: "retainer",
    kind: "retainer",
    name: "Plus",
    summary: "Everything in Watch, plus a monthly call and an errand.",
    price: 149,
    unit: "per month",
    turnaround: "Priority handling on questions and errands",
    includes: [
      "Everything in Watch",
      "Monthly call",
      "1 errand a month",
      "Priority handling",
    ],
    excludes: ["Advocate fees", "Government fees"],
    stripeLinkEnv: "NEXT_PUBLIC_STRIPE_LINK_RETAINER_PLUS",
  },
  {
    id: "family_office",
    product: "retainer",
    kind: "retainer",
    name: "Family Office",
    summary: "A dedicated manager for your family's affairs in Pakistan.",
    price: 249,
    unit: "per month",
    turnaround: "Dedicated manager; priority on everything",
    includes: [
      "Everything in Plus (quarterly land-record check, monthly call, priority handling)",
      "Dedicated case manager",
      "Unlimited Pathway Questions",
      "2 errands a month",
      "Annual tax-filing coordination",
    ],
    excludes: ["Advocate fees", "Government fees"],
    stripeLinkEnv: "NEXT_PUBLIC_STRIPE_LINK_RETAINER_FAMILY_OFFICE",
  },
] as const satisfies readonly Offering[];

export const offerings: readonly Offering[] = [...products, ...retainerTiers];

/**
 * Stripe payment links. NEXT_PUBLIC_* variables are inlined at build time
 * only when referenced literally, so each one is spelled out here.
 */
const stripeLinks: Record<OfferingId, string | undefined> = {
  question: process.env.NEXT_PUBLIC_STRIPE_LINK_QUESTION,
  call: process.env.NEXT_PUBLIC_STRIPE_LINK_CALL,
  assessment: process.env.NEXT_PUBLIC_STRIPE_LINK_ASSESSMENT,
  managed: process.env.NEXT_PUBLIC_STRIPE_LINK_MANAGED,
  errand: process.env.NEXT_PUBLIC_STRIPE_LINK_ERRAND,
  watch: process.env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_WATCH,
  plus: process.env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_PLUS,
  family_office: process.env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_FAMILY_OFFICE,
};

/** Look up a product or retainer tier by id. Throws on an unknown id. */
export function getProduct(id: OfferingId): Offering {
  const offering = offerings.find((o) => o.id === id);
  if (!offering) throw new Error(`Unknown offering: ${id}`);
  return offering;
}

/** Format whole US dollars: 1500 -> "$1,500". */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Display price: "$15", "from $400", "$79 / month".
 * `withUnit: false` drops the "/ month" suffix on retainers.
 */
export function formatPrice(
  idOrOffering: OfferingId | Offering,
  options: { withUnit?: boolean } = {},
): string {
  const o = typeof idOrOffering === "string" ? getProduct(idOrOffering) : idOrOffering;
  const { withUnit = true } = options;
  const base =
    o.price !== undefined ? formatUsd(o.price) : `from ${formatUsd(o.priceFrom ?? 0)}`;
  return withUnit && o.unit === "per month" ? `${base} / month` : base;
}

/** Range text for ranged items: "$400-$1,500". Falls back to formatPrice. */
export function formatPriceRange(idOrOffering: OfferingId | Offering): string {
  const o = typeof idOrOffering === "string" ? getProduct(idOrOffering) : idOrOffering;
  if (o.priceFrom !== undefined && o.priceTo !== undefined) {
    return `${formatUsd(o.priceFrom)}-${formatUsd(o.priceTo)}`;
  }
  return formatPrice(o);
}

/** The Stripe payment link for an offering, or null when not configured. */
export function getStripeLink(id: OfferingId): string | null {
  const link = stripeLinks[id];
  return link && link.startsWith("http") ? link : null;
}

/** Default price for a new case of a given product (fixed price or range minimum). */
export function defaultPriceUsd(id: OfferingId): number {
  const o = getProduct(id);
  return o.price ?? o.priceFrom ?? 0;
}
