import { db } from "@/lib/db";
import { auth } from "../../../../../../auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { ArrowLeft, Phone, Mail, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") notFound();

  const { orderId } = await params;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true, user: { select: { name: true, email: true } } },
  });
  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/bestellungen" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Bestellungen
      </Link>

      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-primary">{order.orderNumber}</h1>
            <p className="text-sm text-neutral-400">{formatDateTime(order.createdAt)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="text-xs text-neutral-400 uppercase tracking-wider">Kunde</span>
            <p className="font-medium text-neutral-800">{order.customerName}</p>
            {order.customerPhone && (
              <a href={`tel:${order.customerPhone}`} className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-primary">
                <Phone className="h-3.5 w-3.5" /> {order.customerPhone}
              </a>
            )}
            {order.customerEmail && (
              <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-1.5 text-neutral-500 hover:text-primary">
                <Mail className="h-3.5 w-3.5" /> {order.customerEmail}
              </a>
            )}
          </div>
          <div>
            <span className="text-xs text-neutral-400 uppercase tracking-wider">
              {order.orderType === "PICKUP" ? "Abholung" : "Lieferung"}
            </span>
            <p className="flex items-center gap-1.5 text-neutral-700">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {order.requestedTime ? formatDateTime(order.requestedTime) : "Schnellstmöglich"}
            </p>
            {order.orderType === "DELIVERY" && order.deliveryStreet && (
              <p className="flex items-start gap-1.5 text-neutral-600 mt-1">
                <MapPin className="h-3.5 w-3.5 text-primary mt-0.5" />
                <span>
                  {order.deliveryStreet} {order.deliveryHouseNumber}<br />
                  {order.deliveryPostalCode} {order.deliveryCity}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-4 space-y-2">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-neutral-700">
                {item.quantity}× {item.itemName}
                {item.notes && <span className="text-neutral-400 italic"> – {item.notes}</span>}
              </span>
              <span className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm text-neutral-500 pt-2">
            <span>Zwischensumme</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Liefergebühr</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-100 pt-3">
            <span className="font-bold">Gesamt</span>
            <span className="font-bold text-primary text-lg">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="mt-4 p-3 bg-warm-50 rounded-lg">
            <span className="text-xs text-neutral-400 block mb-1">Anmerkungen des Kunden:</span>
            <p className="text-sm text-neutral-600 whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
