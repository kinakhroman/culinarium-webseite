"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS, ORDER_STATUS_COLORS } from "@/lib/constants";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  orderType: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function AdminBestellungenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); });
  }, []);

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }

  if (loading) return <div className="py-8 text-center text-neutral-500">Lädt...</div>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-neutral-800 mb-6">
        Bestellungen
      </h1>

      <div className="bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Nr.</th>
              <th className="px-4 py-3 text-left">Kunde</th>
              <th className="px-4 py-3 text-left">Typ</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Betrag</th>
              <th className="px-4 py-3 text-right">Datum</th>
              <th className="px-4 py-3 text-center">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/bestellungen/${order.id}`} className="text-primary hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3">{order.orderType === "PICKUP" ? "Abholung" : "Lieferung"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(order.total)}</td>
                <td className="px-4 py-3 text-right text-neutral-400 text-xs">{formatDateTime(order.createdAt)}</td>
                <td className="px-4 py-3 text-center">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-xs border border-neutral-200 rounded-lg px-2 py-1 bg-white"
                  >
                    {Object.entries(ORDER_STATUS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  Noch keine Bestellungen
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
