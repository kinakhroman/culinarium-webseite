import { NextResponse } from "next/server";
import { cateringInquirySchema } from "@/lib/validators";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendMail } from "@/lib/mailer";
import { db } from "@/lib/db";

const NOTIFY_EMAIL = "info@culinarium-berlin.de";

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

  // Benachrichtigung per E-Mail an info@ (Antwort geht direkt an den Kunden)
  const mailLines = [
    "Neue Baustellen-Catering Anfrage",
    "",
    company ? `Firma: ${company}` : null,
    `Name: ${contactName}`,
    `Telefon: ${phone}`,
    email ? `E-Mail: ${email}` : null,
    `Baustelle / Ort: ${site}`,
    people ? `Personen: ca. ${people}` : null,
    message ? `\nNachricht:\n${message}` : null,
    "",
    "Alle Anfragen: https://culinarium-berlin.de/admin/anfragen",
  ].filter(Boolean) as string[];
  await sendMail({
    to: NOTIFY_EMAIL,
    replyTo: email || undefined,
    subject: `🏗️ Baustellen-Catering Anfrage – ${company || contactName}`,
    text: mailLines.join("\n"),
  });

  return NextResponse.json({ success: true });
}
