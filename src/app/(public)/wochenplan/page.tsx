import Image from "next/image";
import Link from "next/link";
import { getWeekPlanRows, listSavedWeeks } from "@/lib/menu-db";
import { formatCurrency, formatWeekRange, DAYS_DE } from "@/lib/utils";
import { UtensilsCrossed, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

async function getWeeklyPlan(weekStart: Date) {
  try {
    return await getWeekPlanRows(weekStart);
  } catch {
    return [];
  }
}

export default async function WochenplanPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const sp = await searchParams;

  const currentWeekStart = getWeekStart();
  const currentISO = isoDate(currentWeekStart);

  // Angezeigte Woche aus ?week= (validiert), sonst aktuelle Woche
  let weekStart: Date;
  if (sp.week && /^\d{4}-\d{2}-\d{2}$/.test(sp.week)) {
    weekStart = new Date(`${sp.week}T00:00:00`);
    weekStart.setHours(0, 0, 0, 0);
  } else {
    weekStart = currentWeekStart;
  }
  const displayedISO = isoDate(weekStart);

  const [planItems, savedWeeksRaw] = await Promise.all([
    getWeeklyPlan(weekStart),
    listSavedWeeks().catch(() => []),
  ]);

  // Gepflegte Wochen (YYYY-MM-DD) – fürs Blättern nur zwischen Wochen mit Menü
  const savedWeeks = savedWeeksRaw.map((w) => w.weekStart);
  const prevWeekISO = savedWeeks.filter((w) => w < displayedISO).sort().reverse()[0] || null;
  const nextWeekISO = savedWeeks.filter((w) => w > displayedISO).sort()[0] || null;

  const isCurrentWeek = displayedISO === currentISO;
  const label = isCurrentWeek
    ? "Diese Woche"
    : displayedISO > currentISO
    ? "Kommende Woche"
    : "Vergangene Woche";
  const todayIdx = isCurrentWeek ? (new Date().getDay() + 6) % 7 : -1; // Mo=0 … So=6

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

  const arrowBase =
    "flex items-center justify-center w-11 h-11 rounded-full transition-colors shrink-0";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Kopf */}
      <div className="text-center mb-10">
        <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">
          {label}
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-2 mb-5">
          Wochenplan
        </h1>

        {/* Wochen-Navigation: ← Datum → */}
        <div className="flex items-center justify-center gap-3">
          {prevWeekISO ? (
            <Link
              href={`/wochenplan?week=${prevWeekISO}`}
              aria-label="Vorherige Woche"
              className={`${arrowBase} bg-warm-100 text-primary hover:bg-primary hover:text-white`}
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
          ) : (
            <span className={`${arrowBase} text-neutral-200`} aria-hidden>
              <ChevronLeft className="h-6 w-6" />
            </span>
          )}

          <div className="inline-flex items-center gap-2 text-neutral-600 bg-warm-100/70 px-5 py-2 rounded-full">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="font-medium whitespace-nowrap">{formatWeekRange(weekStart)}</span>
          </div>

          {nextWeekISO ? (
            <Link
              href={`/wochenplan?week=${nextWeekISO}`}
              aria-label="Nächste Woche"
              className={`${arrowBase} bg-warm-100 text-primary hover:bg-primary hover:text-white`}
            >
              <ChevronRight className="h-6 w-6" />
            </Link>
          ) : (
            <span className={`${arrowBase} text-neutral-200`} aria-hidden>
              <ChevronRight className="h-6 w-6" />
            </span>
          )}
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
                  items.length === 1 ? (
                    /* Ein Gericht: breites Banner, Bild links, Text rechts */
                    items.map((item, idx) => (
                      <div
                        key={idx}
                        className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white border border-neutral-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className="relative w-full h-60 sm:h-72 sm:w-[42%] lg:w-[44%] shrink-0 bg-warm-100 flex items-center justify-center">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 100vw, 480px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <UtensilsCrossed className="h-14 w-14 text-primary/25" />
                          )}
                        </div>
                        <div className="flex flex-col justify-center min-w-0 flex-1 p-6 sm:p-8">
                          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-800 leading-snug">
                            {item.name}
                          </h3>
                          {item.note && (
                            <p className="text-base text-neutral-400 mt-2">{item.note}</p>
                          )}
                          <span className="mt-4 text-3xl font-bold text-primary">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Mehrere Gerichte: Karten mit großem Bild oben */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-neutral-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <div className="relative w-full aspect-[16/10] bg-warm-100 flex items-center justify-center">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                sizes="(max-width: 640px) 100vw, 50vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <UtensilsCrossed className="h-12 w-12 text-primary/25" />
                            )}
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <h3 className="font-heading text-xl font-bold text-neutral-800 leading-snug">
                              {item.name}
                            </h3>
                            {item.note && (
                              <p className="text-sm text-neutral-400 mt-1.5">{item.note}</p>
                            )}
                            <span className="mt-auto pt-3 text-2xl font-bold text-primary">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
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
            Für diese Woche wurde noch kein Menü veröffentlicht.
          </p>
        </div>
      )}
    </div>
  );
}
