import { ImageResponse } from "next/og";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { getWeekPlanRows } from "@/lib/menu-db";
import { getWeekStart, formatCurrency, DAYS_DE } from "@/lib/utils";

export const dynamic = "force-dynamic";

const W = 1080;
const H = 1920;

const PAPER = "#F8F1E7";
const BRAND = "#4A2410";
const BRAND_DEEP = "#321606";
const PAPRIKA = "#C0381C";
const EMBER = "#E0902F";

// Restportionen-Preis ab 14 Uhr (per ?rest=4.9 übersteuerbar)
const REST_PRICE_DEFAULT = 4.9;

function font(name: string) {
  return readFileSync(join(process.cwd(), "public", "fonts", name));
}

/** Bild als Data-URI von der Platte (kein HTTP-Selbstabruf, korrekter MIME). */
function fileAsDataUri(p: string): string | null {
  try {
    if (!existsSync(p)) return null;
    const buf = readFileSync(p);
    if (buf.length > 3_000_000) return null;
    const mime = buf[0] === 0x89 ? "image/png" : buf[0] === 0xff ? "image/jpeg" : null;
    if (!mime) return null;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * GET /api/daily-story – Instagram-Story (1080×1920) fürs HEUTIGE Tagesgericht:
 * Gericht-Foto formatfüllend, Logo oben, unten Gericht + Preis-Botschaft
 * („Heute nur 6,90 €" / „Ab 14 Uhr: Restportionen nur 4,90 €").
 * Optional: ?day=0-4 (Mo–Fr, Standard: heute), ?rest=4.9
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const now = new Date();

  const dayParam = url.searchParams.get("day");
  let dayIdx: number;
  if (dayParam !== null && /^[0-4]$/.test(dayParam)) {
    dayIdx = parseInt(dayParam, 10);
  } else {
    const jsDay = now.getDay(); // 0=So … 6=Sa
    dayIdx = jsDay === 0 || jsDay === 6 ? 0 : jsDay - 1;
  }

  const restParam = parseFloat(url.searchParams.get("rest") || "");
  const restPrice = Number.isFinite(restParam) && restParam > 0 ? restParam : REST_PRICE_DEFAULT;

  const rows = await getWeekPlanRows(getWeekStart(now));
  const dish = rows.find((r) => r.dayOfWeek === dayIdx) || null;

  const photo = dish
    ? fileAsDataUri(join(process.cwd(), "public", "images", "menu", `${dish.slug}.png`))
    : null;
  const logoImg = fileAsDataUri(join(process.cwd(), "public", "images", "logo-emblem.png"));

  // Datum des Gericht-Tags in dieser Woche (z. B. "03.07.")
  const dayDate = new Date(getWeekStart(now));
  dayDate.setDate(dayDate.getDate() + dayIdx);
  const dateTxt = `${String(dayDate.getDate()).padStart(2, "0")}.${String(
    dayDate.getMonth() + 1
  ).padStart(2, "0")}.`;

  const name = dish?.name || "Frisch gekochter Mittagstisch";
  const nameFont = name.length >= 45 ? 56 : name.length >= 30 ? 64 : 74;
  const price = dish && dish.price > 0 ? dish.price : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: BRAND,
          backgroundImage: `linear-gradient(160deg, ${BRAND_DEEP}, ${BRAND})`,
          fontFamily: "Hanken",
          color: "#FFFFFF",
        }}
      >
        {/* Gericht-Foto formatfüllend */}
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
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
        {/* Lesbarkeits-Verläufe oben + unten */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `linear-gradient(180deg, rgba(28,14,6,0.82) 0%, rgba(28,14,6,0.0) 22%, rgba(28,14,6,0.0) 45%, rgba(28,14,6,0.92) 78%)`,
          }}
        />

        {/* Kopf: Logo + Marke */}
        <div
          style={{
            display: "flex",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 64,
          }}
        >
          {logoImg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 110,
                height: 110,
                borderRadius: 999,
                backgroundColor: PAPER,
                marginRight: 28,
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoImg} alt="" width={92} height={92} style={{ width: 92, height: 92 }} />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Playfair",
                fontWeight: 700,
                fontSize: 66,
                color: PAPER,
                lineHeight: 1,
              }}
            >
              Culinarium
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: 8,
                color: EMBER,
                marginTop: 10,
              }}
            >
              BERLIN.DE
            </div>
          </div>
        </div>

        {/* Unterer Block: Tag, Gericht, Preise */}
        <div
          style={{
            display: "flex",
            position: "relative",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "auto",
            padding: "0 72px 96px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: EMBER,
            }}
          >
            {`${DAYS_DE[dayIdx]} · ${dateTxt}`}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Playfair",
              fontWeight: 700,
              fontSize: nameFont,
              lineHeight: 1.12,
              marginTop: 18,
            }}
          >
            {name}
          </div>
          {dish?.note && (
            <div style={{ display: "flex", fontSize: 30, color: PAPER, opacity: 0.85, marginTop: 12 }}>
              {dish.note}
            </div>
          )}

          {price !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: PAPRIKA,
                backgroundImage: `linear-gradient(135deg, ${EMBER}, ${PAPRIKA})`,
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 52,
                padding: "16px 46px",
                borderRadius: 999,
                marginTop: 36,
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}
            >
              {`Heute nur ${formatCurrency(price)}`}
            </div>
          )}

          {/* 14-Uhr-Deal – kompakt */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: `3px solid ${EMBER}`,
              color: PAPER,
              fontWeight: 700,
              fontSize: 32,
              padding: "12px 34px",
              borderRadius: 999,
              marginTop: 22,
              backgroundColor: "rgba(28,14,6,0.55)",
            }}
          >
            {`Ab 14 Uhr: Restportionen nur ${formatCurrency(restPrice)}`}
          </div>

          <div style={{ display: "flex", fontSize: 28, color: PAPER, opacity: 0.8, marginTop: 40 }}>
            culinarium-berlin.de · 030 56553364
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
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
