import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Leaf, UtensilsCrossed, WheatOff } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Speisekarte",
  description: "Unsere komplette Speisekarte mit Vorspeisen, Hauptgerichten, Salaten, Desserts und Getränken.",
};

async function getMenuData() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      menuItems: {
        where: { isAvailable: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  return categories;
}

export default async function SpeisekartePage() {
  const categories = await getMenuData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <span className="text-primary font-semibold text-sm uppercase tracking-wider">
          Unsere Küche
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-2 mb-4">
          Speisekarte
        </h1>
        <p className="text-neutral-500 max-w-xl mx-auto">
          Alle Gerichte werden täglich frisch mit regionalen Zutaten zubereitet.
        </p>
      </div>

      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category.id}>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-neutral-800 mb-6 pb-3 border-b-2 border-secondary/30">
              {category.name}
            </h2>
            {category.description && (
              <p className="text-neutral-500 mb-6">{category.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl bg-warm-50 hover:bg-warm-100 transition-colors border border-neutral-100"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-warm-200 rounded-xl flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="h-8 w-8 text-primary/20" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-neutral-800">
                          {item.name}
                        </h3>
                        <div className="flex gap-1.5 mt-0.5">
                          {item.isVegetarian && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                              <Leaf className="h-3 w-3" /> Vegetarisch
                            </span>
                          )}
                          {item.isVegan && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-800 bg-green-200 px-1.5 py-0.5 rounded">
                              <Leaf className="h-3 w-3" /> Vegan
                            </span>
                          )}
                          {item.isGlutenFree && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              <WheatOff className="h-3 w-3" /> Glutenfrei
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-lg font-bold text-primary whitespace-nowrap">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                    {item.allergens && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Allergene: {item.allergens}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
