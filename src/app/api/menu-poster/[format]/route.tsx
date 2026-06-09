import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
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
const PAPER_DEEP = "#F0E5D4";
const INK = "#221A12";
const INK_SOFT = "#6B5A47";
const BRAND = "#4A2410";
const PAPRIKA = "#C0381C";
const EMBER = "#E0902F";

function font(name: string) {
  return readFileSync(join(process.cwd(), "public", "fonts", name));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ format: string }> }
) {
  const { format } = await params;
  const size = FORMATS[format as keyof typeof FORMATS] ?? FORMATS.square;
  const s = size.h / 1080; // Skalierung relativ zum Quadrat

  const weekStart = getWeekStart();
  const rows = await getWeekPlanRows(weekStart);

  const byDay: Record<number, { name: string; price: number; note: string | null }[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [],
  };
  for (const r of rows) {
    if (r.dayOfWeek >= 0 && r.dayOfWeek <= 4) {
      byDay[r.dayOfWeek].push({ name: r.name, price: r.price, note: r.note });
    }
  }

  const hasItems = rows.length > 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: PAPER,
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
            padding: `${40 * s}px ${56 * s}px`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Playfair",
                fontWeight: 700,
                fontSize: 64 * s,
                color: PAPER,
                lineHeight: 1,
              }}
            >
              Culinarium
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 22 * s,
                letterSpacing: 6 * s,
                color: EMBER,
                marginTop: 8 * s,
              }}
            >
              AM BIESENHORST
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div
              style={{
                fontFamily: "Playfair",
                fontWeight: 700,
                fontSize: 46 * s,
                color: EMBER,
                lineHeight: 1,
              }}
            >
              Mo–Fr
            </div>
            <div
              style={{
                fontSize: 20 * s,
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
            flexDirection: "column",
            padding: `${40 * s}px ${56 * s}px ${16 * s}px`,
          }}
        >
          <div
            style={{
              fontFamily: "Playfair",
              fontWeight: 700,
              fontSize: 58 * s,
              color: PAPRIKA,
              lineHeight: 1,
            }}
          >
            Menü der Woche
          </div>
          <div style={{ fontSize: 28 * s, color: INK_SOFT, marginTop: 10 * s }}>
            {formatWeekRange(weekStart)}
          </div>
        </div>

        {/* Tage */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: `${8 * s}px ${56 * s}px ${24 * s}px`,
            justifyContent: hasItems ? "flex-start" : "center",
          }}
        >
          {hasItems ? (
            DAYS_DE.slice(0, 5).map((dayName, i) => {
              const dishes = byDay[i];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    padding: `${18 * s}px 0`,
                    borderBottom: `${2 * s}px solid ${PAPER_DEEP}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontFamily: "Playfair",
                      fontWeight: 700,
                      fontSize: 30 * s,
                      color: BRAND,
                      width: 180 * s,
                      flexShrink: 0,
                    }}
                  >
                    {dayName}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    {dishes.length > 0 ? (
                      dishes.map((d, j) => (
                        <div
                          key={j}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginBottom: j < dishes.length - 1 ? 6 * s : 0,
                          }}
                        >
                          <div style={{ display: "flex", fontWeight: 700, fontSize: 30 * s, color: INK }}>
                            {d.name}
                          </div>
                          {d.price > 0 && (
                            <div style={{ display: "flex", fontWeight: 700, fontSize: 30 * s, color: PAPRIKA }}>
                              {formatCurrency(d.price)}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ display: "flex", fontSize: 26 * s, color: INK_SOFT, fontStyle: "italic" }}>
                        Ruhetag
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ display: "flex", fontSize: 36 * s, color: INK_SOFT, fontStyle: "italic" }}>
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
            padding: `${28 * s}px ${56 * s}px`,
          }}
        >
          <div style={{ display: "flex", fontWeight: 700, fontSize: 28 * s, color: EMBER }}>
            culinarium-berlin.de
          </div>
          <div style={{ display: "flex", fontSize: 26 * s }}>030 56553364 · frisch & regional</div>
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
