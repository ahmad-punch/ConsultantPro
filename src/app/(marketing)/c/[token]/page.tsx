import {
  CreditCardIcon,
  FileTextIcon,
  FolderOpenIcon,
  MessageCircleIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { clientStageLabel, StatusStepper } from "@/components/marketing/case-status/status-stepper";
import { Container, Eyebrow } from "@/components/marketing/primitives";
import { Button } from "@/components/ui/button";
import { PAYMENT_STATUS_LABELS, PRODUCT_LABELS, type CaseStage } from "@/lib/db/enums";
import { paymentLinkForCase } from "@/lib/payments/links";
import { getPublicCase } from "@/lib/queries/public-case";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your case",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const NEXT_BY_STAGE: Record<CaseStage, string> = {
  intake: "We have your request. A case manager will read it and reply on WhatsApp, usually the same working day.",
  triage: "A case manager is reviewing your situation and will confirm the right step and its price.",
  memo_drafting: "We are researching your case and writing your plan in plain English.",
  memo_delivered: "Your plan is ready. Read it and message us on WhatsApp with any questions or to take the next step.",
  managed: "We are managing your case step by step. We will update you here and on WhatsApp as things move.",
  errand_in_progress: "Your errand is in progress. We will message you when it is done.",
  closed: "This case is closed. Message us on WhatsApp if anything new comes up.",
  declined: "We were not able to take this case on. Message us on WhatsApp if you would like to talk it through.",
};

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function CaseStatusPage({ params }: PageProps<"/c/[token]">) {
  return (
    <Suspense fallback={<section className="min-h-[60vh] bg-card" aria-busy="true" />}>
      <CaseStatus params={params} />
    </Suspense>
  );
}

async function CaseStatus({ params }: { params: PageProps<"/c/[token]">["params"] }) {
  const { token } = await params;
  const c = await getPublicCase(token);
  if (!c) notFound();

  const payLink = c.paymentStatus === "unpaid" ? paymentLinkForCase(c) : null;
  const wa = whatsappLink(`Hello, I have a question about case ${c.caseNumber}.`);
  const isDeclined = c.stage === "declined";

  return (
    <section className="bg-card">
      <Container className="max-w-3xl py-10 sm:py-16">
        <Eyebrow>Case status</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-primary sm:text-4xl">
          {c.firstName ? `${c.firstName}, here is where your case stands.` : "Here is where your case stands."}
        </h1>
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div>
            <dt className="inline">Case </dt>
            <dd className="inline font-mono text-foreground">{c.caseNumber}</dd>
          </div>
          <div>
            <dt className="sr-only">Service</dt>
            <dd className="text-foreground">{PRODUCT_LABELS[c.product]}</dd>
          </div>
          <div>
            <dt className="inline">Opened </dt>
            <dd className="inline text-foreground">{dateFormat.format(c.createdAt)}</dd>
          </div>
        </dl>

        <div className="mt-8 rounded-2xl border bg-background p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-primary">
            {isDeclined ? "Status: not taken on" : `Now: ${clientStageLabel(c.stage)}`}
          </h2>
          {!isDeclined ? (
            <div className="mt-5">
              <StatusStepper product={c.product} stage={c.stage} />
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-2xl border border-highlight/40 bg-highlight/5 p-5 sm:p-6">
          <h2 className="font-display text-xl font-medium text-primary">What happens next</h2>
          <p className="mt-2 leading-relaxed">{c.nextAction || NEXT_BY_STAGE[c.stage]}</p>
          {c.nextAction && c.nextActionDue ? (
            <p className="mt-1 text-sm text-muted-foreground">Expected by {dateFormat.format(c.nextActionDue)}</p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {c.memoDocUrl ? (
            <Button asChild className="h-11 w-full">
              <a href={c.memoDocUrl} target="_blank" rel="noopener noreferrer">
                <FileTextIcon data-icon="inline-start" />
                Read your plan
              </a>
            </Button>
          ) : null}
          {payLink ? (
            <Button asChild className="h-11 w-full">
              <a href={payLink} target="_blank" rel="noopener noreferrer" aria-label="Pay now by card (opens a secure payment page)">
                <CreditCardIcon data-icon="inline-start" />
                Pay now
              </a>
            </Button>
          ) : null}
          {c.driveFolderUrl ? (
            <Button asChild variant="outline" className="h-11 w-full">
              <a href={c.driveFolderUrl} target="_blank" rel="noopener noreferrer">
                <FolderOpenIcon data-icon="inline-start" />
                Your documents folder
              </a>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="h-11 w-full">
            <a href={wa} target={wa.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
              <MessageCircleIcon data-icon="inline-start" />
              Message us on WhatsApp
            </a>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <h2 className="text-sm font-semibold text-primary">Payment</h2>
            <p className="mt-2 text-sm">
              {PAYMENT_STATUS_LABELS[c.paymentStatus]}
              {c.paymentStatus === "unpaid" && !payLink ? (
                <span className="block text-muted-foreground">We will send payment details on WhatsApp.</span>
              ) : null}
            </p>
          </div>
          <div className="sm:col-span-2">
            <h2 className="text-sm font-semibold text-primary">Latest updates</h2>
            {c.notes.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No updates yet.</p>
            ) : (
              <ol className="mt-3 space-y-4 border-l pl-4">
                {c.notes.map((n) => (
                  <li key={n.id}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{n.body}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{dateFormat.format(n.createdAt)}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <p className="mt-10 border-t pt-6 text-xs leading-relaxed text-muted-foreground">
          {site.disclaimer} This page is private to you; please do not share the link.
        </p>
      </Container>
    </section>
  );
}
