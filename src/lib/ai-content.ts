/**
 * KI-Inhalte über die Anthropic-API (offizielle SDK):
 *  - Übersetzt & strukturiert das (ukrainische) Wochenmenü ins Deutsche
 *  - Schreibt Social-Media-Captions (Instagram/Facebook) im Marken-Ton
 *
 * Benötigt ANTHROPIC_API_KEY in der Umgebung.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { WeeklyPlanInput } from "@/lib/validators";

const MODEL = "claude-opus-4-8";

function client() {
  return new Anthropic(); // liest ANTHROPIC_API_KEY aus der Umgebung
}

const MENU_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          dayOfWeek: { type: "integer", enum: [0, 1, 2, 3, 4] },
          name: { type: "string" },
          note: { type: "string" },
          price: { type: "number" },
        },
        required: ["dayOfWeek", "name", "price"],
      },
    },
  },
  required: ["items"],
} as const;

/**
 * Übersetzt einen frei eingegebenen Menütext (oft Ukrainisch) ins Deutsche und
 * gibt ihn strukturiert zurück. `defaultPrice` wird genutzt, wenn im Text kein
 * eigener Preis je Gericht steht (z. B. einheitlicher Mittagstisch-Preis).
 */
export async function translateAndStructureMenu(
  rawText: string,
  defaultPrice = 6.9
): Promise<WeeklyPlanInput> {
  const system = [
    "Du bist der Küchen-Redakteur der Kantine 'Culinarium am Biesenhorst' in Berlin.",
    "Du bekommst einen Wochenplan (Montag–Freitag), häufig auf Ukrainisch, manchmal stichpunktartig.",
    "Aufgabe: Übersetze die Gerichte in natürliches, appetitliches Deutsch und ordne sie den Wochentagen zu.",
    "Regeln:",
    "- dayOfWeek: 0=Montag, 1=Dienstag, 2=Mittwoch, 3=Donnerstag, 4=Freitag.",
    "- Pro Wochentag GENAU EIN Gericht. Mit '+' (oder Komma) verbundene Bestandteile EINER Zeile sind EIN kombiniertes Tellergericht – fasse sie zu EINEM Eintrag mit einem zusammenhängenden, appetitlichen Namen zusammen (z. B. 'Chili con Carne + Reis + Hähnchen mit Ananas' -> Name 'Chili con Carne, Reis & Hähnchen mit Ananas'). NICHT in mehrere Einträge aufteilen.",
    "- Nur wenn der Text ausdrücklich ECHTE Wahl-Alternativen anbietet (Wort 'oder' / klar getrennte Wahlgerichte), lege mehrere Einträge mit gleichem dayOfWeek an.",
    `- Wenn kein Preis genannt ist, setze price = ${defaultPrice} (einheitlicher Mittagstisch).`,
    "- Beilagen wie Salat/Suppe, die zum Gericht gehören, gehören in 'note' (z. B. 'mit Salat'), nicht in einen eigenen Eintrag.",
    "- Namen knapp und lecker halten, keine Mengenangaben erfinden.",
    "Gib ausschließlich JSON nach dem Schema zurück.",
  ].join("\n");

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 2000,
    system,
    output_config: { format: { type: "json_schema", schema: MENU_SCHEMA } },
    messages: [{ role: "user", content: rawText }],
  });

  const text = res.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("Keine Übersetzung erhalten");
  const parsed = JSON.parse(text.text) as WeeklyPlanInput;
  return parsed;
}

export type SocialCaptions = { instagram: string; facebook: string };

const CAPTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    instagram: { type: "string" },
    facebook: { type: "string" },
  },
  required: ["instagram", "facebook"],
} as const;

/**
 * Erzeugt Captions für Instagram & Facebook aus dem Wochenmenü.
 */
export async function generateCaptions(
  items: WeeklyPlanInput["items"],
  weekRange: string
): Promise<SocialCaptions> {
  const DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
  const menuLines = items
    .map((i) => `${DAYS[i.dayOfWeek] ?? "?"}: ${i.name}${i.note ? ` (${i.note})` : ""}`)
    .join("\n");

  const system = [
    "Du bist Social-Media-Redakteur der Berliner Kantine 'Culinarium am Biesenhorst'.",
    "Ton: warm, regional, einladend, ohne Werbe-Floskeln. Deutsch.",
    "Schreibe zwei Beiträge zum Wochenmenü:",
    "- instagram: 3–6 kurze Zeilen, 1–2 passende Emojis, am Ende 6–10 relevante Hashtags (z. B. #Mittagstisch #BerlinLichtenberg #Kantine #frischgekocht).",
    "- facebook: etwas ausführlicher, 2–4 Sätze, freundlich, 2–4 Hashtags.",
    "Nenne den Wochen-Zeitraum und mache Lust aufs Mittagessen. Kein Preis erfinden, außer er steht im Menü.",
    "Gib ausschließlich JSON nach dem Schema zurück.",
  ].join("\n");

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1200,
    system,
    output_config: { format: { type: "json_schema", schema: CAPTION_SCHEMA } },
    messages: [
      { role: "user", content: `Woche ${weekRange}\n\nMenü:\n${menuLines}` },
    ],
  });

  const text = res.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("Keine Captions erhalten");
  return JSON.parse(text.text) as SocialCaptions;
}
