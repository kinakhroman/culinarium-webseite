import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../../auth";

export const dynamic = "force-dynamic";

/** Admin-Session ODER MENU_API_KEY (Header x-api-key/Bearer ODER ?key=). */
async function authorized(req: Request): Promise<boolean> {
  const url = new URL(req.url);
  const keyParam = url.searchParams.get("key") || "";
  const header =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const apiKey = process.env.MENU_API_KEY;
  if (apiKey && (header === apiKey || keyParam === apiKey)) return true;
  const session = await auth();
  return !!session?.user && session.user.role === "ADMIN";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalisiert eine Adresse: trimmt, kleinschreibt, ersetzt Unicode-Bindestriche durch "-". */
function normalizeEmail(raw: string): string {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[‐-―−]/g, "-"); // –, —, − u.a. -> ASCII-Hyphen
}

/** Zerlegt einen eingefügten Block (Komma/Semikolon/Whitespace/Zeilen) in Adressen. */
function parseList(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((x) => normalizeEmail(String(x)));
  return String(input || "")
    .split(/[\s,;]+/)
    .map(normalizeEmail)
    .filter(Boolean);
}

/** Liste aller Empfänger (neueste zuerst). */
export async function GET(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const recipients = await db.mailingRecipient.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ recipients });
}

/**
 * Empfänger anlegen/reaktivieren. Zwei Modi:
 *   { email, name }     – einzeln
 *   { emails: "..."|[] } – Sammel-Import (Komma/Semikolon/Zeilen getrennt)
 */
export async function POST(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  // Sammel-Import
  if (body.emails != null) {
    const list = parseList(body.emails);
    const seen = new Set<string>();
    const valid: string[] = [];
    const invalid: string[] = [];
    for (const e of list) {
      if (seen.has(e)) continue;
      seen.add(e);
      if (EMAIL_RE.test(e)) valid.push(e);
      else invalid.push(e);
    }
    let added = 0;
    for (const email of valid) {
      await db.mailingRecipient.upsert({
        where: { email },
        update: { isActive: true },
        create: { email, isActive: true },
      });
      added++;
    }
    return NextResponse.json({ added, invalid, total: valid.length });
  }

  // Einzeln
  const email = normalizeEmail(String(body.email || ""));
  const name = body.name ? String(body.name).trim() : null;
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Ungültige E-Mail-Adresse" }, { status: 400 });
  }
  const recipient = await db.mailingRecipient.upsert({
    where: { email },
    update: { name, isActive: true },
    create: { email, name, isActive: true },
  });
  return NextResponse.json({ recipient });
}

/** Aktiv-Status umschalten: PATCH { id, isActive } */
export async function PATCH(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  const recipient = await db.mailingRecipient.update({
    where: { id },
    data: { isActive: Boolean(body.isActive) },
  });
  return NextResponse.json({ recipient });
}

/** Empfänger löschen: DELETE ?id=... */
export async function DELETE(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  await db.mailingRecipient.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
