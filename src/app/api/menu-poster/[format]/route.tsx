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

/** Absolute URL zum Gericht-Foto, wenn die Datei existiert (next/og lädt sie). */
function dishPhotoUrl(slug: string | null | undefined, baseUrl: string): string | null {
  if (!slug) return null;
  try {
    const p = join(process.cwd(), "public", "images", "menu", `${slug}.png`);
    if (!existsSync(p)) return null;
    return `${baseUrl}/images/menu/${slug}.png`;
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ format: string }> }
) {
  const { format } = await params;
  const size = FORMATS[format as keyof typeof FORMATS] ?? FORMATS.square;
  const s = size.h / 1080; // Skalierung relativ zum Quadrat

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://culinarium-berlin.de";

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
            padding: `${24 * s}px ${52 * s}px`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Logo-Emblem in hellem Kreis (sonst auf dunklem Band unsichtbar) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 88 * s,
                height: 88 * s,
                borderRadius: 999,
                backgroundColor: PAPER,
                marginRight: 22 * s,
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${baseUrl}/images/logo-emblem.png`}
                alt=""
                width={74 * s}
                height={74 * s}
                style={{ width: 74 * s, height: 74 * s }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontFamily: "Playfair",
                  fontWeight: 700,
                  fontSize: 50 * s,
                  color: PAPER,
                  lineHeight: 1,
                }}
              >
                Culinarium
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 19 * s,
                  letterSpacing: 6 * s,
                  color: EMBER,
                  marginTop: 7 * s,
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
                fontSize: 38 * s,
                color: EMBER,
                lineHeight: 1,
              }}
            >
              Mo–Fr
            </div>
            <div
              style={{
                fontSize: 17 * s,
                color: PAPER,
                letterSpacing: 4 * s,
                marginTop: 6 * s,
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
            padding: `${16 * s}px ${52 * s}px ${4 * s}px`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Playfair",
                fontWeight: 700,
                fontSize: 46 * s,
                color: PAPRIKA,
                lineHeight: 1,
              }}
            >
              Menü der Woche
            </div>
            <div style={{ display: "flex", fontSize: 23 * s, color: INK_SOFT, marginTop: 8 * s }}>
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
                  fontSize: 40 * s,
                  padding: `${9 * s}px ${26 * s}px`,
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                  boxShadow: `0 ${4 * s}px ${12 * s}px rgba(192,56,28,0.25)`,
                }}
              >
                {formatCurrency(uniformPrice)}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 16 * s,
                  color: INK_SOFT,
                  letterSpacing: 2 * s,
                  marginTop: 6 * s,
                }}
              >
                pro Gericht · mit Salat
              </div>
            </div>
          )}
        </div>

        {/* Tageskarten */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: `${8 * s}px ${52 * s}px ${8 * s}px`,
            justifyContent: hasItems ? "flex-start" : "center",
          }}
        >
          {hasItems ? (
            DAYS_DE.slice(0, 5).map((dayName, i) => {
              const dishes = byDay[i];
              const empty = dishes.length === 0;
              const PHOTO = 134 * s;
              const dayImg = empty
                ? null
                : dishes.map((d) => dishPhotoUrl(d.slug, baseUrl)).find(Boolean) || null;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    marginBottom: i < 4 ? 6 * s : 0,
                    borderRadius: 18 * s,
                    overflow: "hidden",
                    backgroundColor: CARD,
                    boxShadow: `0 ${4 * s}px ${14 * s}px rgba(74,36,16,0.10)`,
                  }}
                >
                  {/* Akzentbalken */}
                  <div
                    style={{
                      display: "flex",
                      width: 12 * s,
                      backgroundColor: EMBER,
                      backgroundImage: empty
                        ? "none"
                        : `linear-gradient(180deg, ${PAPRIKA}, ${EMBER})`,
                    }}
                  />
                  {/* Inhalt: Foto + Text */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: 1,
                      padding: `${7 * s}px ${22 * s}px`,
                    }}
                  >
                    {dayImg && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dayImg}
                        alt=""
                        width={PHOTO}
                        height={PHOTO}
                        style={{
                          width: PHOTO,
                          height: PHOTO,
                          borderRadius: 16 * s,
                          objectFit: "cover",
                          marginRight: 20 * s,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          fontFamily: "Playfair",
                          fontWeight: 700,
                          fontSize: 22 * s,
                          color: BRAND,
                          marginBottom: empty ? 0 : 6 * s,
                        }}
                      >
                        {dayName}
                      </div>
                      {empty ? (
                        <div
                          style={{
                            display: "flex",
                            fontSize: 20 * s,
                            color: INK_SOFT,
                            fontStyle: "italic",
                          }}
                        >
                          Ruhetag
                        </div>
                      ) : (
                        dishes.map((d, j) => (
                          <div
                            key={j}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginTop: j > 0 ? 6 * s : 0,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                flex: 1,
                                paddingRight: 14 * s,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  fontWeight: 700,
                                  fontSize: 22 * s,
                                  color: INK,
                                  lineHeight: 1.12,
                                }}
                              >
                                {d.name}
                              </div>
                              {d.note && (
                                <div
                                  style={{
                                    display: "flex",
                                    fontSize: 15 * s,
                                    color: INK_SOFT,
                                    marginTop: 3 * s,
                                  }}
                                >
                                  {d.note}
                                </div>
                              )}
                            </div>
                            {uniformPrice === null && d.price > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  backgroundColor: PAPRIKA,
                                  backgroundImage: `linear-gradient(135deg, ${EMBER}, ${PAPRIKA})`,
                                  color: PAPER,
                                  fontWeight: 700,
                                  fontSize: 21 * s,
                                  padding: `${7 * s}px ${15 * s}px`,
                                  borderRadius: 999,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatCurrency(d.price)}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
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
            padding: `${15 * s}px ${52 * s}px`,
          }}
        >
          <div style={{ display: "flex", fontWeight: 700, fontSize: 23 * s, color: EMBER }}>
            culinarium-berlin.de
          </div>
          <div style={{ display: "flex", fontSize: 20 * s }}>030 56553364 · frisch &amp; regional</div>
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
