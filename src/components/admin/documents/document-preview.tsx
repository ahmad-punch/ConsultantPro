/**
 * HTML rendering of a DocModel: the on-screen preview and the print view.
 * Mirrors src/lib/pdf/document.tsx. No hooks, so it works in server and
 * client components.
 */
import { DOCUMENT_TYPE_LABELS } from "@/lib/db/enums";
import { brandName, docDate, fill, money, opt, type DocModel } from "@/lib/pdf/model";

export function DocumentPreview({ model }: { model: DocModel }) {
  const b = model.branding;
  const t = model.template;
  const title = t.title || DOCUMENT_TYPE_LABELS[model.type];
  const cur = b.currency || "USD";
  const party = model.billTo;
  return (
    <article className="doc-preview mx-auto max-w-[800px] rounded-lg border bg-white p-8 text-[13px] leading-relaxed text-neutral-800 shadow-sm print:border-0 print:p-0 print:shadow-none">
      <header className="mb-6 flex flex-wrap justify-between gap-4 border-b-2 pb-4" style={{ borderColor: b.primaryColor }}>
        <div className="space-y-0.5">
          {b.showLogo && b.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.logoUrl} alt="" className="mb-2 h-10 w-auto object-contain" />
          ) : null}
          <div className="text-lg font-bold" style={{ color: b.primaryColor }}>
            {brandName(b)}
          </div>
          {b.legalName && b.legalName !== brandName(b) ? <div className="text-xs text-neutral-600">{b.legalName}</div> : null}
          {b.addressLines ? <div className="text-xs whitespace-pre-line text-neutral-600">{b.addressLines}</div> : null}
          <div className="text-xs text-neutral-600">{[b.email, b.phone, b.website].filter(Boolean).join(" · ")}</div>
          {opt(model, "showTaxLine") && b.taxNumber ? (
            <div className="text-xs text-neutral-600">
              {b.taxLabel || "Tax no."} {b.taxNumber}
            </div>
          ) : null}
        </div>
        <div className="text-right text-xs text-neutral-600">
          <div className="text-2xl font-bold" style={{ color: b.accentColor }}>
            {title}
          </div>
          <div>No. {model.number}</div>
          <div>Date: {docDate(model.issueDate)}</div>
          {model.dueDate ? <div>Due: {docDate(model.dueDate)}</div> : null}
          {opt(model, "showCaseReference") && model.caseNumber ? <div>Case: {model.caseNumber}</div> : null}
          {model.status === "void" ? <div className="font-bold text-red-700">VOID</div> : null}
        </div>
      </header>

      {party ? (
        <section className="mb-5">
          <div className="text-[10px] font-bold tracking-wide text-neutral-500 uppercase">
            {model.type === "invoice" || model.type === "quote" ? "Bill to" : "Client"}
          </div>
          <div className="font-semibold">{party.name}</div>
          <div className="text-xs text-neutral-600">
            {[party.city, party.country].filter(Boolean).join(", ")}
            {party.email ? <div>{party.email}</div> : null}
            {party.whatsapp ? <div>{party.whatsapp}</div> : null}
          </div>
        </section>
      ) : null}

      {t.intro ? <p className="mb-4 whitespace-pre-line">{fill(t.intro, model)}</p> : null}

      {model.items.length ? (
        <section className="mb-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-xs" style={{ borderColor: b.primaryColor }}>
                <th className="py-1 font-semibold">Description</th>
                <th className="w-12 py-1 text-right font-semibold">Qty</th>
                <th className="w-24 py-1 text-right font-semibold">Unit</th>
                <th className="w-24 py-1 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {model.items.map((i, n) => (
                <tr key={n} className="border-b border-neutral-200">
                  <td className="py-1.5">{i.description}</td>
                  <td className="py-1.5 text-right tabular-nums">{i.quantity}</td>
                  <td className="py-1.5 text-right tabular-nums">{money(i.unitUsd, cur)}</td>
                  <td className="py-1.5 text-right tabular-nums">{money(i.amountUsd, cur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="mt-2 ml-auto w-56 text-sm">
            {model.taxUsd > 0 || opt(model, "showTaxLine") ? (
              <>
                <div className="flex justify-between py-0.5">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{money(model.subtotalUsd, cur)}</dd>
                </div>
                <div className="flex justify-between py-0.5">
                  <dt>{b.taxLabel || "Tax"}</dt>
                  <dd className="tabular-nums">{money(model.taxUsd, cur)}</dd>
                </div>
              </>
            ) : null}
            <div className="mt-1 flex justify-between border-t pt-1 text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(model.totalUsd, cur)}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      {model.notes ? (
        <section className="mb-3">
          <h3 className="font-semibold">Notes</h3>
          <p className="whitespace-pre-line">{model.notes}</p>
        </section>
      ) : null}

      {t.sections.map((sec, n) => (
        <section key={n} className="mb-3">
          {sec.heading ? (
            <h3 className="font-semibold" style={{ color: b.primaryColor }}>
              {sec.heading}
            </h3>
          ) : null}
          <p className="whitespace-pre-line">{fill(sec.body, model)}</p>
        </section>
      ))}

      {t.terms ? (
        <section className="mb-3">
          <h3 className="font-semibold">Terms</h3>
          <p className="text-xs whitespace-pre-line text-neutral-600">{fill(t.terms, model)}</p>
        </section>
      ) : null}

      {opt(model, "showBankDetails") && b.bankDetails ? (
        <section className="mt-4 rounded bg-neutral-100 p-3">
          <div className="text-[10px] font-bold tracking-wide text-neutral-500 uppercase">Bank details</div>
          <p className="whitespace-pre-line">{b.bankDetails}</p>
        </section>
      ) : null}

      {opt(model, "showSignature") ? (
        <section className="mt-10 flex justify-between gap-8 text-xs text-neutral-600">
          <div className="w-56 border-t pt-1">For {b.legalName || brandName(b)}</div>
          <div className="w-56 border-t pt-1">Client: {party?.name}</div>
        </section>
      ) : null}

      {fill(t.footer, model) || b.footerText ? (
        <footer className="mt-8 border-t pt-2 text-center text-[11px] whitespace-pre-line text-neutral-500">
          {[fill(t.footer, model), b.footerText].filter(Boolean).join("\n")}
        </footer>
      ) : null}
    </article>
  );
}
