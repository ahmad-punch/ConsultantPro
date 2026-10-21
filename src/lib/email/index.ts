/**
 * Thin transactional email client (Resend). `sendEmail` never throws: it
 * returns `{ ok: false }` on failure and no-ops with a console note when
 * RESEND_API_KEY or EMAIL_FROM is not set. Server code only.
 */
import "server-only";

import { Resend } from "resend";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type EmailResult = { ok: true; id: string | null } | { ok: false; skipped?: boolean; error?: string };

let client: Resend | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.info(`[email] skipped "${message.subject}": RESEND_API_KEY or EMAIL_FROM not set.`);
    return { ok: false, skipped: true };
  }
  try {
    client ??= new Resend(key);
    const { data, error } = await client.emails.send({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo ?? process.env.EMAIL_REPLY_TO ?? undefined,
    });
    if (error) {
      console.error(`[email] send failed for "${message.subject}"`, error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id ?? null };
  } catch (error) {
    console.error(`[email] send threw for "${message.subject}"`, error);
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
