import { NextResponse } from "next/server";
import { cateringInquirySchema } from "@/lib/validators";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = cateringInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { company, contactName, site, people, phone, email, message } = parsed.data;

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
