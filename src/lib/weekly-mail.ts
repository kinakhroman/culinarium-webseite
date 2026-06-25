// Erzeugt und versendet das wöchentliche Menü an den festen E-Mail-Verteiler
// (Tabelle MailingRecipient). Wird vom Cron-Endpunkt /api/cron/weekly-mail und
// vom "Probemail"-Button im Admin genutzt.
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { getWeekPlanRows, type WeekPlanRow } from "@/lib/menu-db";
import { formatWeekRange, formatCurrency, DAYS_DE } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://culinarium-berlin.de";
// "Jetzt vorbestellen" führt direkt auf die Bestellseite mit Wochenmenü-Filter.
const ORDER_URL = `${BASE_URL}/bestellen?kategorie=wochenmenue`;
// "Menü ansehen" führt auf die Wochenplan-Seite (mit Grafik & Details).
const MENU_URL = `${BASE_URL}/wochenplan`;

// Markenfarben (vgl. globals.css)
const BRAND = "#4A2410";
const PAPER = "#F8F1E7";
const PAPRIKA = "#C0381C";
const EMBER = "#E0902F";
const INK = "#221A12";
const INK_SOFT = "#7A6A56";

export type WeeklyMailResult = {
  ok: boolean;
  skipped?: string;
  weekRange?: string;
  recipients?: number;
  sent?: number;
  failed?: number;
};

/** Reihen nach Wochentag gruppiert (Mo–Fr), in Anzeigereihenfolge. */
function byDay(rows: WeekPlanRow[]): { day: number; items: WeekPlanRow[] }[] {
  const map = new Map<number, WeekPlanRow[]>();
  for (const r of rows) {
    const list = map.get(r.dayOfWeek) ?? [];
    list.push(r);
    map.set(r.dayOfWeek, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, items]) => ({ day, items }));
}

/** Einheitspreis erkennen (alle Gerichte gleich teuer > 0) – sonst null. */
function uniformPrice(rows: WeekPlanRow[]): number | null {
  const prices = rows.map((r) => r.price).filter((p) => p > 0);
  return prices.length > 0 && prices.every((p) => p === prices[0]) ? prices[0] : null;
}

function buildText(rows: WeekPlanRow[], weekRange: string): string {
  const uni = uniformPrice(rows);
  const lines = byDay(rows).map(({ day, items }) => {
    const dishes = items
      .map(
        (i) =>
          `${i.name}${uni === null && i.price > 0 ? ` (${formatCurrency(i.price)})` : ""}${
            i.note ? ` – ${i.note}` : ""
          }`
      )
      .join(" · ");
    return `${DAYS_DE[day] ?? "?"}: ${dishes}`;
  });
  return [
    `Unser Wochenmenü ${weekRange} bei Culinarium am Biesenhorst`,
    uni !== null ? `Jedes Gericht ${formatCurrency(uni)} – inkl. Salat` : "",
    "",
    ...lines,
    "",
    `Menü ansehen: ${MENU_URL}`,
    `Jetzt vorbestellen: ${ORDER_URL}`,
    "",
    "Guten Appetit – euer Culinarium-Team am Biesenhorst",
  ].join("\n");
}

