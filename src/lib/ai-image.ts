/**
 * Server-seitige Food-Foto-Generierung. Speichert nach
 * public/images/menu/{slug}.png, damit menuImage() das Foto automatisch findet.
 *
 * Anbieter-Kette (seit 09.10.2026): erst Gemini, bei Fehler automatisch OpenAI.
 * Anlass: Das Gemini-Guthaben war aufgebraucht (HTTP 402), und die Woche
 * 12.10. bekam kein einziges Foto. Mit zwei Anbietern bleibt keine Woche mehr
 * leer, solange einer von beiden funktioniert.
 *
 *  - GEMINI_API_KEY  → gemini-2.5-flash-image
 *  - OPENAI_API_KEY  → gpt-image-1 (überschreibbar per OPENAI_IMAGE_MODEL);
 *                      verlangt OpenAI dafür eine Organisations-Verifizierung
 *                      (HTTP 403), wird automatisch dall-e-3 genommen.
 *
 * Best-effort: Fehler werfen nicht, sondern geben ok:false mit Grund zurück.
 */
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const STYLE =
  "professional appetizing food photography, overhead 45-degree angle, served on a rustic ceramic plate on a dark wooden table, warm natural daylight, shallow depth of field, high detail, mouthwatering, no text, square 1:1 composition";

const GEMINI_MODEL = "gemini-2.5-flash-image";

type ProviderResult = { ok: true; image: Buffer; provider: string } | { ok: false; error: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Gemini: bis zu 3 Versuche bei transienten Fehlern (429/5xx/Netz). */
async function geminiImage(prompt: string): Promise<ProviderResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, error: "GEMINI_API_KEY fehlt" };

  let res: Response | null = null;
  let lastErr = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (attempt > 1) await sleep(attempt * 5000);
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    ).catch(() => null);
    if (res?.ok) break;
    const status = res?.status ?? 0;
    lastErr = `Gemini HTTP ${status}`;
    // Nur bei transienten Fehlern erneut versuchen (402 Guthaben leer = sofort weiter)
    if (res && status !== 429 && status < 500) break;
  }
  if (!res || !res.ok) {
    const t = res ? await res.text().catch(() => "") : "";
    return { ok: false, error: `${lastErr}: ${t.slice(0, 160)}` };
  }
  const data = await res.json();
  const parts: Array<{ inlineData?: { data?: string } }> =
    data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img?.inlineData?.data) return { ok: false, error: "Gemini lieferte kein Bild" };
  return { ok: true, image: Buffer.from(img.inlineData.data, "base64"), provider: "gemini" };
}

/** Ein einzelner OpenAI-Bildaufruf mit einem bestimmten Modell. */
async function openaiCall(key: string, model: string, prompt: string) {
  const body: Record<string, unknown> = { model, prompt, n: 1, size: "1024x1024" };
  if (model.startsWith("dall-e")) {
    body.response_format = "b64_json";
    body.quality = "standard";
  } else {
    body.quality = "medium";
  }
  return fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  }).catch(() => null);
}

/** OpenAI: gpt-image-1 (oder OPENAI_IMAGE_MODEL), bei 403 Rückfall auf dall-e-3. */
async function openaiImage(prompt: string): Promise<ProviderResult> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return { ok: false, error: "OPENAI_API_KEY fehlt" };

  const primary = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
  const models = primary === "dall-e-3" ? [primary] : [primary, "dall-e-3"];

  let lastErr = "";
  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      if (attempt > 1) await sleep(5000);
      const res = await openaiCall(key, model, prompt);
      const status = res?.status ?? 0;
      if (res?.ok) {
        const data = await res.json();
        const b64: string | undefined = data?.data?.[0]?.b64_json;
        if (!b64) return { ok: false, error: `OpenAI ${model} lieferte kein Bild` };
        return { ok: true, image: Buffer.from(b64, "base64"), provider: `openai:${model}` };
      }
      const t = res ? await res.text().catch(() => "") : "";
      lastErr = `OpenAI ${model} HTTP ${status}: ${t.slice(0, 160)}`;
      // 403 = Modell nicht freigeschaltet (Verifizierung) → nächstes Modell
      if (status === 403) break;
      // Nur 429/5xx/Netzfehler wiederholen
      if (res && status !== 429 && status < 500) return { ok: false, error: lastErr };
    }
  }
  return { ok: false, error: lastErr };
}

/** Rohbild auf ~1280px JPEG verkleinern (Dateiname bleibt .png wie bei allen Menü-Fotos). */
async function saveCompact(file: string, raw: Buffer) {
  try {
    const sharp = (await import("sharp")).default;
    // libvips-Cache aus und nur 1 Thread: Der Prozess soll nach der
    // Generierung nicht mit Bildspeicher vollhängen (danach schlug
    // ImageResponse/satori für Poster & Story fehl – siehe self-restart.ts).
    sharp.cache(false);
    sharp.concurrency(1);
    const jpeg = await sharp(raw)
      .resize({ width: 1280, withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true, mozjpeg: true })
      .toBuffer();
    writeFileSync(file, jpeg);
  } catch {
    // Fallback: sharp nicht verfügbar → Rohbild speichern (besser als nichts)
    writeFileSync(file, raw);
  }
}

/** Generiert ein Foto für ein Gericht, falls noch keins existiert. */
export async function generateDishPhoto(
  slug: string,
  dishNameGerman: string
): Promise<{ ok: boolean; skipped?: boolean; error?: string; provider?: string }> {
  const dir = join(process.cwd(), "public", "images", "menu");
  const file = join(dir, `${slug}.png`);
  if (existsSync(file)) return { ok: true, skipped: true };

  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY?.trim()) {
    return { ok: false, error: "Kein Bild-Anbieter konfiguriert (GEMINI_API_KEY / OPENAI_API_KEY)" };
  }

  const prompt = `${dishNameGerman} (German canteen lunch dish), ${STYLE}`;
  const errors: string[] = [];

  try {
    for (const provider of [geminiImage, openaiImage]) {
      const r = await provider(prompt);
      if (r.ok) {
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        await saveCompact(file, r.image);
        if (errors.length) console.warn(`[ai-image] ${slug}: Ersatz-Anbieter ${r.provider} genutzt –`, errors.join(" | "));
        return { ok: true, provider: r.provider };
      }
      // Fehlender Schlüssel ist kein echter Fehler, nur „Anbieter nicht eingerichtet"
      if (!r.error.endsWith("fehlt")) errors.push(r.error);
    }
    return { ok: false, error: errors.join(" | ") || "Kein Anbieter lieferte ein Bild" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}
