/**
 * Public FAQ. Adapted from marketing/faq-responses.md and
 * marketing/objection-handling.md. Prices come from src/lib/pricing.ts.
 * Answers are plain text (they also feed the FAQPage JSON-LD).
 */
import { formatPrice, formatPriceRange, getProduct } from "@/lib/pricing";
import { site } from "@/lib/site";

export interface Faq {
  id: string;
  question: string;
  answer: string;
  /** Optional link shown under the answer. */
  link?: { label: string; href: string };
  /** Visible placeholder for an undecided detail ("TODO: ..."). Not sent to JSON-LD. */
  todo?: string;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: Faq[];
}

const q = formatPrice("question");
const call = formatPrice("call");
const assessment = formatPrice("assessment");
const managed = formatPrice("managed");
const errand = formatPrice("errand");
const watch = formatPrice("watch");
const memoTurnaround = getProduct("assessment").turnaround;

export const faqGroups: FaqGroup[] = [
  {
    id: "about",
    title: "About us",
    items: [
      {
        id: "law-firm",
        question: "Are you a law firm? Are you lawyers?",
        answer: `No. ${site.name} is a navigation and case-management service. We explain the problem, write the plan, run errands and track the case. When you need legal advice or a court appearance, we connect you to an independent advocate who is retained by you and bills you directly. Our information is general, not legal advice.`,
      },
      {
        id: "why-listen",
        question: "If you are not lawyers, why should I listen to you?",
        answer:
          "We say it openly. We give general information and organise cases. Legal advice comes from an independent advocate you retain. We are useful where lawyers often are not: clear prices, plain English, written plans and regular updates. In a Case Assessment, the legal content of your memo is reviewed by a partner advocate.",
      },
      {
        id: "cousin-lawyer",
        question: "Why not just use my cousin's lawyer?",
        answer:
          "Keep your lawyer if you trust them. We do a different job: we work out which office owns the problem, which documents you need, what it will cost, and what has happened since the last hearing. Many people also want an independent second view before trusting one person with a large asset.",
      },
      {
        id: "shortcut",
        question: "Can you make this go away quickly?",
        answer:
          "We follow the official process only. We do not arrange shortcuts and we do not try. If you want the fastest lawful route, we can show you which one it is and what usually slows each route down.",
      },
      {
        id: "new",
        question: "You are new. Where are the reviews?",
        answer: `True, we are new. We will not invent reviews or claim numbers we do not have. We collect feedback when each case closes and publish it only with written consent. Until then, the best evidence is our published prices, our free guides and a low-cost first step: a ${q} written answer.`,
      },
    ],
  },
  {
    id: "prices",
    title: "Prices and payment",
    items: [
      {
        id: "how-much",
        question: "How much do you charge?",
        answer: `Pathway Question ${q}. Pathway Call ${call}. Case Assessment ${assessment}. Managed Case ${managed} plus advocate fees, which the advocate bills directly. Errands ${errand} plus government fees at cost. Monthly plans ${watch}. You pay one step at a time.`,
        link: { label: "See the full price list", href: "/pricing" },
      },
      {
        id: "how-pay",
        todo: "TODO: confirm Wise and Payoneer before launch",
        question: "How do I pay?",
        answer:
          "By card through a secure payment link, with a receipt every time. Where card does not work for you, we can arrange Wise or Payoneer. We never ask for cash or for payment to a personal account.",
      },
      {
        id: "trust-money",
        question: "How do I know you will not run away with my money?",
        answer: `You should ask that. You pay one step at a time and never prepay more than the next stage. The first step costs ${q} or ${call}. We never hold money for a property purchase, and advocate fees go straight from you to the advocate.`,
      },
      {
        id: "expensive",
        question: "It sounds expensive.",
        answer: `Many firms serving overseas clients say "contact us for a quote". Our prices are published, and you can start with one written answer for ${q}. If you only need one thing done, an errand is ${errand} plus government fees at cost.`,
      },
      {
        id: "advocate-fees",
        question: "Why are advocate fees separate?",
        answer:
          "Because the advocate is independent and works for you, not for us. You agree the fee with the advocate and pay them directly. We never take a cut of advocate fees. This keeps the advice independent and follows Bar Council rules.",
      },
    ],
  },
  {
    id: "cases",
    title: "Cases and timelines",
    items: [
      {
        id: "how-long",
        question: "How long will it take?",
        answer: `A Pathway Question gets a written answer within 48 hours. A Case Assessment: ${memoTurnaround.toLowerCase()}. How long the case itself takes depends on the office or court, which set their own pace. We cannot promise dates, but the memo gives you the realistic range.`,
      },
      {
        id: "guarantee",
        question: "Do you guarantee results?",
        answer:
          "No. No honest provider can guarantee what an office or court will do, so be careful of anyone who does. We promise a clear written answer or plan, published prices, a named case manager and regular updates.",
      },
      {
        id: "unhappy",
        todo: "TODO: confirm refund wording with counsel",
        question: "What if I am not happy?",
        answer:
          "If we do not deliver your Pathway Memo in the stated time, you get a full refund. We do not refund based on what a court or office decides, because nobody controls that. Tell your case manager first; most problems are fixed by talking.",
        link: { label: "Read the refund policy", href: "/how-it-works#refunds" },
      },
      {
        id: "do-it-myself",
        question: "Can I not do this myself on the government portal?",
        answer:
          "Often you can, and some routes are free: the Overseas Pakistanis Commission, the Citizen's Portal and the OPF complaint cell take complaints at no cost, and HEC attestation is online. We will tell you when the free route is enough. People come to us when time is short, the process is confusing, or several offices are involved and nobody tracks the whole case.",
      },
      {
        id: "court-abroad",
        question: "I live abroad. Can a Pakistani court still help me?",
        answer:
          "Generally yes. Living abroad does not remove your rights. You usually act through an advocate and a valid power of attorney, and some courts allow evidence by video link. We cannot promise an outcome or a date.",
        link: { label: "How a civil court case works", href: "/guides/how-a-civil-court-case-works" },
      },
      {
        id: "fir-abroad",
        question: "Can I file an FIR from abroad, or must I fly back?",
        answer:
          "You generally do not have to fly back. Complaints can go through an authorised relative or advocate, or through the overseas complaint cells some provinces and the FIA run. We give general information only. An independent advocate advises on the case and handles anything of substance.",
        link: { label: "FIR basics for overseas families", href: "/guides/fir-basics-for-overseas-families" },
      },
    ],
  },
  {
    id: "property",
    title: "Property and inheritance",
    items: [
      {
        id: "transfer",
        question: "My father died. How do I transfer his property to my name from abroad?",
        answer:
          "Usually two stages. First a succession certificate, which NADRA issues if all heirs agree; heirs abroad can give biometrics at a Pakistani mission. Second, mutation, which updates the land record. Do not sell before mutation.",
        link: {
          label: "Succession certificate guide",
          href: "/guides/succession-certificate-inheritance-from-abroad",
        },
      },
      {
        id: "poa-safe",
        question: "Is it safe to give someone power of attorney?",
        answer:
          "It can be, if you limit it. Use a special power of attorney for one task, set an end date, require that money goes to your own account, and check the land record every few months. A broad power of attorney to one person is the most common source of loss.",
        link: { label: "Power of attorney guide", href: "/guides/power-of-attorney-from-abroad" },
      },
      {
        id: "occupied",
        question: "Where do I complain if my property was occupied?",
        answer:
          "Official options include the Overseas Pakistanis Commission in Punjab, the Pakistan Citizen's Portal and the OPF complaint cell. These are free. Never pay anyone to lodge them. Court routes also exist, including the new special courts for overseas property.",
        link: { label: "Illegal occupation (qabza) guide", href: "/guides/illegal-occupation-qabza-what-to-do" },
      },
    ],
  },
  {
    id: "privacy",
    title: "Documents and privacy",
    items: [
      {
        id: "family-find-out",
        question: "My family must not find out. Is my information safe?",
        answer:
          "We talk only to you about your case. Documents stay in a private Google Drive folder, ideally your own, and we share them only with the advocate or errand runner who needs them, with your agreement. We never discuss your case in groups.",
        link: { label: "Read the privacy notice", href: "/legal/privacy" },
      },
      {
        id: "originals",
        question: "Do you keep my original documents?",
        answer:
          "No. We work from copies and links. Originals stay with you or with the advocate who needs them for a filing. We do not hold your property papers, your money or your originals.",
      },
      {
        id: "dont-trust",
        question: "I do not trust anyone in Pakistan any more.",
        answer:
          "That is understandable; many people have been cheated, sometimes by relatives. So we make the case visible: copies of every document and filing, official records you can check yourself, and payment step by step.",
      },
    ],
  },
];

