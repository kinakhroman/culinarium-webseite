import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators";
import { sendTelegramMessage } from "@/lib/telegram";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bitte alle Pflichtfelder korrekt ausfüllen." },
      { status: 400 }
    );
  }

  const { name, email, subject, message } = parsed.data;

  // 1) Dauerhaft in der DB speichern (geht nie verloren, auch ohne Telegram).
  //    Fehlertolerant: falls die Tabelle (noch) fehlt, kein 500 – Telegram greift weiter.
  try {
    await db.inquiry.create({
      data: { type: "CONTACT", name, email, subject, message },
    });
  } catch (e) {
    console.error("[contact] DB-Speichern fehlgeschlagen:", e);
  }

  // 2) Optionale Telegram-Benachrichtigung (no-op ohne Token)
  await sendTelegramMessage({
    text: `📩 <b>Neue Kontaktanfrage</b>\n\n👤 ${name}\n📧 ${email}\n📋 ${subject}\n\n${message}`,
  });

  return NextResponse.json({ success: true });
}
