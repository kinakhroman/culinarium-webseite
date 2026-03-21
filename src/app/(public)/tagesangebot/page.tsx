import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UtensilsCrossed, CalendarDays, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tagesangebot",
  description: "Das heutige Tagesangebot im Culinarium am Biesenhorst.",
};

async function getTodaysSpecials() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return db.dailySpecial.findMany({
    where: {
      date: { gte: today, lt: tomorrow },
      isActive: true,
    },
    include: { menuItem: { include: { category: true } } },
  });
}

export default async function TagesangebotPage() {
  const specials = await getTodaysSpecials();
  const today = new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <span className="text-primary font-semibold text-sm uppercase tracking-wider">
          Heute empfohlen
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-2 mb-4">
          Tagesangebot
        </h1>
        <div className="flex items-center justify-center gap-2 text-neutral-500">
          <CalendarDays className="h-5 w-5" />
          <span>{formatDate(today)}</span>
        </div>
      </div>

      {specials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {specials.map((special) => (
            <div
              key={special.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-neutral-100 hover:shadow-xl transition-shadow"
            >
              <div className="relative h-52 bg-gradient-to-br from-secondary/30 to-warm-200 flex items-center justify-center">
                <UtensilsCrossed className="h-16 w-16 text-primary/20" />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1 bg-warm-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <Sparkles className="h-3.5 w-3.5" />
                    Tagesangebot
                  </span>
                </div>
              </div>
              <div className="p-6">
                <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                  {special.menuItem.category.name}
                </span>
                <h3 className="font-heading text-2xl font-bold text-neutral-800 mt-1 mb-2">
                  {special.menuItem.name}
                </h3>
                <p className="text-neutral-500 mb-4">
                  {special.menuItem.description}
                </p>
                {special.note && (
                  <p className="text-sm text-warm-600 italic mb-4">
                    {special.note}
                  </p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div>
                    {special.specialPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(special.specialPrice)}
                        </span>
                        <span className="text-sm text-neutral-400 line-through">
                          {formatCurrency(special.menuItem.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(special.menuItem.price)}
                      </span>
                    )}
                  </div>
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
            Kein Tagesangebot verfügbar
          </h3>
          <p className="text-neutral-400 mb-6">
            Heute gibt es kein spezielles Tagesangebot. Schauen Sie sich unsere reguläre Speisekarte an.
          </p>
          <Link
            href="/speisekarte"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
          >
            Zur Speisekarte
          </Link>
        </div>
      )}
    </div>
  );
}
