/**
 * Brand values. The only place the name, tagline, contact details and legal
 * lines live (decision 0002). Values starting with "TODO:" are placeholders:
 * render them visibly or hide the element with `isPlaceholder()`.
 */

export type NavLink = { label: string; href: string };

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "TODO";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "TODO: contact email";

export const site = {
  name: "Rasta",
  urduName: "راستہ",
  tagline: "Your family's affairs in Pakistan, handled properly.",
  description:
    "Fixed-price help for overseas Pakistanis with property, inheritance, tax, NADRA and paperwork problems back home. A written plan in plain English, independent advocates, tracked to closure.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "en",

  /** International format, digits only (e.g. 447700900000). "TODO" until set. */
  whatsappNumber,
  email: contactEmail,

  legalEntity:
    "TODO: Legal entity name, company number and registered address (UK Ltd or US LLC, decision open).",
  disclaimer:
    "Rasta is not a law firm. We provide general information, case management and errands. This is general information, not legal advice. Legal advice is given and billed directly by independent advocates.",

  nav: [
    { label: "How it works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Guides", href: "/guides" },
    { label: "FAQ", href: "/faq" },
    { label: "About", href: "/about" },
  ] satisfies NavLink[],
  cta: { label: "Start a case", href: "/start" } satisfies NavLink,
  footerNav: [
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
    { label: "Disclaimer", href: "/legal/disclaimer" },
  ] satisfies NavLink[],

  socials: {
    facebook: "TODO: Facebook page URL",
    youtube: "TODO: YouTube channel URL",
    linkedin: "TODO: LinkedIn page URL",
    instagram: "TODO: Instagram URL",
  },
} as const;

export type Site = typeof site;

/** True for unset placeholder values ("TODO" or "TODO: ..."). */
export function isPlaceholder(value: string | null | undefined): boolean {
  return !value || value.trim().toUpperCase().startsWith("TODO");
}

/** True once NEXT_PUBLIC_WHATSAPP_NUMBER is configured. */
export const hasWhatsapp = !isPlaceholder(site.whatsappNumber);

/**
 * A wa.me link with a prefilled message. Falls back to the intake form
 * (`/start`) while the WhatsApp number is a placeholder.
 */
export function whatsappLink(message?: string): string {
  if (!hasWhatsapp) return site.cta.href;
  const digits = site.whatsappNumber.replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

/** mailto: link for the contact email, or `/start` while it is a placeholder. */
export function emailLink(subject?: string): string {
  if (isPlaceholder(site.email)) return site.cta.href;
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${site.email}${query}`;
}
