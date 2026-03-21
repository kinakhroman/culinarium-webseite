import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";
import { menuItemSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function GET() {
  const items = await db.menuItem.findMany({
    where: { isAvailable: true },
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = menuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const slug = slugify(data.name);

  const item = await db.menuItem.create({
    data: { ...data, slug },
    include: { category: true },
  });

  return NextResponse.json(item, { status: 201 });
}
