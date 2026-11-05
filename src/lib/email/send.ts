import { Resend } from "resend";
import { PRODUCT_NAME, SUPPORT_EMAIL } from "@/lib/site";

let cached: Resend | null = null;

/** Envoie un e-mail via Resend. Sans RESEND_API_KEY, n'envoie rien et le journalise. */
export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info("[email] RESEND_API_KEY vide, non envoyé :", subject, "→", to);
    return { sent: false as const };
  }
  cached ??= new Resend(key);
  const { error } = await cached.emails.send({ from: `${PRODUCT_NAME} <${SUPPORT_EMAIL}>`, to, subject, html });
  if (error) throw new Error(`[email] ${error.message}`);
  return { sent: true as const };
}
