import { db } from "@/lib/db";
import { normalizeEmail, verifyUnsubscribeToken } from "@/lib/unsubscribe";

export const dynamic = "force-dynamic";

/**
 * Newsletter-Abmeldung mit einem Klick – ohne Login.
 *
 *   GET  /api/newsletter/abmelden?e=<adresse>&t=<signatur>   Link/Button in der Mail
 *   POST (gleiche Parameter)                                 „List-Unsubscribe"-Knopf
 *                                                            der Mailprogramme (RFC 8058)
 *
 * Die Adresse wird im Verteiler auf inaktiv gesetzt (nicht gelöscht): So bleibt
 * sie als Sperrvermerk erhalten und wird bei einem späteren Sammel-Import
 * nicht versehentlich wieder aufgenommen.
 */
async function unsubscribe(req: Request): Promise<{ ok: boolean; email: string }> {
  const url = new URL(req.url);
  const email = normalizeEmail(url.searchParams.get("e") || "");
  const token = url.searchParams.get("t") || "";
  if (!email || !verifyUnsubscribeToken(email, token)) return { ok: false, email };

  // updateMany: kein Fehler, falls die Adresse gar nicht (mehr) im Verteiler steht.
  await db.mailingRecipient.updateMany({ where: { email }, data: { isActive: false } });
  console.log(`[newsletter] abgemeldet: ${email}`);
  return { ok: true, email };
}

function page(title: string, text: string, status: number): Response {
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${title} – Culinarium am Biesenhorst</title>
<style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#F8F1E7;color:#221A12;display:flex;align-items:center;justify-content:center;min-height:100vh}
.box{max-width:460px;margin:24px;padding:36px 32px;background:#fff;border-radius:16px;box-shadow:0 6px 24px rgba(74,36,16,.08);text-align:center}
.brand{color:#C0381C;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase}
h1{font-size:24px;margin:10px 0 12px}p{color:#7A6A56;line-height:1.55;margin:0 0 10px}a{color:#4A2410}</style></head>
<body><div class="box"><div class="brand">Culinarium am Biesenhorst</div><h1>${title}</h1>${text}
<p style="margin-top:22px;font-size:13px"><a href="/">culinarium-berlin.de</a></p></div></body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET(req: Request) {
  try {
    const r = await unsubscribe(req);
    if (!r.ok) {
      return page(
        "Link ungültig",
        "<p>Dieser Abmelde-Link ist unvollständig oder beschädigt.</p><p>Schreiben Sie uns bitte kurz an <a href=\"mailto:info@culinarium-berlin.de\">info@culinarium-berlin.de</a> – wir tragen Sie sofort aus.</p>",
        400
      );
    }
    return page(
      "Sie sind abgemeldet",
      `<p>Die Adresse <strong>${esc(r.email)}</strong> erhält ab sofort kein Wochenmenü mehr von uns.</p><p>Entschuldigen Sie bitte die Störung.</p>`,
      200
    );
  } catch (e) {
    console.error("[newsletter] Abmeldung fehlgeschlagen:", e);
    return page(
      "Das hat leider nicht geklappt",
      "<p>Bitte versuchen Sie es in einer Minute erneut oder schreiben Sie an <a href=\"mailto:info@culinarium-berlin.de\">info@culinarium-berlin.de</a>.</p>",
      500
    );
  }
}

export async function POST(req: Request) {
  try {
    const r = await unsubscribe(req);
    return new Response(r.ok ? "abgemeldet" : "ungueltiger Link", { status: r.ok ? 200 : 400 });
  } catch (e) {
    console.error("[newsletter] Abmeldung (POST) fehlgeschlagen:", e);
    return new Response("Fehler", { status: 500 });
  }
}
