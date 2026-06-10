import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validators";
import { sendMail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/forgot-password { email }
 * Erzeugt einen 6-stelligen Code, speichert ihn (30 Min gültig) und mailt ihn.
 * Gibt aus Datenschutzgründen IMMER success zurück (verrät nicht, ob die E-Mail existiert).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige E-Mail-Adresse." }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    // 6-stelliger Code (100000–999999) ohne Math.random-Bias-Sorgen
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    // Alte Codes für diese E-Mail entfernen, dann neuen anlegen
    await db.verificationToken.deleteMany({ where: { identifier: email } });
    await db.verificationToken.create({
      data: { identifier: email, token: `${email}:${code}`, expires },
    });

    await sendMail({
      to: email,
      subject: "Ihr Code zum Zurücksetzen des Passworts",
      text:
        `Hallo,\n\nIhr Code zum Zurücksetzen des Passworts lautet:\n\n   ${code}\n\n` +
        `Der Code ist 30 Minuten gültig. Falls Sie das nicht angefordert haben, ignorieren Sie diese E-Mail.\n\n` +
        `Culinarium am Biesenhorst`,
      html:
        `<p>Hallo,</p><p>Ihr Code zum Zurücksetzen des Passworts lautet:</p>` +
        `<p style="font-size:24px;font-weight:bold;letter-spacing:3px">${code}</p>` +
        `<p>Der Code ist 30 Minuten gültig. Falls Sie das nicht angefordert haben, ignorieren Sie diese E-Mail.</p>` +
        `<p>Culinarium am Biesenhorst</p>`,
    });
  }

  return NextResponse.json({ success: true });
}
