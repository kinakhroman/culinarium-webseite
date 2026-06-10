import { NextResponse } from "next/server";
import { cateringInquirySchema } from "@/lib/validators";
import { sendTelegramMessage } from "@/lib/telegram";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = cateringInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bitte alle Pflichtfelder korrekt ausfüllen." },
      { status: 400 }
    );
  }

  const { company, contactName, site, people, phone, email, message } = parsed.data;

  // Dauerhaft in der DB speichern (geht nie verloren, auch ohne Telegram)
  try {
    await db.inquiry.create({
      data: {
        type: "CATERING",
        name: contactName,
        email: email || null,
        phone,
        company: company || null,
        site,
        people: people ? parseInt(people, 10) || null : null,
        message: message || null,
      },
    });
  } catch (e) {
    console.error("[catering-inquiry] DB-Speichern fehlgeschlagen:", e);
  }

  let text = `🏗️ <b>Neue Baustellen-Catering Anfrage</b>\n\n`;
  if (company) text += `🏢 <b>${company}</b>\n`;
  text += `👤 ${contactName}\n`;
  text += `📞 ${phone}\n`;
  if (email) text += `📧 ${email}\n`;
  text += `📍 ${site}\n`;
  if (people) text += `👷 ca. ${people} Personen\n`;
  if (message) text += `\n📝 ${message}`;

  await sendTelegramMessage({ text });

  return NextResponse.json({ success: true });
}
