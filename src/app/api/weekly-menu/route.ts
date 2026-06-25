import { NextResponse } from "next/server";
import { getWeekPlanRows, type WeekPlanRow } from "@/lib/menu-db";
import { getWeekStart, toISODateLocal, formatWeekRange, DAYS_DE } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/weekly-menu
 * Liefert das Wochenmenü dieser UND der kommenden Woche – nach Tagen (Mo–Fr)
 * gruppiert, inkl. menuItemId/Preis/Bild, damit die Bestellseite genau diese
 * Gerichte (und nur diese) anzeigen und bestellbar machen kann.
 */
export async function GET() {
  const thisWeek = getWeekStart();
  const nextWeek = new Date(thisWeek);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Heute als Index Mo=0 … So=6
  const todayIdx = (new Date().getDay() + 6) % 7;

  async function buildWeek(weekStart: Date, isCurrent: boolean) {
    let rows: WeekPlanRow[];
    try {
      rows = await getWeekPlanRows(weekStart);
    } catch {
      rows = [];
    }
    const days = DAYS_DE.slice(0, 5).map((dayName, dayIndex) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + dayIndex);
      const items = rows
        .filter((r) => r.dayOfWeek === dayIndex)
        .map((r) => ({
          menuItemId: r.menuItemId,
          name: r.name,
          price: r.price,
          note: r.note,
          imageUrl: r.imageUrl,
        }));
      return {
        dayIndex,
        dayName,
        date: toISODateLocal(date),
        isToday: isCurrent && dayIndex === todayIdx,
        items,
      };
    });
    return {
      weekStart: toISODateLocal(weekStart),
      label: isCurrent ? "Diese Woche" : "Kommende Woche",
      range: formatWeekRange(weekStart),
      hasItems: rows.length > 0,
      days,
    };
  }

  const [current, next] = await Promise.all([
    buildWeek(thisWeek, true),
    buildWeek(nextWeek, false),
  ]);

  return NextResponse.json({ weeks: [current, next] });
}
