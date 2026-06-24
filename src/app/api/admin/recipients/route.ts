import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../../auth";

export const dynamic = "force-dynamic";

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  return !!session?.user && session.user.role === "ADMIN";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Liste aller Empfänger (neueste zuerst). */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const recipients = await db.mailingRecipient.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ recipients });
}

/** Empfänger anlegen (oder reaktivieren, falls Adresse schon existiert). */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
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
  if (!(await requireAdmin())) {
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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  await db.mailingRecipient.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
