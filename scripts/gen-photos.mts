/**
 * Erzeugt fehlende Gericht-Fotos LOKAL über dieselbe Funktion wie der Server
 * (src/lib/ai-image.ts: erst Gemini, sonst OpenAI) nach public/images/menu/{slug}.png.
 *
 * Aufruf (im Projektordner):
 *   NODE_OPTIONS=--use-system-ca npx tsx scripts/gen-photos.mts "Gericht 1" "Gericht 2" ...
 *
 * Vorhandene Dateien werden übersprungen. Danach die Fotos committen und pushen,
 * sonst löscht der nächste Deploy server-generierte Bilder.
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

const ROOT = process.cwd();
for (const line of readFileSync(join(ROOT, ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)="?([^"]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { generateDishPhoto } = await import(pathToFileURL(join(ROOT, "src", "lib", "ai-image.ts")).href);
const { slugify } = await import(pathToFileURL(join(ROOT, "src", "lib", "utils.ts")).href);

let ok = 0, fail = 0;
for (const name of process.argv.slice(2)) {
  const slug = slugify(name);
  const file = join(ROOT, "public", "images", "menu", `${slug}.png`);
  if (existsSync(file)) { console.log(`DA        ${slug}`); continue; }
  const r = await generateDishPhoto(slug, name);
  if (r.ok && existsSync(file)) {
    console.log(`OK        ${slug} (${Math.round(readFileSync(file).length / 1024)} KB, ${r.provider})`); ok++;
  } else {
    console.log(`FEHLER    ${slug}: ${r.error ?? "keine Datei"}`); fail++;
  }
}
console.log(`FERTIG ok=${ok} fehler=${fail}`);
