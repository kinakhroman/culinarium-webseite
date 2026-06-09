import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";
import { weeklyPlanSchema } from "@/lib/validators";
import { slugify, getWeekStart, toISODateLocal } from "@/lib/utils";
import { getWeekPlanRows } from "@/lib/menu-db";

export const dynamic = "force-dynamic";

async function getOrCreateCategory(name: string) {
  const slug = slugify(name) || "wochenmenue";
  return db.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug, sortOrder: 100, isActive: true },
  });
}

/**
 * POST /api/weekly-plan
 * Befüllt den Wochenplan. Token-geschützt (Header: x-api-key oder Bearer).
 * Body: { weekStart?: "YYYY-MM-DD", items: [{ dayOfWeek 0-6, name, description?, price, category?, note?, isVegetarian?, isVegan? }] }
 */
export async function POST(req: Request) {
  // Zugriff: eingeloggter Admin ODER gültiger API-Token (für das Claude-Projekt)
  const session = await auth();
  const isAdmin = !!session?.user && session.user.role === "ADMIN";
  const token =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const expected = process.env.MENU_API_KEY;
  const tokenOk = !!expected && token === expected;
  if (!isAdmin && !tokenOk) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON" }, { status: 400 });
  }

  const parsed = weeklyPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { weekStart: weekStartStr, items } = parsed.data;
  const weekStart = weekStartStr ? new Date(`${weekStartStr}T00:00:00`) : getWeekStart();
  weekStart.setHours(0, 0, 0, 0);

  const defaultCat = await getOrCreateCategory("Wochenmenü");

  // Woche zurücksetzen, dann neu befüllen
  await db.weeklyPlanItem.deleteMany({ where: { weekStart } });

  let count = 0;
  for (const item of items) {
    const cat = item.category ? await getOrCreateCategory(item.category) : defaultCat;
    const slug = slugify(item.name) || `gericht-${weekStart.getTime()}-${count}`;

    const menuItem = await db.menuItem.upsert({
      where: { slug },
      update: {
        name: item.name,
        description: item.description || item.name,
        price: item.price ?? 0,
        categoryId: cat.id,
        isAvailable: true,
        ...(item.isVegetarian !== undefined ? { isVegetarian: item.isVegetarian } : {}),
        ...(item.isVegan !== undefined ? { isVegan: item.isVegan } : {}),
      },
      create: {
        name: item.name,
        slug,
        description: item.description || item.name,
        price: item.price ?? 0,
        categoryId: cat.id,
        isAvailable: true,
        isVegetarian: !!item.isVegetarian,
        isVegan: !!item.isVegan,
      },
    });

    await db.weeklyPlanItem.create({
      data: {
        menuItemId: menuItem.id,
        dayOfWeek: item.dayOfWeek,
        weekStart,
        mealType: "LUNCH",
        note: item.note ?? null,
      },
    });
    count++;
  }

  return NextResponse.json({
    success: true,
    weekStart: toISODateLocal(weekStart),
    count,
  });
}

/** GET /api/weekly-plan – aktuelle Woche (für Vorschau/Grafik), Umlaute-sicher */
export async function GET() {
  const weekStart = getWeekStart();
  const rows = await getWeekPlanRows(weekStart);
  const items = rows.map((r) => ({
    dayOfWeek: r.dayOfWeek,
    note: r.note,
    menuItem: { name: r.name, price: r.price },
  }));
  return NextResponse.json({
    weekStart: toISODateLocal(weekStart),
    items,
  });
}
