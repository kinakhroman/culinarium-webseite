"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/features/cart/cart-provider";
import { formatCurrency } from "@/lib/utils";
import { UtensilsCrossed, Plus, Minus, CalendarDays } from "lucide-react";

type Item = {
  menuItemId: string;
  name: string;
  price: number;
  note: string | null;
  imageUrl: string | null;
};
type Day = {
  dayIndex: number;
  dayName: string;
  date: string;
  isToday: boolean;
  items: Item[];
};
type Week = {
  weekStart: string;
  label: string;
  range: string;
  hasItems: boolean;
  days: Day[];
};

function formatDayDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.`;
}

export default function WeeklyMenuOrder() {
  const [weeks, setWeeks] = useState<Week[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, updateQuantity, items: cartItems } = useCart();

  useEffect(() => {
    let active = true;
    fetch("/api/weekly-menu")
      .then((r) => r.json())
      .then((d) => {
        if (active) setWeeks(Array.isArray(d.weeks) ? d.weeks : []);
      })
      .catch(() => active && setWeeks([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function qtyOf(id: string): number {
    return cartItems.find((i) => i.menuItemId === id)?.quantity || 0;
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin h-9 w-9 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-3 text-neutral-500">Wochenmenü wird geladen…</p>
      </div>
    );
  }

  const validWeeks = (weeks || []).filter((w) => w.hasItems);

  if (validWeeks.length === 0) {
    return (
      <div className="text-center py-16 bg-warm-50 rounded-3xl max-w-xl mx-auto">
        <CalendarDays className="h-14 w-14 text-neutral-300 mx-auto mb-4" />
        <h3 className="font-heading text-xl font-semibold text-neutral-600 mb-2">
          Aktuell kein Wochenmenü
        </h3>
        <p className="text-neutral-400">
          Für diese und die kommende Woche ist noch kein Menü hinterlegt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {validWeeks.map((week) => (
        <div key={week.weekStart}>
          {/* Wochen-Kopf */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6">
            <span className="text-primary font-bold text-sm uppercase tracking-[0.18em]">
              {week.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-neutral-500 text-sm bg-warm-100/70 px-3 py-1 rounded-full">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              {week.range}
            </span>
          </div>

          <div className="space-y-6">
            {week.days
              .filter((d) => d.items.length > 0)
              .map((day) => (
                <section
                  key={day.date}
                  className={`rounded-3xl p-4 sm:p-6 ${
                    day.isToday
                      ? "bg-gradient-to-br from-warm-50 to-secondary/10 ring-1 ring-secondary/40"
                      : "bg-white ring-1 ring-neutral-100"
                  }`}
                >
                  {/* Tag-Kopf */}
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-heading text-xl font-bold text-neutral-800">
                      {day.dayName}
                    </h3>
                    <span className="text-sm font-medium text-neutral-400">
                      {formatDayDate(day.date)}
                    </span>
                    {day.isToday && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-primary px-2.5 py-1 rounded-full">
                        Heute
                      </span>
                    )}
                    <div className="flex-1 h-px bg-gradient-to-r from-neutral-200 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {day.items.map((item) => {
                      const qty = qtyOf(item.menuItemId);
                      return (
                        <div
                          key={item.menuItemId + day.date}
                          className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="h-36 bg-gradient-to-br from-secondary/20 to-warm-200 flex items-center justify-center relative overflow-hidden">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                unoptimized
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover"
                              />
                            ) : (
                              <UtensilsCrossed className="h-11 w-11 text-primary/20" />
                            )}
                            {qty > 0 && (
                              <div className="absolute top-3 left-3 z-10 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                                {qty}
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-heading text-base font-bold text-neutral-800 leading-snug">
                              {item.name}
                            </h4>
                            {item.note && (
                              <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                                {item.note}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-lg font-bold text-primary">
                                {formatCurrency(item.price)}
                              </span>
                              {qty > 0 ? (
                                <div className="flex items-center gap-1 bg-primary text-white rounded-full p-1">
                                  <button
                                    onClick={() => updateQuantity(item.menuItemId, qty - 1)}
                                    aria-label="Menge verringern"
                                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-primary-dark transition-colors"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums">
                                    {qty}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.menuItemId, qty + 1)}
                                    aria-label="Menge erhöhen"
                                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-primary-dark transition-colors"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    addItem({
                                      menuItemId: item.menuItemId,
                                      name: item.name,
                                      price: item.price,
                                      imageUrl: item.imageUrl || undefined,
                                    })
                                  }
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
                                >
                                  <Plus className="h-4 w-4" /> Hinzufügen
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
