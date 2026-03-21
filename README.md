# Culinarium am Biesenhorst — Bestellsystem

Modernes Webbestellsystem für die Kantine "Culinarium am Biesenhorst" in Berlin.

## Features

- **Responsive Webseite** — optimiert für Desktop und Smartphone
- **Online-Bestellsystem** — Warenkorb, Kasse, Abholung/Lieferung, Zeitauswahl
- **Benutzerkonten** — Registrierung, Login, Bestellhistorie
- **Admin-Dashboard** — Menüverwaltung, Bestellungen, Einstellungen
- **Telegram-Benachrichtigungen** — bei neuen Bestellungen
- **KI-Agent** — automatische Tagesmenü-Pflege, Social-Media-Inhalte
- **SEO-optimiert** — deutsche URLs, Meta-Tags, Open Graph

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Prisma ORM + SQLite
- Auth.js v5 (Credentials)
- Lucide React Icons

## Schnellstart

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Datenbank erstellen

```bash
npx prisma db push
```

### 3. Demo-Daten laden

```bash
npm run db:seed
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Öffnen Sie http://localhost:3000

### Demo-Zugangsdaten

| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Admin | admin@culinarium.de | admin123! |
| Kunde | kunde@example.de | kunde123! |

## Umgebungsvariablen

Kopieren Sie `.env.example` nach `.env` und füllen Sie die Werte aus:

```bash
cp .env.example .env
```

| Variable | Beschreibung |
|----------|-------------|
| DATABASE_URL | SQLite-Pfad (Standard: file:./dev.db) |
| AUTH_SECRET | Zufälliger String für Auth.js |
| TELEGRAM_BOT_TOKEN | Telegram Bot Token |
| TELEGRAM_CHAT_ID | Chat-ID für Benachrichtigungen |
| ANTHROPIC_API_KEY | Claude API Key für KI-Agent |
| OPENAI_API_KEY | DALL-E API Key für Bildgenerierung |

## KI-Agent

Der Agent befindet sich in `agent/` und kann einzelne Tasks oder alle zusammen ausführen:

```bash
# Alle Tasks
npx tsx agent/src/index.ts all

# Einzelne Tasks
npx tsx agent/src/index.ts monitor-orders
npx tsx agent/src/index.ts update-daily-menu
npx tsx agent/src/index.ts generate-social-post
```

### Automatisierung (Cron/Task Scheduler)

```cron
# Alle 5 Min: Neue Bestellungen per Telegram senden
*/5 * * * * cd /pfad/zum/projekt && npx tsx agent/src/index.ts monitor-orders

# Täglich 6:00: Tagesmenü aktualisieren
0 6 * * * cd /pfad/zum/projekt && npx tsx agent/src/index.ts update-daily-menu

# Täglich 10:00: Social-Media-Inhalte generieren
0 10 * * * cd /pfad/zum/projekt && npx tsx agent/src/index.ts generate-social-post
```

## Projektstruktur

```
src/
  app/
    (public)/    — Startseite, Speisekarte, Kontakt, etc.
    (auth)/      — Login, Registrierung
    (shop)/      — Bestellen, Warenkorb, Kasse
    (account)/   — Benutzerkonto
    (admin)/     — Admin-Dashboard
    api/         — REST-API
  components/    — UI-Komponenten
  lib/           — Utilities, DB, Telegram, Validierung
agent/           — KI-Agent (separate Node.js-Scripts)
prisma/          — Datenbankschema + Seed
```

## Deployment

### Option A: PM2

```bash
npm run build
pm2 start npm --name culinarium -- start
```

### Option B: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
CMD ["npm", "start"]
```

## Erweiterbar für

- Online-Zahlung (Stripe/PayPal)
- Push-Benachrichtigungen
- Mehrsprachigkeit
- Treueprogramm
