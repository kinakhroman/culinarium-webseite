import { createHmac, timingSafeEqual } from "crypto";

/**
 * Abmelde-Links für den Wochenmenü-Verteiler.
 *
 * Anlass (20.11.2026): Ein Empfänger hatte sich viermal per Antwort-Mail
 * abgemeldet, bekam aber weiter Mails – die Fußzeile versprach „Kurze Antwort
 * genügt", doch Antworten landeten nur im Postfach und niemand trug sie aus.
 * Folge: Beschwerde bei der Datenschutzbehörde. Seitdem trägt jede Mail einen
 * persönlichen Abmelde-Link, der OHNE Login und ohne menschliches Zutun wirkt.
 *
 * Der Link enthält die Adresse und eine HMAC-Signatur. So kann niemand fremde
 * Adressen abmelden, und es ist keine zusätzliche Datenbankspalte nötig.
 */
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://culinarium-berlin.de";

function secret(): string {
  return process.env.AUTH_SECRET || process.env.MENU_API_KEY || "culinarium-unsubscribe";
}

export function normalizeEmail(raw: string): string {
  return String(raw || "").trim().toLowerCase();
}

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret()).update(normalizeEmail(email)).digest("hex").slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(String(token || ""));
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(email: string): string {
  const e = encodeURIComponent(normalizeEmail(email));
  return `${BASE_URL}/api/newsletter/abmelden?e=${e}&t=${unsubscribeToken(email)}`;
}
