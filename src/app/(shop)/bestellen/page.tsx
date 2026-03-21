"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/features/cart/cart-provider";
import { formatCurrency } from "@/lib/utils";
import {
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingCart,
  Leaf,
  WheatOff,
  Check,
} from "lucide-react";
import Link from "next/link";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  category: { id: string; name: string; slug: string };
}

export default function BestellenPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, items: cartItems, total, itemCount } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [menuRes, catRes] = await Promise.all([
        fetch("/api/menu"),
        fetch("/api/categories"),
      ]);
      const menuData = await menuRes.json();
      const catData = await catRes.json();
      setItems(menuData);
      setCategories(catData);
      setLoading(false);
    }
    load();
  }, []);

  const filteredItems = activeCategory
    ? items.filter((item) => item.category.id === activeCategory)
    : items;

  function handleAdd(item: MenuItem) {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || undefined,
    });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1000);
  }

  function getCartQuantity(menuItemId: string): number {
    return cartItems.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-neutral-500">Speisekarte wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-neutral-800">
          Online bestellen
        </h1>
        <p className="text-neutral-500 mt-2">
          Wählen Sie Ihre Gerichte und legen Sie sie in den Warenkorb.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === null
              ? "bg-primary text-white"
              : "bg-warm-100 text-neutral-600 hover:bg-warm-200"
          }`}
        >
          Alle
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-primary text-white"
                : "bg-warm-100 text-neutral-600 hover:bg-warm-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredItems.map((item) => {
          const qty = getCartQuantity(item.id);
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-40 bg-gradient-to-br from-secondary/20 to-warm-200 flex items-center justify-center relative">
                <UtensilsCrossed className="h-12 w-12 text-primary/20" />
                <div className="absolute top-3 right-3 flex gap-1">
                  {item.isVegetarian && (
                    <span className="bg-green-500 text-white p-1 rounded-full">
                      <Leaf className="h-3 w-3" />
                    </span>
                  )}
                  {item.isGlutenFree && (
                    <span className="bg-amber-500 text-white p-1 rounded-full">
                      <WheatOff className="h-3 w-3" />
                    </span>
                  )}
                </div>
                {qty > 0 && (
                  <div className="absolute top-3 left-3 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                    {qty}
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="text-xs text-neutral-400">{item.category.name}</span>
                <h3 className="font-heading text-lg font-bold text-neutral-800 mt-0.5">
                  {item.name}
                </h3>
                <p className="text-sm text-neutral-500 mt-1 mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(item.price)}
                  </span>
                  <button
                    onClick={() => handleAdd(item)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      addedId === item.id
                        ? "bg-green-500 text-white"
                        : "bg-primary text-white hover:bg-primary-dark"
                    }`}
                  >
                    {addedId === item.id ? (
                      <>
                        <Check className="h-4 w-4" /> Hinzugefügt
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Hinzufügen
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-2xl z-40 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <span className="font-semibold text-neutral-800">
                  {itemCount} Artikel
                </span>
                <span className="text-neutral-400 mx-2">|</span>
                <span className="font-bold text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <Link
              href="/warenkorb"
              className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
            >
              Warenkorb ansehen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
