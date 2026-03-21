import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;

  // Send Telegram notification
  await sendTelegramMessage({
    text: `📩 <b>Neue Kontaktanfrage</b>\n\n👤 ${name}\n📧 ${email}\n📋 ${subject}\n\n${message}`,
  });

  return NextResponse.json({ success: true });
}
