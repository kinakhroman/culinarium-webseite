import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

// A4 Hochformat @ 150 dpi
const W = 1240;
const H = 1754;

const PAPER = "#F8F1E7";
const INK = "#221A12";
const INK_SOFT = "#6B5A47";
const BRAND = "#4A2410";
const PAPRIKA = "#C0381C";
const EMBER = "#E0902F";

function font(name: string) {
  return readFileSync(join(process.cwd(), "public", "fonts", name));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url") || "https://culinarium-berlin.de";

  const qrDataUrl = await QRCode.toDataURL(target, {
    margin: 1,
    width: 720,
    errorCorrectionLevel: "M",
    color: { dark: "#221A12", light: "#FFFFFF" },
  });

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
          padding: 0,
        }}
      >
        {/* Kopfband */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: BRAND,
            padding: "56px 56px 44px",
          }}
        >
          <div
            style={{
              fontFamily: "Playfair",
              fontWeight: 700,
              fontSize: 84,
              color: PAPER,
              lineHeight: 1,
            }}
          >
            Culinarium
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: 8,
              color: EMBER,
              marginTop: 12,
            }}
          >
            AM BIESENHORST
          </div>
        </div>

        {/* Inhalt */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            padding: "60px 56px 0",
          }}
        >
          <div
            style={{
              fontFamily: "Playfair",
              fontWeight: 700,
              fontSize: 70,
              color: PAPRIKA,
              textAlign: "center",
              lineHeight: 1.05,
            }}
          >
            Jetzt online bestellen
          </div>
          <div
            style={{
              fontSize: 34,
              color: INK_SOFT,
              marginTop: 18,
              textAlign: "center",
            }}
          >
            Menü ansehen · Wochenplan · Abholung oder Lieferung
          </div>

          {/* QR-Karte */}
          <div
            style={{
              display: "flex",
              marginTop: 56,
              padding: 36,
              backgroundColor: "#FFFFFF",
              borderRadius: 40,
              border: `6px solid ${EMBER}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={640} height={640} alt="QR-Code" />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 40,
              fontSize: 38,
              fontWeight: 700,
              color: BRAND,
            }}
          >
            📷 Mit der Handy-Kamera scannen
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: PAPRIKA,
              marginTop: 8,
            }}
          >
            culinarium-berlin.de
          </div>
        </div>

        {/* Fußband */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: INK,
            color: PAPER,
            padding: "30px 56px",
            fontSize: 28,
          }}
        >
          030 56553364 · Am alten Flugplatz 100, 10318 Berlin · frisch &amp; regional
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Playfair", data: font("playfair-700.woff"), weight: 700, style: "normal" },
        { name: "Hanken", data: font("hanken-500.woff"), weight: 500, style: "normal" },
        { name: "Hanken", data: font("hanken-700.woff"), weight: 700, style: "normal" },
      ],
    }
  );
}
