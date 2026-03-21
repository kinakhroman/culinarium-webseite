"use client";

import { useCart } from "@/components/features/cart/cart-provider";
import { formatCurrency } from "@/lib/utils";
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WarenkorbPage() {
  const { items, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-20 w-20 text-neutral-300 mx-auto mb-6" />
        <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-3">
          Ihr Warenkorb ist leer
        </h1>
        <p className="text-neutral-500 mb-8">
          Fügen Sie Gerichte aus unserer Speisekarte hinzu.
        </p>
        <Link
          href="/bestellen"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Zur Bestellung
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-8">
        Warenkorb
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.menuItemId}
              className="bg-white rounded-xl border border-neutral-100 p-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-warm-200 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-800 truncate">
                  {item.name}
                </h3>
                <span className="text-sm text-primary font-bold">
                  {formatCurrency(item.price)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-right">
                <span className="font-bold text-neutral-800">
                  {formatCurrency(item.price * item.quantity)}
                </span>
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="block mt-1 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <Link
              href="/bestellen"
              className="text-primary font-medium hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Weiter einkaufen
            </Link>
            <button
              onClick={clearCart}
              className="text-red-500 text-sm hover:underline"
            >
              Warenkorb leeren
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-warm-50 rounded-2xl p-6 border border-neutral-100 h-fit sticky top-24">
          <h3 className="font-heading text-xl font-bold text-neutral-800 mb-4">
            Zusammenfassung
          </h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Artikel ({itemCount})</span>
              <span className="font-medium">{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-3 mb-6">
            <div className="flex justify-between">
              <span className="font-semibold text-neutral-800">Gesamt</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              zzgl. Liefergebühr bei Lieferung
            </p>
          </div>
          <Link
            href="/kasse"
            className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            Zur Kasse
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
