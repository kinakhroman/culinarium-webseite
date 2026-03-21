import { db } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { CheckCircle, Clock, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BestellbestaetigungPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-2">
        Bestellung aufgegeben!
      </h1>
      <p className="text-neutral-500 mb-8">
        Vielen Dank für Ihre Bestellung. Wir bereiten alles für Sie vor.
      </p>

      <div className="bg-white rounded-2xl border border-neutral-100 p-6 text-left mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-sm text-neutral-400">Bestellnummer</span>
            <p className="font-heading text-xl font-bold text-primary">{order.orderNumber}</p>
          </div>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            Ausstehend
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{order.orderType === "PICKUP" ? "Abholung" : "Lieferung"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              {order.requestedTime
                ? formatDateTime(order.requestedTime)
                : "Schnellstmöglich"}
            </span>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-4 space-y-2">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.itemName}</span>
              <span className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-neutral-100 pt-3 flex justify-between">
            <span className="font-bold">Gesamt</span>
            <span className="font-bold text-primary text-lg">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="mt-4 p-3 bg-warm-50 rounded-lg">
            <span className="text-xs text-neutral-400 block mb-1">Anmerkungen:</span>
            <p className="text-sm text-neutral-600">{order.notes}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
        >
          Zur Startseite
        </Link>
        <Link
          href="/bestellen"
          className="inline-flex items-center justify-center gap-2 border border-primary text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-colors"
        >
          Weitere Bestellung
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
