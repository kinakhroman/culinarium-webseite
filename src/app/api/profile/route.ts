import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";
import { profileSchema } from "@/lib/validators";

/** GET /api/profile – eigenes Profil laden */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true, email: true, phone: true,
      street: true, houseNumber: true, postalCode: true, city: true,
    },
  });
  return NextResponse.json(user);
}

/** PUT /api/profile – eigenes Profil aktualisieren */
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Ungültige Eingabe" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      name: d.name,
      phone: d.phone || null,
      street: d.street || null,
      houseNumber: d.houseNumber || null,
      postalCode: d.postalCode || null,
      city: d.city || null,
    },
    select: {
      name: true, email: true, phone: true,
      street: true, houseNumber: true, postalCode: true, city: true,
    },
  });
  return NextResponse.json({ success: true, user });
}
