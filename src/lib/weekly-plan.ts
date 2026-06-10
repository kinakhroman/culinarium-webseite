import { db } from "@/lib/db";
import { slugify, getWeekStart } from "@/lib/utils";
import type { WeeklyPlanInput } from "@/lib/validators";

async function getOrCreateCategory(name: string) {
  const slug = slugify(name) || "wochenmenue";
  return db.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug, sortOrder: 100, isActive: true },
  });
}

/**
 * Speichert ein Wochenmenü: Upsert je Gericht (MenuItem nach Slug) und ersetzt
 * die WeeklyPlanItem-Einträge der Woche. Gibt die betroffenen Slugs zurück.
 */
export async function setWeeklyPlan(
  items: WeeklyPlanInput["items"],
  weekStartStr?: string
): Promise<{ weekStart: Date; count: number; slugs: string[] }> {
  const weekStart = weekStartStr ? new Date(`${weekStartStr}T00:00:00`) : getWeekStart();
  weekStart.setHours(0, 0, 0, 0);

  const defaultCat = await getOrCreateCategory("Wochenmenü");
  await db.weeklyPlanItem.deleteMany({ where: { weekStart } });

  const slugs: string[] = [];
  let count = 0;
  for (const item of items) {
    const cat = item.category ? await getOrCreateCategory(item.category) : defaultCat;
    const slug = slugify(item.name) || `gericht-${weekStart.getTime()}-${count}`;
    slugs.push(slug);

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

  return { weekStart, count, slugs };
}
