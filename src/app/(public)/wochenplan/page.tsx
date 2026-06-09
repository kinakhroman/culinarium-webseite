import Image from "next/image";
import { getWeekPlanRows } from "@/lib/menu-db";
import { formatCurrency, formatWeekRange, DAYS_DE } from "@/lib/utils";
import { UtensilsCrossed, CalendarDays } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wochenplan",
  description: "Der aktuelle Wochenplan im Culinarium am Biesenhorst – frisch, regional, täglich neu.",
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

async function getWeeklyPlan(weekStart: Date) {
  try {
    return await getWeekPlanRows(weekStart);
  } catch {
    return [];
  }
}

export default async function WochenplanPage() {
  const weekStart = getWeekStart();
  const planItems = await getWeeklyPlan(weekStart);
  const todayIdx = (new Date().getDay() + 6) % 7; // Mo=0 … So=6

  const planByDay = DAYS_DE.reduce(
    (acc, _day, index) => {
      acc[index] = planItems.filter((item) => item.dayOfWeek === index);
      return acc;
    },
    {} as Record<number, typeof planItems>
  );

  function dayDate(i: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Kopf */}
      <div className="text-center mb-12">
        <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">
          Diese Woche
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-2 mb-3">
          Wochenplan
        </h1>
        <div className="inline-flex items-center gap-2 text-neutral-500 bg-warm-100/70 px-4 py-1.5 rounded-full">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="font-medium">{formatWeekRange(weekStart)}</span>
        </div>
      </div>

      {planItems.length > 0 ? (
        <div className="space-y-8">
          {DAYS_DE.slice(0, 5).map((dayName, dayIndex) => {
            const items = planByDay[dayIndex] || [];
            const isToday = dayIndex === todayIdx;
            return (
              <section
                key={dayIndex}
                className={`rounded-3xl p-5 sm:p-7 transition-colors ${
                  isToday
                    ? "bg-gradient-to-br from-warm-50 to-secondary/10 ring-1 ring-secondary/40"
                    : "bg-white ring-1 ring-neutral-100"
                }`}
              >
                {/* Tag-Kopf */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-baseline gap-3">
                    <h2 className="font-heading text-2xl font-bold text-neutral-800">
                      {dayName}
                    </h2>
                    <span className="text-sm font-medium text-neutral-400">
                      {dayDate(dayIndex)}
                    </span>
                    {isToday && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-primary px-2.5 py-1 rounded-full">
                        Heute
                      </span>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-neutral-200 to-transparent" />
                </div>

                {items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="group flex gap-4 rounded-2xl bg-white border border-neutral-100 p-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-warm-100 flex items-center justify-center">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="112px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <UtensilsCrossed className="h-7 w-7 text-primary/25" />
                          )}
                        </div>
                        <div className="flex flex-col justify-center min-w-0 flex-1 pr-1">
                          <h3 className="font-heading text-lg font-bold text-neutral-800 leading-snug">
                            {item.name}
                          </h3>
                          {item.note && (
                            <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                              {item.note}
                            </p>
                          )}
                          <span className="mt-2 text-lg font-bold text-primary">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-sm italic pl-1">
                    Menü folgt in Kürze.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-warm-50 rounded-3xl max-w-xl mx-auto">
          <CalendarDays className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
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
