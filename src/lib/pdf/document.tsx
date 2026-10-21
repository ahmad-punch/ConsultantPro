/**
 * One PDF layout for every document type, driven by branding + template +
 * data (DocModel). Server-only: rendered by the /admin/.../pdf route handlers.
 */
import "server-only";

import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

import { DOCUMENT_TYPE_LABELS } from "@/lib/db/enums";

import { brandName, docDate, fill, money, opt, type DocModel } from "./model";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1f2937", lineHeight: 1.4 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, paddingBottom: 12, borderBottomWidth: 2 },
  logo: { width: 90, height: 40, objectFit: "contain", marginBottom: 6 },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  small: { fontSize: 9, color: "#4b5563" },
  titleBlock: { alignItems: "flex-end" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 9, color: "#4b5563", textAlign: "right" },
  label: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", marginBottom: 3 },
  billTo: { marginBottom: 18 },
  para: { marginBottom: 12 },
  tableHead: { flexDirection: "row", borderBottomWidth: 1, paddingBottom: 4, marginBottom: 4, fontFamily: "Helvetica-Bold", fontSize: 9 },
  row: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  cDesc: { flex: 1 },
  cQty: { width: 40, textAlign: "right" },
  cUnit: { width: 70, textAlign: "right" },
  cAmt: { width: 80, textAlign: "right" },
  totals: { marginTop: 8, marginLeft: "auto", width: 200 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grand: { fontFamily: "Helvetica-Bold", fontSize: 12, borderTopWidth: 1, paddingTop: 4, marginTop: 2 },
  h2: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 12, marginBottom: 4 },
  box: { marginTop: 14, padding: 10, backgroundColor: "#f3f4f6" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 8, color: "#6b7280", textAlign: "center", borderTopWidth: 0.5, borderTopColor: "#d1d5db", paddingTop: 6 },
});

