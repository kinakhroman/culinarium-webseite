"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { ShoppingBag } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  total: number;
  createdAt: string;
  orderItems: { itemName: string; quantity: number; unitPrice: number }[];
}

export default function BestellungenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => {
        if (r.status === 401) return [];
        return r.json();
      })
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="py-8 text-center text-neutral-500">Lädt...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-8">
        Meine Bestellungen
      </h1>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-neutral-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-heading font-bold text-primary">{order.orderNumber}</span>
                  <span className="block text-xs text-neutral-400 mt-0.5">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                {order.orderItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-neutral-600">{item.quantity}x {item.itemName}</span>
                    <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-100">
                <span className="text-sm text-neutral-500">
                  {order.orderType === "PICKUP" ? "Abholung" : "Lieferung"}
                </span>
                <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-warm-50 rounded-2xl">
          <ShoppingBag className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-neutral-600 mb-2">
            Noch keine Bestellungen
          </h3>
          <p className="text-neutral-400">Ihre Bestellhistorie erscheint hier.</p>
        </div>
      )}
    </div>
  );
}
