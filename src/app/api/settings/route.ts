import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";

export async function GET() {
  const settings = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await req.json();
  const settings = await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: body,
    create: { ...body, id: "singleton" },
  });

  return NextResponse.json(settings);
}
