import { db } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { ShoppingBag, Users, Euro, TrendingUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalOrders, todayOrders, totalUsers, totalRevenue, recentOrders] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: today } } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    db.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { orderItems: true },
    }),
  ]);

  return {
    totalOrders,
    todayOrders,
    totalUsers,
    totalRevenue: totalRevenue._sum.total || 0,
    recentOrders,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Bestellungen heute", value: stats.todayOrders, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Bestellungen gesamt", value: stats.totalOrders, icon: TrendingUp, color: "bg-green-500" },
    { label: "Kunden", value: stats.totalUsers, icon: Users, color: "bg-purple-500" },
    { label: "Gesamtumsatz", value: formatCurrency(stats.totalRevenue), icon: Euro, color: "bg-primary" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-neutral-800 mb-6">
        Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5 flex items-center gap-4">
            <div className={`${card.color} text-white w-12 h-12 rounded-xl flex items-center justify-center`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">{card.label}</p>
              <p className="text-2xl font-bold text-neutral-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-neutral-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-heading text-lg font-bold text-neutral-800">
            Letzte Bestellungen
          </h2>
          <Link href="/admin/bestellungen" className="text-sm text-primary font-medium hover:underline">
            Alle anzeigen
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Nr.</th>
                <th className="px-6 py-3 text-left">Kunde</th>
                <th className="px-6 py-3 text-left">Typ</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Betrag</th>
                <th className="px-6 py-3 text-right">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-3 font-medium">
                    <Link href={`/admin/bestellungen/${order.id}`} className="text-primary hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{order.customerName}</td>
                  <td className="px-6 py-3">{order.orderType === "PICKUP" ? "Abholung" : "Lieferung"}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                      {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-3 text-right text-neutral-400">{formatDateTime(order.createdAt)}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-400">
                    Noch keine Bestellungen
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
