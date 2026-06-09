# Wochenmenü → Website (Vorlage für das Claude-Projekt)

So bringst du das Wochenmenü auf die Website **und** erzeugst die professionelle
Menü-Grafik (Canva-Ersatz). Zwei Wege – beide nutzen dasselbe JSON-Format.

---

## 1) Das JSON-Format

Dein Claude-Projekt (in das du das ukrainische Menü der Kollegen einfügst) soll am
Ende **immer dieses deutsche JSON** ausgeben:

```json
{
  "items": [
    { "dayOfWeek": 0, "name": "Gemüse-Curry mit Reis", "price": 7.90 },
    { "dayOfWeek": 0, "name": "Gulasch mit Kartoffeln", "price": 8.90 },
    { "dayOfWeek": 1, "name": "Wiener Schnitzel mit Pommes", "price": 9.50 },
    { "dayOfWeek": 2, "name": "Königsberger Klopse", "price": 8.50 },
    { "dayOfWeek": 3, "name": "Spaghetti Bolognese", "price": 7.90 },
    { "dayOfWeek": 4, "name": "Currywurst mit Pommes", "price": 6.90 },
    { "dayOfWeek": 4, "name": "Hähnchen-Curry", "price": 8.50 }
  ]
}
```

### Felder
| Feld          | Pflicht | Bedeutung |
|---------------|---------|-----------|
| `dayOfWeek`   | ja      | **0 = Montag, 1 = Dienstag, 2 = Mittwoch, 3 = Donnerstag, 4 = Freitag** |
| `name`        | ja      | Gericht auf Deutsch (Umlaute ä ö ü ß sind erlaubt) |
| `price`       | ja      | Preis in Euro, Punkt als Dezimaltrennzeichen (`7.90`) |
| `description` | nein    | Kurzbeschreibung |
| `note`        | nein    | Hinweis, z. B. „vegetarisch", „scharf" |
| `category`    | nein    | Standard ist „Wochenmenü" |
| `isVegetarian`| nein    | `true`/`false` |
| `isVegan`     | nein    | `true`/`false` |
| `weekStart`   | nein    | `"YYYY-MM-DD"` (Montag). Weglassen = **aktuelle Woche** |

> Mehrere Gerichte pro Tag: einfach mehrere Einträge mit demselben `dayOfWeek`.

### Prompt-Baustein für dein Claude-Projekt
> „Übersetze das folgende ukrainische Wochenmenü ins Deutsche und gib es **ausschließlich**
> als JSON nach diesem Schema aus (Mo=0 … Fr=4, Preis mit Punkt): { "items": [ … ] }.
> Keine Erklärungen, nur das JSON."

---

## 2) Weg A – einfügen im Admin (empfohlen, kein Schlüssel nötig)

1. Auf der Website einloggen (Admin).
2. Seite **`/admin/wochenplan`** öffnen.
3. Das JSON aus dem Claude-Projekt **in das Textfeld einfügen** → **Speichern**.
4. Fertig: `/wochenplan` ist aktuell, und die Grafik wird neu erzeugt.

Auf derselben Seite kannst du die **Grafik herunterladen** in 4 Formaten:
- **Quadrat** (1080×1080) – Instagram, WhatsApp, Telegram
- **Story** (1080×1920) – Instagram/Facebook Story
- **Web** (1200×630) – Website / Vorschau
- **Print** (A4, 1240×1754) – Aushang zum Ausdrucken

---

## 3) Weg B – direkt per API (für spätere Voll-Automatisierung)

```bash
curl -X POST https://culinarium-berlin.de/api/weekly-plan \
  -H "Content-Type: application/json" \
  -H "x-api-key: DEIN_MENU_API_KEY" \
  --data-binary @menue.json
```

- `DEIN_MENU_API_KEY` = der Wert aus der Umgebungsvariable **`MENU_API_KEY`**
  (lokal in `.env`, live in den Hostinger-Umgebungsvariablen setzen).
- Wichtig: JSON als **Datei** senden (`--data-binary @datei.json`), damit Umlaute
  sauber als UTF-8 ankommen – nicht roh in die Kommandozeile tippen.

---

## 4) Grafik-Links (immer aktuelle Woche)

- `https://culinarium-berlin.de/api/menu-poster/square`
- `https://culinarium-berlin.de/api/menu-poster/story`
- `https://culinarium-berlin.de/api/menu-poster/web`
- `https://culinarium-berlin.de/api/menu-poster/print`

Die Grafik wird **aus echtem Text** gerendert (perfekt lesbar, markenkonform) –
**nicht** als KI-Bild, weil KI-Bildgeneratoren Texte/Preise verfälschen würden.