export const allFaqs: Faq[] = faqGroups.flatMap((g) => g.items);

/** The six questions shown on the home page. */
export const homeFaqs: Faq[] = ["law-firm", "how-much", "trust-money", "how-long", "guarantee", "family-find-out"]
  .map((id) => allFaqs.find((f) => f.id === id))
  .filter((f): f is Faq => Boolean(f));

/** Payment questions for the pricing page. */
export const paymentFaqs: Faq[] = [
  {
    id: "pay-card",
        todo: "TODO: confirm the customer-facing entity (UK Ltd or US LLC)",
    question: "Can I pay by card from the UK, US, Canada or the Gulf?",
    answer:
      "Yes. Card payments go through a secure payment link issued by our UK or US company, so it looks like any other online purchase on your statement and you get a receipt.",
  },
  {
    id: "pay-wise",
        todo: "TODO: confirm before launch",
    question: "Can I pay by Wise or Payoneer instead?",
    answer:
      "Yes, if card does not work for you. Ask your case manager for the details, and we will send them in writing. We never ask you to pay a personal account.",
  },
  {
    id: "pay-stages",
    question: "Do I have to pay everything up front?",
    answer: `No. You pay for one step at a time. On a Managed Case the project fee (${formatPriceRange("managed")}) is split into stages, and you never prepay more than the next stage.`,
  },
  {
    id: "pay-advocate",
    question: "Who do I pay the advocate's fee to?",
    answer:
      "Directly to the advocate. They are independent, they agree their fee with you, and they bill you themselves. We take no share of advocate fees.",
  },
  {
    id: "pay-government",
    question: "What about government fees?",
    answer:
      "Government and court fees are charged at cost, with the official receipt. We add nothing on top. Our own fee is the published price.",
  },
  {
    id: "pay-refund",
        todo: "TODO: confirm refund wording with counsel",
    question: "What is the refund policy?",
    answer:
      "If we do not deliver your Pathway Memo in the stated time, you get a full refund. We do not refund based on what a court or office decides, because nobody controls that.",
  },
];