export function DocumentPdf({ model }: { model: DocModel }) {
  const b = model.branding;
  const t = model.template;
  const title = t.title || DOCUMENT_TYPE_LABELS[model.type];
  const cur = b.currency || "USD";
  const party = model.billTo;
  const footer = [fill(t.footer, model), b.footerText].filter(Boolean).join("\n");
  return (
    <Document title={`${title} ${model.number}`} author={b.legalName || brandName(b)}>
      <Page size="A4" style={s.page}>
        <View style={[s.header, { borderBottomColor: b.primaryColor }]}>
          <View>
            {b.showLogo && b.logoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={b.logoUrl} style={s.logo} />
            ) : null}
            <Text style={[s.brand, { color: b.primaryColor }]}>{brandName(b)}</Text>
            {b.legalName && b.legalName !== brandName(b) ? <Text style={s.small}>{b.legalName}</Text> : null}
            {b.addressLines ? <Text style={s.small}>{b.addressLines}</Text> : null}
            <Text style={s.small}>{[b.email, b.phone, b.website].filter(Boolean).join("  ·  ")}</Text>
            {opt(model, "showTaxLine") && b.taxNumber ? (
              <Text style={s.small}>
                {b.taxLabel || "Tax no."} {b.taxNumber}
              </Text>
            ) : null}
          </View>
          <View style={s.titleBlock}>
            <Text style={[s.title, { color: b.accentColor }]}>{title}</Text>
            <Text style={s.meta}>No. {model.number}</Text>
            <Text style={s.meta}>Date: {docDate(model.issueDate)}</Text>
            {model.dueDate ? <Text style={s.meta}>Due: {docDate(model.dueDate)}</Text> : null}
            {opt(model, "showCaseReference") && model.caseNumber ? (
              <Text style={s.meta}>Case: {model.caseNumber}</Text>
            ) : null}
            {model.status === "void" ? <Text style={[s.meta, { color: "#b91c1c" }]}>VOID</Text> : null}
          </View>
        </View>

        {party ? (
          <View style={s.billTo}>
            <Text style={s.label}>{model.type === "invoice" || model.type === "quote" ? "Bill to" : "Client"}</Text>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{party.name}</Text>
            {[party.city, party.country].filter(Boolean).length ? (
              <Text style={s.small}>{[party.city, party.country].filter(Boolean).join(", ")}</Text>
            ) : null}
            {party.email ? <Text style={s.small}>{party.email}</Text> : null}
            {party.whatsapp ? <Text style={s.small}>{party.whatsapp}</Text> : null}
          </View>
        ) : null}

        {t.intro ? <Text style={s.para}>{fill(t.intro, model)}</Text> : null}

        {model.items.length ? (
          <View wrap={false}>
            <View style={[s.tableHead, { borderBottomColor: b.primaryColor }]}>
              <Text style={s.cDesc}>Description</Text>
              <Text style={s.cQty}>Qty</Text>
              <Text style={s.cUnit}>Unit</Text>
              <Text style={s.cAmt}>Amount</Text>
            </View>
            {model.items.map((i, n) => (
              <View key={n} style={s.row}>
                <Text style={s.cDesc}>{i.description}</Text>
                <Text style={s.cQty}>{i.quantity}</Text>
                <Text style={s.cUnit}>{money(i.unitUsd, cur)}</Text>
                <Text style={s.cAmt}>{money(i.amountUsd, cur)}</Text>
              </View>
            ))}
            <View style={s.totals}>
              {model.taxUsd > 0 || opt(model, "showTaxLine") ? (
                <>
                  <View style={s.totalRow}>
                    <Text>Subtotal</Text>
                    <Text>{money(model.subtotalUsd, cur)}</Text>
                  </View>
                  <View style={s.totalRow}>
                    <Text>{b.taxLabel || "Tax"}</Text>
                    <Text>{money(model.taxUsd, cur)}</Text>
                  </View>
                </>
              ) : null}
              <View style={[s.totalRow, s.grand]}>
                <Text>Total</Text>
                <Text>{money(model.totalUsd, cur)}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {model.notes ? (
          <View>
            <Text style={s.h2}>Notes</Text>
            <Text>{model.notes}</Text>
          </View>
        ) : null}

        {t.sections.map((sec, n) => (
          <View key={n} wrap={false}>
            {sec.heading ? <Text style={[s.h2, { color: b.primaryColor }]}>{sec.heading}</Text> : null}
            <Text>{fill(sec.body, model)}</Text>
          </View>
        ))}

        {t.terms ? (
          <View>
            <Text style={s.h2}>Terms</Text>
            <Text style={s.small}>{fill(t.terms, model)}</Text>
          </View>
        ) : null}

        {opt(model, "showBankDetails") && b.bankDetails ? (
          <View style={s.box} wrap={false}>
            <Text style={s.label}>Bank details</Text>
            <Text>{b.bankDetails}</Text>
          </View>
        ) : null}

        {opt(model, "showSignature") ? (
          <View style={{ marginTop: 36, flexDirection: "row", justifyContent: "space-between" }} wrap={false}>
            <View style={{ width: 200, borderTopWidth: 0.5, paddingTop: 4 }}>
              <Text style={s.small}>For {b.legalName || brandName(b)}</Text>
            </View>
            <View style={{ width: 200, borderTopWidth: 0.5, paddingTop: 4 }}>
              <Text style={s.small}>Client: {party?.name ?? ""}</Text>
            </View>
          </View>
        ) : null}

        {footer ? (
          <Text style={s.footer} fixed>
            {footer}
          </Text>
        ) : null}
      </Page>
    </Document>
  );
}

export async function renderDocumentPdf(model: DocModel): Promise<Buffer> {
  return renderToBuffer(<DocumentPdf model={model} />);
}

export function pdfResponse(buffer: Buffer, filename: string): Response {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename.replace(/[^\w.-]/g, "_")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
