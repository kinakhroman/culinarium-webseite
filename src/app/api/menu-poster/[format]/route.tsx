import { ImageResponse } from "next/og";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { getWeekPlanRows } from "@/lib/menu-db";
import { getWeekStart, formatWeekRange, formatCurrency, DAYS_DE } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FORMATS = {
  web: { w: 1200, h: 630 },
  square: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
  print: { w: 1240, h: 1754 },
  // Kleineres, leichteres Format für E-Mail (lädt zuverlässig in Outlook;
  // 1080px war ~1,5 MB/4 s und wurde von Mail-Clients abgebrochen).
  mail: { w: 760, h: 760 },
} as const;

const PAPER = "#F8F1E7";
const CARD = "#FFFFFF";
const INK = "#221A12";
const INK_SOFT = "#7A6A56";
const BRAND = "#4A2410";
const BRAND_DEEP = "#321606";
const PAPRIKA = "#C0381C";
const EMBER = "#E0902F";

function font(name: string) {
  return readFileSync(join(process.cwd(), "public", "fonts", name));
}

/**
 * Bild als Data-URI direkt von der Platte – KEIN HTTP-Selbstabruf.
 * (Ein fehlgeschlagener Fetch ließ satori mit "Image size cannot be
 * determined" abstürzen → 503 für die ganze Grafik. Außerdem stimmt so der
 * Bildtyp immer: manche .png-Dateien enthalten recodierte JPEG-Daten.)
 */
