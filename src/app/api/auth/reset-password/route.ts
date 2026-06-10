import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/reset-password { email, code, password }
 * Prüft den Code, setzt das neue Passwort und verbraucht den Code.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Ungültige Eingabe." },
      { status: 400 }
    );
  }
  const email = parsed.data.email.toLowerCase();
  const { code, password } = parsed.data;

  const record = await db.verificationToken.findUnique({
    where: { token: `${email}:${code}` },
  });
  if (!record || record.expires < new Date()) {
    return NextResponse.json(
      { error: "Code ungültig oder abgelaufen. Bitte neuen Code anfordern." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Konto nicht gefunden." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.update({ where: { email }, data: { passwordHash } });
  // Code verbrauchen + evtl. weitere Codes der E-Mail löschen
  await db.verificationToken.deleteMany({ where: { identifier: email } });

  return NextResponse.json({ success: true });
}
