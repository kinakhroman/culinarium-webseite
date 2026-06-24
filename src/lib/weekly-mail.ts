// Erzeugt und versendet das wöchentliche Menü an den festen E-Mail-Verteiler
// (Tabelle MailingRecipient). Wird vom Cron-Endpunkt /api/cron/weekly-mail und
// vom "Probemail"-Button im Admin genutzt.
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { getWeekPlanRows, type WeekPlanRow } from "@/lib/menu-db";
import { formatWeekRange, toISODateLocal, formatCurrency, DAYS_DE } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://culinarium-berlin.de";

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

function buildText(rows: WeekPlanRow[], weekRange: string): string {
  const lines = byDay(rows).map(({ day, items }) => {
    const dishes = items
      .map((i) => `${i.name} (${formatCurrency(i.price)})${i.note ? ` – ${i.note}` : ""}`)
      .join(" · ");
    return `${DAYS_DE[day] ?? "?"}: ${dishes}`;
  });
  return [
    `Unser Wochenmenü ${weekRange} bei Culinarium am Biesenhorst`,
    "",
    ...lines,
    "",
    `Jetzt vorbestellen: ${BASE_URL}`,
    "",
    "Guten Appetit – euer Culinarium-Team am Biesenhorst",
  ].join("\n");
}

function buildHtml(weekRange: string, posterUrl: string): string {
  // Bewusst KEINE Tag-für-Tag-Tabelle mehr: die Menügrafik (posterUrl) zeigt
  // bereits alle Tage mit Fotos und Preisen – eine Textliste darunter wäre
  // doppelt. Die reine Text-Version der Mail (buildText) bleibt als Fallback.
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${PAPER};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(74,36,16,.08);">
        <!-- Header -->
        <tr><td style="background:${BRAND};padding:28px 28px 22px;text-align:center;">
          <div style="color:${EMBER};font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Culinarium am Biesenhorst</div>
          <div style="color:#fff;font-size:26px;font-weight:800;margin-top:6px;">Unser Wochenmenü</div>
          <div style="color:#F3DFC8;font-size:15px;margin-top:4px;">${weekRange}</div>
        </td></tr>
        <!-- Menügrafik (zeigt alle Tage + Preise + Fotos) -->
        <tr><td style="padding:0;line-height:0;">
          <img src="${posterUrl}" alt="Wochenmenü ${weekRange}" width="600" style="display:block;width:100%;height:auto;border:0;" />
        </td></tr>
        <!-- CTA -->
        <tr><td style="padding:24px 28px 8px;text-align:center;">
          <a href="${BASE_URL}" style="display:inline-block;background:${PAPRIKA};color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:999px;">Jetzt vorbestellen &rarr;</a>
          <div style="color:${INK_SOFT};font-size:13px;margin-top:14px;">Frisch gekocht, Mo&ndash;Fr. Wir freuen uns auf euch!</div>
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

  const posterUrl = `${BASE_URL}/api/menu-poster/square?week=${toISODateLocal(weekStart)}`;
  const subject = `🍽️ Wochenmenü ${weekRange} – Culinarium am Biesenhorst`;
  const text = buildText(rows, weekRange);
  const html = buildHtml(weekRange, posterUrl);

  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const ok = await sendMail({ to: r.email, subject, text, html });
    if (ok) sent++;
    else failed++;
  }

  return { ok: true, weekRange, recipients: recipients.length, sent, failed };
}
