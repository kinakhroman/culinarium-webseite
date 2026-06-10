/**
 * E-Mail-Versand über SMTP (nodemailer). Funktioniert, sobald folgende
 * Umgebungsvariablen gesetzt sind UND nodemailer installiert ist:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Ist SMTP nicht konfiguriert (oder nodemailer fehlt), wird die Mail server-
 * seitig NUR geloggt (kein Crash) – so ist der Flow auch ohne Mailserver testbar.
 */
type MailInput = { to: string; subject: string; text: string; html?: string };

export async function sendMail({ to, subject, text, html }: MailInput): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      `[mailer] SMTP nicht konfiguriert – E-Mail wird nur geloggt.\n` +
        `  An: ${to}\n  Betreff: ${subject}\n  Inhalt:\n${text}`
    );
    return false;
  }

  try {
    // Dynamischer Import über Variablen-Specifier: kein harter Build-Zwang auf nodemailer
    const moduleName = "nodemailer";
    const mod = (await import(moduleName).catch(() => null)) as
      | { default?: unknown; createTransport?: unknown }
      | null;
    if (!mod) {
      console.warn("[mailer] nodemailer nicht installiert – E-Mail nur geloggt:", subject, text);
      return false;
    }
    const nodemailer = (mod.default ?? mod) as {
      createTransport: (opts: unknown) => { sendMail: (opts: unknown) => Promise<unknown> };
    };
    const port = parseInt(SMTP_PORT || "587", 10);
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transport.sendMail({
      from: SMTP_FROM || `Culinarium am Biesenhorst <${SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || undefined,
    });
    return true;
  } catch (e) {
    console.error("[mailer] Versand fehlgeschlagen:", e);
    return false;
  }
}
