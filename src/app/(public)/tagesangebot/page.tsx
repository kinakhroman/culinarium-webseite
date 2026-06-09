import Image from "next/image";
import { getWeekPlanRows } from "@/lib/menu-db";
import { formatCurrency, formatDate, DAYS_DE } from "@/lib/utils";
import { UtensilsCrossed, CalendarDays, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tagesangebot",
  description: "Das heutige Tagesangebot im Culinarium am Biesenhorst – frisch gekocht, täglich neu.",
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Heutiges Gericht aus dem aktuellen Wochenplan (Mo=0 … Fr=4). */
async function getTodaysDishes() {
  try {
    const rows = await getWeekPlanRows(getWeekStart());
    const todayIdx = (new Date().getDay() + 6) % 7;
    return rows.filter((r) => r.dayOfWeek === todayIdx);
  } catch {
    return [];
  }
}

export default async function TagesangebotPage() {
  const dishes = await getTodaysDishes();
  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7;
  const dayName = DAYS_DE[todayIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">
          Heute empfohlen
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-2 mb-4">
          Tagesangebot
        </h1>
        <div className="inline-flex items-center gap-2 text-neutral-500 bg-warm-100/70 px-4 py-1.5 rounded-full">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="font-medium">
            {dayName}, {formatDate(today)}
          </span>
        </div>
      </div>

      {dishes.length > 0 ? (
        <div
          className={`grid gap-8 max-w-5xl mx-auto ${
            dishes.length === 1
              ? "max-w-md"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {dishes.map((dish, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-56 bg-gradient-to-br from-secondary/30 to-warm-200 flex items-center justify-center overflow-hidden">
                {dish.imageUrl ? (
                  <Image
                    src={dish.imageUrl}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <UtensilsCrossed className="h-16 w-16 text-primary/20" />
                )}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    Mittagstisch
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-2xl font-bold text-neutral-800 mb-1">
                  {dish.name}
                </h3>
                {dish.note && (
                  <p className="text-sm text-neutral-500 italic mb-4">{dish.note}</p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(dish.price)}
                  </span>
                  <Link
                    href="/bestellen"
                    className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Bestellen
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-warm-50 rounded-2xl max-w-xl mx-auto">
          <UtensilsCrossed className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-neutral-600 mb-2">
            Heute kein Mittagstisch
          </h3>
          <p className="text-neutral-400 mb-6">
            Am Wochenende haben wir geschlossen. Schauen Sie sich unseren Wochenplan
            oder die reguläre Speisekarte an.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/wochenplan"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
            >
              Zum Wochenplan
            </Link>
            <Link
              href="/speisekarte"
              className="inline-flex items-center gap-2 bg-warm-100 text-neutral-700 px-6 py-3 rounded-full font-semibold hover:bg-warm-200 transition-colors"
            >
              Zur Speisekarte
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