function buildHtml(rows: WeekPlanRow[], weekRange: string): string {
  const uni = uniformPrice(rows);

  const dayRows = byDay(rows)
    .map(({ day, items }, idx) => {
      const bg = idx % 2 === 0 ? "#FFFFFF" : "#FBF4EA";
      const dishes = items
        .map((i) => {
          const price =
            uni === null && i.price > 0
              ? ` <span style="color:${PAPRIKA};font-weight:700;white-space:nowrap;">${formatCurrency(
                  i.price
                )}</span>`
              : "";
          const note = i.note
            ? `<div style="color:${INK_SOFT};font-size:13px;">${escapeHtml(i.note)}</div>`
            : "";
          return `<div style="margin:1px 0;"><span style="color:${INK};font-weight:600;">${escapeHtml(
            i.name
          )}</span>${price}${note}</div>`;
        })
        .join("");
      return `<tr>
        <td style="padding:11px 14px;background:${bg};border-bottom:1px solid #EFE3D2;width:104px;vertical-align:top;">
          <span style="display:inline-block;background:${BRAND};color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:4px 10px;border-radius:999px;">${
        DAYS_DE[day] ?? "?"
      }</span>
        </td>
        <td style="padding:11px 14px;background:${bg};border-bottom:1px solid #EFE3D2;vertical-align:top;font-size:15px;line-height:1.35;">${dishes}</td>
      </tr>`;
    })
    .join("");

  const priceBadge =
    uni !== null
      ? `<div style="text-align:center;margin:0 0 4px;"><span style="display:inline-block;background:${PAPRIKA};background-image:linear-gradient(135deg,${EMBER},${PAPRIKA});color:#fff;font-weight:700;font-size:15px;padding:7px 20px;border-radius:999px;">${formatCurrency(
          uni
        )} pro Gericht &middot; mit Salat</span></div>`
      : "";

  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${PAPER};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(74,36,16,.08);">
        <!-- Header -->
        <tr><td style="background:${BRAND};padding:26px 28px 20px;text-align:center;">
          <div style="color:${EMBER};font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Culinarium am Biesenhorst</div>
          <div style="color:#fff;font-size:26px;font-weight:800;margin-top:6px;">Unser Wochenmenü</div>
          <div style="color:#F3DFC8;font-size:15px;margin-top:4px;">${weekRange}</div>
        </td></tr>
        <!-- Text-Menü (sofort lesbar, kein Bild nötig) -->
        <tr><td style="padding:22px 24px 4px;">
          ${priceBadge}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;margin-top:8px;border:1px solid #EFE3D2;border-radius:12px;overflow:hidden;">
            ${dayRows}
          </table>
        </td></tr>
        <!-- Buttons -->
        <tr><td style="padding:20px 24px 6px;text-align:center;">
          <a href="${MENU_URL}" style="display:inline-block;background:#fff;border:2px solid ${PAPRIKA};color:${PAPRIKA};text-decoration:none;font-weight:700;font-size:15px;padding:10px 24px;border-radius:999px;margin:0 5px 10px;">Menü ansehen</a>
          <a href="${ORDER_URL}" style="display:inline-block;background:${PAPRIKA};color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 26px;border-radius:999px;margin:0 5px 10px;">Jetzt vorbestellen &rarr;</a>
          <div style="color:${INK_SOFT};font-size:13px;margin-top:6px;">Frisch gekocht, Mo&ndash;Fr. Wir freuen uns auf euch!</div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:18px 28px 24px;text-align:center;border-top:1px solid #EFE3D2;">
          <div style="color:${INK_SOFT};font-size:12px;line-height:1.6;">
            Culinarium am Biesenhorst &middot; <a href="${BASE_URL}" style="color:${BRAND};">culinarium-berlin.de</a><br>
            Sie erhalten diese E-Mail, weil Sie in unseren Wochenmenü-Verteiler aufgenommen wurden.<br>
            Keine Mails mehr gewünscht? Kurze Antwort genügt &ndash; wir nehmen Sie sofort heraus.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Versendet das Menü der Woche ab `weekStart` an alle aktiven Empfänger des
 * Verteilers – einzeln (kein BCC, damit Adressen privat bleiben).
 * Sendet nichts, wenn für die Woche kein Plan hinterlegt ist oder der Verteiler leer ist.
 */
export async function sendWeeklyMenuMail(
  weekStart: Date,
  opts?: { to?: string }
): Promise<WeeklyMailResult> {
  const weekRange = formatWeekRange(weekStart);

  const rows = await getWeekPlanRows(weekStart);
  if (rows.length === 0) {
    return { ok: true, skipped: "Für diese Woche ist kein Menü hinterlegt – keine Mail.", weekRange };
  }

  let recipients: { email: string }[] = [];
  if (opts?.to) {
    // Test-Modus: nur an eine Adresse, Verteiler bleibt unangetastet.
    recipients = [{ email: opts.to.trim().toLowerCase() }];
  } else {
    try {
      recipients = await db.mailingRecipient.findMany({
        where: { isActive: true },
        select: { email: true },
      });
    } catch {
      return { ok: false, skipped: "Verteiler-Tabelle fehlt – bitte /api/admin/migrate ausführen.", weekRange };
    }
    if (recipients.length === 0) {
      return { ok: true, skipped: "Kein aktiver Empfänger im Verteiler.", weekRange, recipients: 0 };
    }
  }

  const subject = `🍽️ Wochenmenü ${weekRange} – Culinarium am Biesenhorst`;
  const text = buildText(rows, weekRange);
  // Reine Text-/HTML-Mail OHNE eingebettetes Bild: das Menü ist sofort lesbar
  // (Outlook blockiert externe Bilder standardmäßig); die Grafik gibt's per
  // "Menü ansehen"-Button auf der Website.
  const html = buildHtml(rows, weekRange);

  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const ok = await sendMail({ to: r.email, subject, text, html });
    if (ok) sent++;
    else failed++;
  }

  return { ok: true, weekRange, recipients: recipients.length, sent, failed };
}
