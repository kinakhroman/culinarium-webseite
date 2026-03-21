import { db } from "../lib/db.js";
import { logAgentTask } from "../lib/logger.js";

export async function updateDailyMenu() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if there are daily specials for today
    const todaysSpecials = await db.dailySpecial.count({
      where: { date: { gte: today, lt: tomorrow }, isActive: true },
    });

    if (todaysSpecials > 0) {
      await logAgentTask(
        "update-daily-menu",
        "SKIPPED",
        `${todaysSpecials} Tagesangebote bereits vorhanden`
      );
      return;
    }

    // No specials today — pick random available items as suggestions
    const availableItems = await db.menuItem.findMany({
      where: {
        isAvailable: true,
        categoryId: { not: undefined },
      },
      include: { category: true },
    });

    if (availableItems.length === 0) {
      await logAgentTask("update-daily-menu", "SKIPPED", "Keine verfügbaren Gerichte");
      return;
    }

    // Pick up to 3 random items as daily specials
    const shuffled = availableItems.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(3, shuffled.length));

    for (const item of selected) {
      await db.dailySpecial.create({
        data: {
          menuItemId: item.id,
          date: today,
          note: "Empfehlung des Tages",
          isActive: true,
        },
      });
    }

    await logAgentTask(
      "update-daily-menu",
      "SUCCESS",
      `${selected.length} Tagesangebote erstellt: ${selected.map((i) => i.name).join(", ")}`
    );
  } catch (error) {
    await logAgentTask("update-daily-menu", "FAILURE", String(error));
  }
}
