import { db } from "@/lib/db";
import { formatCurrency, DAYS_DE } from "@/lib/utils";
import { UtensilsCrossed, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wochenplan",
  description: "Der aktuelle Wochenplan im Culinarium am Biesenhorst.",
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

async function getWeeklyPlan() {
  const weekStart = getWeekStart();
  return db.weeklyPlanItem.findMany({
    where: { weekStart },
    include: { menuItem: { include: { category: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { mealType: "asc" }],
  });
}

export default async function WochenplanPage() {
  const planItems = await getWeeklyPlan();

  const planByDay = DAYS_DE.reduce(
    (acc, day, index) => {
      acc[index] = planItems.filter((item) => item.dayOfWeek === index);
      return acc;
    },
    {} as Record<number, typeof planItems>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <span className="text-primary font-semibold text-sm uppercase tracking-wider">
          Diese Woche
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-2 mb-4">
          Wochenplan
        </h1>
        <div className="flex items-center justify-center gap-2 text-neutral-500">
          <Calendar className="h-5 w-5" />
          <span>Aktuelle Woche</span>
        </div>
      </div>

      {planItems.length > 0 ? (
        <div className="space-y-6">
          {DAYS_DE.slice(0, 5).map((dayName, dayIndex) => {
            const items = planByDay[dayIndex] || [];
            return (
              <div
                key={dayIndex}
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
              >
                <div className="bg-primary/5 px-6 py-3 border-b border-neutral-100">
                  <h3 className="font-heading text-xl font-bold text-neutral-800">
                    {dayName}
                  </h3>
                </div>
                <div className="p-6">
                  {items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 p-3 rounded-xl bg-warm-50"
                        >
                          <div className="w-14 h-14 bg-secondary/20 rounded-lg flex items-center justify-center shrink-0">
                            <UtensilsCrossed className="h-6 w-6 text-primary/30" />
                          </div>
                          <div>
                            <span className="text-xs text-neutral-400">
                              {item.menuItem.category.name}
                            </span>
                            <h4 className="font-semibold text-neutral-800">
                              {item.menuItem.name}
                            </h4>
                            <span className="text-sm font-bold text-primary">
                              {formatCurrency(item.menuItem.price)}
                            </span>
                            {item.note && (
                              <p className="text-xs text-neutral-400 mt-0.5">
                                {item.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-400 text-sm italic">
                      Noch keine Gerichte geplant
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-warm-50 rounded-2xl max-w-xl mx-auto">
          <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-neutral-600 mb-2">
            Kein Wochenplan verfügbar
          </h3>
          <p className="text-neutral-400">
            Der Wochenplan für diese Woche wurde noch nicht veröffentlicht.
          </p>
        </div>
      )}
    </div>
  );
}
