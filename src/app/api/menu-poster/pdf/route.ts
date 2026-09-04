import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { unavailableResponse } from "@/lib/self-restart";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// A4 in PDF-Punkten
const A4W = 595.28;
const A4H = 841.89;

/** "10.08.-14.08.2026" aus dem Wochen-Montag – für Dateiname & PDF-Titel. */
function rangeName(weekISO: string): string {
  const [y, m, d] = weekISO.split("-").map(Number);
  const mon = new Date(y, m - 1, d);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  const dd = (x: Date) => String(x.getDate()).padStart(2, "0");
  const mm = (x: Date) => String(x.getMonth() + 1).padStart(2, "0");
  return `${dd(mon)}.${mm(mon)}.-${dd(fri)}.${mm(fri)}.${fri.getFullYear()}`;
}

/**
 * GET /api/menu-poster/pdf?week=YYYY-MM-DD
 * Liefert den A4-Aushang als ECHTES PDF (Download). Rendert intern die
 * bestehende Print-Grafik und bettet sie seitenfüllend in eine A4-Seite ein.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const week = url.searchParams.get("week") || "";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://culinarium-berlin.de";

  const posterUrl = `${baseUrl}/api/menu-poster/print${
    /^\d{4}-\d{2}-\d{2}$/.test(week) ? `?week=${week}` : ""
  }`;
  const res = await fetch(posterUrl, { cache: "no-store" });
  if (!res.ok) {
    // Die Poster-Route heilt sich bei Render-Fehlern selbst (Prozess-Neustart,
    // siehe self-restart.ts). Browser bekommen eine Seite, die sich nach 10s
    // automatisch neu lädt und dann das PDF ausliefert; API-Aufrufer ein 503.
    return unavailableResponse(req, {
      error: `Poster konnte nicht gerendert werden (HTTP ${res.status})`,
    });
  }
  const png = new Uint8Array(await res.arrayBuffer());

  const pdf = await PDFDocument.create();
  const img = await pdf.embedPng(png);
  const page = pdf.addPage([A4W, A4H]);
  const scale = Math.min(A4W / img.width, A4H / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  page.drawImage(img, { x: (A4W - w) / 2, y: (A4H - h) / 2, width: w, height: h });

  const range = /^\d{4}-\d{2}-\d{2}$/.test(week) ? rangeName(week) : "aktuelle Woche";
  pdf.setTitle(`Culinarium Wochenmenü ${range}`);
  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Culinarium Aushang ${range}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