function fileAsDataUri(p: string): string | null {
  try {
    if (!existsSync(p)) return null;
    const buf = readFileSync(p);
    // Schutz fürs knappe Speicherlimit auf dem Shared-Hosting
    if (buf.length > 3_000_000) return null;
    const mime =
      buf[0] === 0x89 ? "image/png" : buf[0] === 0xff ? "image/jpeg" : null;
    if (!mime) return null;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Gericht-Foto als Data-URI, wenn die Datei existiert. */
function dishPhotoUrl(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return fileAsDataUri(join(process.cwd(), "public", "images", "menu", `${slug}.png`));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ format: string }> }
) {
  const { format } = await params;
  const size = FORMATS[format as keyof typeof FORMATS] ?? FORMATS.square;
  const s = size.h / 1080; // Skalierung relativ zum Quadrat
  // Horizontale Skalierung für Kopf-/Titel-/Fußzeile: bei sehr hohen Formaten
  // (Story) an der BREITE deckeln, sonst läuft der Kopf rechts aus dem Bild.
  // Faktor 1.414 = Verhältnis beim A4-Druck (dort passt alles gerade gut).
  const hs = Math.min(s, (size.w / 1080) * 1.414);

  // Optional ?week=YYYY-MM-DD (fürs Druck-Archiv); sonst aktuelle Woche
  const weekParam = new URL(req.url).searchParams.get("week");
  let weekStart: Date;
  if (weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam)) {
    weekStart = new Date(`${weekParam}T00:00:00`);
    weekStart.setHours(0, 0, 0, 0);
  } else {
    weekStart = getWeekStart();
  }
  const rows = await getWeekPlanRows(weekStart);
  const logoImg = fileAsDataUri(join(process.cwd(), "public", "images", "logo-emblem.png"));

  const byDay: Record<
    number,
    { name: string; price: number; note: string | null; slug: string }[]
  > = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  for (const r of rows) {
    if (r.dayOfWeek >= 0 && r.dayOfWeek <= 4) {
      byDay[r.dayOfWeek].push({ name: r.name, price: r.price, note: r.note, slug: r.slug });
    }
  }

  const hasItems = rows.length > 0;

  // Einheitspreis erkennen: haben ALLE Gerichte (Mo–Fr) denselben Preis > 0,
  // wird der Preis nur EINMAL oben gezeigt (statt in jeder Zeile) – das schafft
  // Platz für größere Fotos.
  const planned = rows.filter((r) => r.dayOfWeek >= 0 && r.dayOfWeek <= 4);
  const prices = planned.map((r) => r.price);
  const uniformPrice =
    prices.length > 0 && prices.every((p) => p > 0 && p === prices[0]) ? prices[0] : null;

  // Schrift der Gerichtnamen an den LÄNGSTEN Namen der Woche UND die Formatbreite
  // koppeln, damit lange Namen nicht unten aus der Karte laufen (v. a. Story:
  // schmale Textspalte bei großer Skalierung → Text braucht kleinere Schrift).
  const maxNameLen = planned.reduce((m, r) => Math.max(m, r.name.length), 0);
  // Textspaltenbreite normalisiert auf Quadrat-Einheiten (685 = Spalte im 1080er-Quadrat)
  const textCapacity = (size.w * 0.69 - 60 * s) / s;
  const effLen = (maxNameLen * 685) / Math.max(textCapacity, 1);
  const printDishFont =
    effLen >= 90 ? 18 : effLen >= 70 ? 21 : effLen >= 50 ? 24 : effLen >= 40 ? 27 : effLen >= 30 ? 30 : 33;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: PAPER,
          backgroundImage: `radial-gradient(circle at 100% 0%, rgba(224,144,47,0.10), transparent 45%)`,
          fontFamily: "Hanken",
          color: INK,
        }}
      >
        {/* Kopfband */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: BRAND,
            backgroundImage: `linear-gradient(120deg, ${BRAND_DEEP}, ${BRAND})`,
            padding: `${18 * hs}px ${52 * hs}px`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Logo-Emblem in hellem Kreis (sonst auf dunklem Band unsichtbar) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 88 * hs,
                height: 88 * hs,
                borderRadius: 999,
                backgroundColor: PAPER,
                marginRight: 22 * hs,
                flexShrink: 0,
              }}
            >
              {logoImg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoImg}
                  alt=""
                  width={74 * hs}
                  height={74 * hs}
                  style={{ width: 74 * hs, height: 74 * hs }}
                />
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontFamily: "Playfair",
                  fontWeight: 700,
                  fontSize: 50 * hs,
                  color: PAPER,
                  lineHeight: 1,
                }}
              >
                Culinarium
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 19 * hs,
                  letterSpacing: 6 * hs,
                  color: EMBER,
                  marginTop: 7 * hs,
                }}
              >
                BERLIN.DE
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div
              style={{
                fontFamily: "Playfair",
                fontWeight: 700,
                fontSize: 38 * hs,
                color: EMBER,
                lineHeight: 1,
              }}
            >
              Mo–Fr
            </div>
            <div
              style={{
                fontSize: 17 * hs,
                color: PAPER,
                letterSpacing: 4 * hs,
                marginTop: 6 * hs,
              }}
            >
              MITTAGSTISCH
            </div>
          </div>
        </div>

        {/* Titel + Woche */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: `${10 * hs}px ${52 * hs}px ${2 * hs}px`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Playfair",
                fontWeight: 700,
                fontSize: 46 * hs,
                color: PAPRIKA,
                lineHeight: 1,
              }}
            >
              Menü der Woche
            </div>
            <div style={{ display: "flex", fontSize: 23 * hs, color: INK_SOFT, marginTop: 8 * hs }}>
              {formatWeekRange(weekStart)}
            </div>
          </div>
          {uniformPrice !== null && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: PAPRIKA,
                  backgroundImage: `linear-gradient(135deg, ${EMBER}, ${PAPRIKA})`,
                  color: PAPER,
                  fontWeight: 700,
                  fontSize: 40 * hs,
                  padding: `${9 * hs}px ${26 * hs}px`,
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                  boxShadow: `0 ${4 * hs}px ${12 * hs}px rgba(192,56,28,0.25)`,
                }}
              >
                {formatCurrency(uniformPrice)}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 16 * hs,
                  color: INK_SOFT,
                  letterSpacing: 2 * hs,
                  marginTop: 6 * hs,
                }}
              >
                pro Gericht · mit Salat
              </div>
            </div>
          )}
        </div>

        {/* Tageskarten – großes Gericht-Foto je Tag mit Text-Overlay */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: `${6 * s}px ${52 * hs}px ${6 * s}px`,
            justifyContent: hasItems ? "flex-start" : "center",
          }}
        >
          {hasItems ? (
            DAYS_DE.slice(0, 5).map((dayName, i) => {
              const dishes = byDay[i];
              const empty = dishes.length === 0;
              const dayImg = empty
                ? null
                : dishes.map((d) => dishPhotoUrl(d.slug)).find(Boolean) || null;

              // Einheitliches Layout für ALLE Formate (wie A4-Aushang):
              // Foto-Kachel links, Text auf hellem Grund rechts.
              const photoW = Math.round(size.w * 0.31);
              return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flex: 1,
                      alignItems: "stretch",
                      marginBottom: i < 4 ? 14 * s : 0,
                      borderRadius: 20 * s,
                      overflow: "hidden",
                      backgroundColor: CARD,
                      border: `${1 * s}px solid rgba(74,36,16,0.10)`,
                      boxShadow: `0 ${5 * s}px ${16 * s}px rgba(74,36,16,0.10)`,
                    }}
                  >
                    {/* Foto-Kachel links */}
                    <div
                      style={{
                        display: "flex",
                        position: "relative",
                        width: photoW,
                        flexShrink: 0,
                        backgroundColor: empty ? PAPER : BRAND,
                      }}
                    >
                      {dayImg && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={dayImg}
                          alt=""
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>
                    {/* Text rechts auf hellem Grund */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        justifyContent: "center",
                        padding: `${10 * s}px ${30 * s}px`,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          fontWeight: 700,
                          fontSize: 19 * s,
                          letterSpacing: 3 * s,
                          textTransform: "uppercase",
                          color: empty ? INK_SOFT : PAPRIKA,
                          marginBottom: 6 * s,
                        }}
                      >
                        {dayName}
                      </div>
                      {empty ? (
                        <div style={{ display: "flex", fontSize: 28 * s, color: INK_SOFT, fontStyle: "italic" }}>
                          Ruhetag
                        </div>
                      ) : (
                        dishes.map((d, j) => (
                          <div
                            key={j}
                            style={{
                              display: "flex",
                              fontFamily: "Playfair",
                              fontWeight: 700,
                              fontSize: printDishFont * s,
                              color: INK,
                              lineHeight: 1.12,
                              marginTop: j > 0 ? 6 * s : 0,
                            }}
                          >
                            {d.name}
                          </div>
                        ))
                      )}
                    </div>
                    {uniformPrice === null && !empty && dishes[0] && dishes[0].price > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          alignSelf: "center",
                          backgroundColor: PAPRIKA,
                          backgroundImage: `linear-gradient(135deg, ${EMBER}, ${PAPRIKA})`,
                          color: PAPER,
                          fontWeight: 700,
                          fontSize: 26 * s,
                          padding: `${7 * s}px ${17 * s}px`,
                          borderRadius: 999,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          marginRight: 30 * s,
                        }}
                      >
                        {formatCurrency(dishes[0].price)}
                      </div>
                    )}
                  </div>
                );
            })
          ) : (
            <div
              style={{
                display: "flex",
                fontSize: 36 * s,
                color: INK_SOFT,
                fontStyle: "italic",
              }}
            >
              Das Menü dieser Woche folgt in Kürze.
            </div>
          )}
        </div>

        {/* Fußband */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: INK,
            color: PAPER,
            padding: `${12 * hs}px ${52 * hs}px`,
          }}
        >
          <div style={{ display: "flex", fontWeight: 700, fontSize: 23 * hs, color: EMBER }}>
            culinarium-berlin.de
          </div>
          <div style={{ display: "flex", fontSize: 20 * hs }}>030 56553364 · frisch &amp; regional</div>
        </div>
      </div>
    ),
    {
      width: size.w,
      height: size.h,
      fonts: [
        { name: "Playfair", data: font("playfair-700.woff"), weight: 700, style: "normal" },
        { name: "PlayfairX", data: font("playfair-700-ext.woff"), weight: 700, style: "normal" },
        { name: "Hanken", data: font("hanken-500.woff"), weight: 500, style: "normal" },
        { name: "HankenX", data: font("hanken-500-ext.woff"), weight: 500, style: "normal" },
        { name: "Hanken", data: font("hanken-700.woff"), weight: 700, style: "normal" },
        { name: "HankenX", data: font("hanken-700-ext.woff"), weight: 700, style: "normal" },
      ],
    }
  );
}
