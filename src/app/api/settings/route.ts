import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";

// Erlaubte (editierbare) Felder – verhindert das Setzen beliebiger Felder
const STRING_FIELDS = [
  "businessName", "tagline", "phone", "email", "street", "houseNumber",
  "postalCode", "city", "instagramUrl", "facebookUrl", "telegramChatId",
] as const;
const NUMBER_FIELDS = ["minimumOrderAmount", "deliveryFee", "deliveryRadius"] as const;

export async function GET() {
  const session = await auth();
  const settings = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) return NextResponse.json(null);

  // Sensible Felder nur für Admins
  if (session?.user?.role === "ADMIN") return NextResponse.json(settings);
  const { telegramChatId: _t, ...pub } = settings;
  void _t;
  return NextResponse.json(pub);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  for (const f of STRING_FIELDS) {
    if (body[f] !== undefined) data[f] = body[f] === "" ? null : String(body[f]);
  }
  for (const f of NUMBER_FIELDS) {
    if (body[f] !== undefined && body[f] !== "") {
      const n = Number(body[f]);
      if (!Number.isNaN(n)) data[f] = n;
    }
  }

  const settings = await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { ...data, id: "singleton" },
  });
  return NextResponse.json(settings);
}
