import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../../auth";
import { menuItemSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function GET(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const item = await db.menuItem.findUnique({
    where: { id: itemId },
    include: { category: true },
  });
  if (!item) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { itemId } = await params;
  const body = await req.json();
  const parsed = menuItemSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = { ...data };
  if (data.name) updateData.slug = slugify(data.name);

  const item = await db.menuItem.update({
    where: { id: itemId },
    data: updateData,
    include: { category: true },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { itemId } = await params;
  await db.menuItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
