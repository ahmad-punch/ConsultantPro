import { isPlaceholder, site } from "@/lib/site";

/** Renders a JSON-LD block. `<` is escaped so content cannot close the tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** schema.org Organization for the whole public site. */
export function organizationJsonLd(): Record<string, unknown> {
  const sameAs = Object.values(site.socials).filter((url) => !isPlaceholder(url));
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    alternateName: site.urduName,
    url: site.url,
    logo: new URL("/icon.svg", site.url).toString(),
    description: site.description,
    slogan: site.tagline,
    ...(isPlaceholder(site.email) ? {} : { email: site.email }),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** schema.org FAQPage from plain question/answer pairs. */
export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
