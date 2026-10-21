/**
 * Email templates. Each returns { subject, html, text }. Brand values come
 * from site.ts; keep the "not legal advice" disclaimer on every email.
 */
import { site, whatsappLink } from "@/lib/site";

type Rendered = { subject: string; html: string; text: string };

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absolute(href: string): string {
  return href.startsWith("http") ? href : `${site.url.replace(/\/$/, "")}${href}`;
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f5f1;font-family:Georgia,'Times New Roman',serif;color:#1c2a26">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
<p style="margin:0 0 16px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#8a6d2f">${esc(site.name)}</p>
<h1 style="margin:0 0 16px;font-size:22px;font-weight:500;color:#123b33">${esc(title)}</h1>
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6">${bodyHtml}</div>
<p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6b7470">${esc(site.disclaimer)}</p>
</div></body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0"><a href="${esc(href)}" style="display:inline-block;background:#123b33;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">${esc(label)}</a></p>`;
}

export function intakeConfirmationEmail(input: { name: string; reference: string }): Rendered {
  const first = input.name.trim().split(/\s+/)[0] || "there";
  const wa = absolute(whatsappLink(`Hello, my reference is ${input.reference}.`));
  const steps = [
    "A case manager reads your message, usually the same working day.",
    "We reply on WhatsApp with the smallest step that answers your question, and its fixed price.",
    "Nothing is charged until you choose a step.",
  ];
  const subject = `We have your request (ref ${input.reference})`;
  const html = layout(
    "We have your request",
    `<p>Hello ${esc(first)},</p>
<p>Thank you for writing to ${esc(site.name)}. Your reference is <strong>${esc(input.reference)}</strong>.</p>
<p><strong>What happens next</strong></p>
<ol style="padding-left:20px">${steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
<p>Please do not send documents yet; we will ask for what we need.</p>
${button(wa, "Message us on WhatsApp")}`,
  );
  const text = `Hello ${first},

Thank you for writing to ${site.name}. Your reference is ${input.reference}.

What happens next
${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Please do not send documents yet; we will ask for what we need.

WhatsApp: ${wa}

${site.disclaimer}`;
  return { subject, html, text };
}

export function memoDeliveredEmail(input: {
  name: string;
  caseNumber: string;
  memoUrl: string | null;
  statusUrl: string;
}): Rendered {
  const first = input.name.trim().split(/\s+/)[0] || "there";
  const subject = `Your written plan is ready (${input.caseNumber})`;
  const html = layout(
    "Your written plan is ready",
    `<p>Hello ${esc(first)},</p>
<p>The written plan for case <strong>${esc(input.caseNumber)}</strong> is ready.</p>
${input.memoUrl ? button(input.memoUrl, "Open your plan") : ""}
<p>You can follow the case at any time on your status page:<br><a href="${esc(input.statusUrl)}">${esc(input.statusUrl)}</a></p>
<p>Reply on WhatsApp if anything in the plan is unclear.</p>`,
  );
  const text = `Hello ${first},

The written plan for case ${input.caseNumber} is ready.
${input.memoUrl ? `\nOpen your plan: ${input.memoUrl}\n` : ""}
Follow the case on your status page: ${input.statusUrl}

Reply on WhatsApp if anything in the plan is unclear.

${site.disclaimer}`;
  return { subject, html, text };
}
