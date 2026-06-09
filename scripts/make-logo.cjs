// Wandelt das Emblem (Variante A, auf Creme) in ein sauberes, quadratisches,
// transparentes Logo-Icon um: Creme auskeyen -> trimmen -> quadratisch -> 512px.
const sharp = require("sharp");
const path = require("path");

const SRC = path.join(__dirname, "..", "nanobanana-output", "minimalist_elegant_emblem_logo_m.png");
const OUT = path.join(__dirname, "..", "public", "images", "logo-icon.png");

(async () => {
  const img = sharp(SRC).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Creme/heller Hintergrund -> transparent. Braun (dunkel) & Amber (R hoch, G mittel) bleiben.
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const isCream = r > 200 && g > 188 && b > 168;       // helles Creme
    const isAmber = r > 200 && g >= 110 && g <= 188 && b < 110; // Amber NICHT keyen
    if (isCream && !isAmber) {
      data[i + 3] = 0; // alpha = 0
    }
  }

  const keyed = sharp(data, { raw: { width, height, channels } }).png();

  // Auf den sichtbaren Inhalt zuschneiden, dann quadratisch auffüllen, dann 512px.
  const trimmed = await keyed.trim({ threshold: 10 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const side = Math.max(meta.width, meta.height);
  const pad = Math.round(side * 0.08); // etwas Rand
  const canvas = side + pad * 2;

  await sharp({
    create: { width: canvas, height: canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: trimmed, gravity: "centre" }])
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(OUT);

  console.log("Logo geschrieben:", OUT, `(${canvas}px -> 512px)`);
})().catch((e) => { console.error(e); process.exit(1); });
