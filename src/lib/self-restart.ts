import { NextResponse } from "next/server";

/**
 * Selbstheilung für den Hostinger-Webhost (Incidents 24.08., 28.08., 04.09.2026).
 *
 * Nach der Foto-Generierung beim Veröffentlichen einer Woche (Gemini + sharp/
 * libvips im selben Prozess) kann der laufende next-server-Prozess keine
 * Grafiken mehr rendern: ImageResponse/satori bricht ab → Poster, PDF und
 * Story liefern 503, während normale Seiten weiterlaufen. Ein frischer Prozess
 * behebt das zuverlässig. LiteSpeed startet beim nächsten Aufruf der
 * öffentlichen URL automatisch einen neuen Prozess, sobald der alte weg ist.
 */

/** Beendet den eigenen Prozess nach `delayMs` regulär (nur im Produktions-Build). */
export function scheduleSelfRestart(delayMs = 1500, reason = ""): boolean {
  // Der lokale Dev-Server darf sich nie selbst beenden.
  if (process.env.NODE_ENV !== "production") return false;
  console.log(
    `[self-restart] Prozess ${process.pid} beendet sich in ${delayMs}ms${reason ? ` – ${reason}` : ""}`
  );
  setTimeout(() => process.exit(0), delayMs);
  return true;
}

/**
 * Rendert eine ImageResponse vollständig in den Speicher und liefert sie aus.
 * Schlägt das Rendern fehl (typisch: kaputter Prozess nach Foto-Generierung),
 * wird ein Neustart eingeplant und – je nach Aufrufer – eine Seite mit
 * automatischem Neuladen (Browser) oder ein 503-JSON (API, Crawler) geliefert.
 */
export async function renderImageOrHeal(
  image: Response,
  req: Request,
  label: string
): Promise<Response> {
  try {
    const buf = await image.arrayBuffer();
    return new Response(buf, { status: 200, headers: image.headers });
  } catch (e) {
    console.error(`[${label}] Render fehlgeschlagen:`, e);
    const restarting = scheduleSelfRestart(1500, `${label}: Render-Fehler`);
    return unavailableResponse(req, { error: "Grafik konnte nicht gerendert werden", restarting });
  }
}

/**
 * 503-Antwort für „Server startet gerade neu": Browser bekommen eine kleine
 * Seite, die sich nach 10 Sekunden selbst neu lädt (max. 4-mal), alle anderen
 * ein JSON mit Retry-After.
 */
export function unavailableResponse(req: Request, body: Record<string, unknown>): Response {
  const headers = { "Retry-After": "10", "Cache-Control": "no-store" };
  const wantsHtml = (req.headers.get("accept") || "").includes("text/html");
  if (wantsHtml) {
    return new Response(retryHtml(), {
      status: 503,
      headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
    });
  }
  return NextResponse.json(
    { ...body, hint: "Server startet neu – bitte in ca. 10 Sekunden erneut versuchen." },
    { status: 503, headers }
  );
}

function retryHtml(): string {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Einen Moment …</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui,sans-serif;background:#F8F1E7;color:#221A12;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{max-width:420px;text-align:center;padding:32px}.spin{width:36px;height:36px;border:4px solid #E0902F;border-top-color:transparent;border-radius:50%;margin:0 auto 18px;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}
p{color:#7A6A56;line-height:1.5}</style></head><body><div class="box"><div class="spin"></div>
<h2>Grafik wird vorbereitet …</h2><p id="m">Der Server startet gerade neu. Diese Seite lädt in 10 Sekunden automatisch neu.</p></div>
<script>(function(){var k="cul-retry",now=Date.now(),s;try{s=JSON.parse(sessionStorage.getItem(k)||"{}")}catch(e){s={}}
if(!s.t||now-s.t>120000){s={t:now,n:0}}s.n++;try{sessionStorage.setItem(k,JSON.stringify(s))}catch(e){}
if(s.n<=4){setTimeout(function(){location.reload()},10000)}else{document.getElementById("m").textContent="Leider klappt es gerade nicht – bitte in einer Minute erneut versuchen.";try{sessionStorage.removeItem(k)}catch(e){}}})();</script>
</body></html>`;
}
