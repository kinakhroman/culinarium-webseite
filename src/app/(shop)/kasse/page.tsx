"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/features/cart/cart-provider";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Clock, FileText, ShoppingCart, Truck, Store, User } from "lucide-react";
import Link from "next/link";

export default function KassePage() {
  const { data: session } = useSession();
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  const [orderType, setOrderType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [requestedTime, setRequestedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryHouseNumber, setDeliveryHouseNumber] = useState("");
  const [deliveryPostalCode, setDeliveryPostalCode] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("Berlin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stripeOn, setStripeOn] = useState(false);

  useEffect(() => {
    fetch("/api/payment-config")
      .then((r) => (r.ok ? r.json() : { stripe: false }))
      .then((d) => setStripeOn(!!d.stripe))
      .catch(() => setStripeOn(false));
  }, []);

  const MIN_DELIVERY = 50;
  const deliveryFee = orderType === "DELIVERY" ? 3.5 : 0;
  const grandTotal = total + deliveryFee;
  const deliveryBlocked = orderType === "DELIVERY" && total < MIN_DELIVERY;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-neutral-800 mb-4">
          Warenkorb ist leer
        </h1>
        <Link href="/bestellen" className="text-primary font-semibold hover:underline">
          Gerichte auswählen
        </Link>
      </div>
    );
  }

  async function handleOrder() {
    setError("");

    // Gast-Bestellung: Vorname, Nachname und Telefon erforderlich (für Rücksprache)
    if (
      !session?.user &&
      (!guestFirstName.trim() || !guestLastName.trim() || !guestPhone.trim())
    ) {
      setError("Bitte Vorname, Nachname und Telefonnummer angeben – oder melde dich an.");
      return;
    }

    // Lieferung erst ab Mindestbestellwert
    if (orderType === "DELIVERY" && total < MIN_DELIVERY) {
      setError(
        `Lieferung ist erst ab ${formatCurrency(MIN_DELIVERY)} möglich (aktuell ${formatCurrency(
          total
        )}). Bitte Abholung wählen oder mehr hinzufügen.`
      );
      return;
    }

    // Bei Lieferung: Adresse muss vollständig sein
    if (
      orderType === "DELIVERY" &&
      (!deliveryStreet.trim() ||
        !deliveryHouseNumber.trim() ||
        !deliveryPostalCode.trim() ||
        !deliveryCity.trim())
    ) {
      setError("Bitte vollständige Lieferadresse angeben (Straße, Hausnummer, PLZ, Ort).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType,
          requestedTime: requestedTime || undefined,
          notes: notes || undefined,
          guestName: !session?.user
            ? `${guestFirstName} ${guestLastName}`.trim()
            : undefined,
          guestEmail: !session?.user ? guestEmail : undefined,
          guestPhone: !session?.user ? guestPhone : undefined,
          deliveryStreet: orderType === "DELIVERY" ? deliveryStreet : undefined,
          deliveryHouseNumber: orderType === "DELIVERY" ? deliveryHouseNumber : undefined,
          deliveryPostalCode: orderType === "DELIVERY" ? deliveryPostalCode : undefined,
          deliveryCity: orderType === "DELIVERY" ? deliveryCity : undefined,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            notes: i.notes,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(typeof err.error === "string" ? err.error : "Bestellung fehlgeschlagen.");
        setLoading(false);
        return;
      }

      const order = await res.json();
      clearCart();
      // Lieferung mit Online-Zahlung: zu Stripe weiterleiten; sonst Bestätigung
      if (order.checkoutUrl) {
        window.location.href = order.checkoutUrl;
      } else {
        router.push(`/bestaetigung/${order.id}`);
      }
    } catch {
      setError("Ein Fehler ist aufgetreten.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-8">
        Kasse
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Gast-Kontaktdaten (nur ohne Login) */}
          {!session?.user && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-heading text-lg font-bold text-neutral-800 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Ihre Kontaktdaten
                </h2>
              </div>
              <p className="text-sm text-neutral-500 mb-4">
                Bestellung als Gast – ganz ohne Konto. Telefonnummer für die Rücksprache zur
                Bestellung.{" "}
                <Link
                  href="/login?callbackUrl=/kasse"
                  className="text-primary font-semibold hover:underline"
                >
                  Schon Kunde? Anmelden
                </Link>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Vorname *</label>
                  <input
                    type="text"
                    value={guestFirstName}
                    onChange={(e) => setGuestFirstName(e.target.value)}
                    required
                    placeholder="Vorname"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nachname *</label>
                  <input
                    type="text"
                    value={guestLastName}
                    onChange={(e) => setGuestLastName(e.target.value)}
                    required
                    placeholder="Nachname"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                    placeholder="z. B. 0170 1234567"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    E-Mail (optional)
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="ihre@email.de"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Order Type */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h2 className="font-heading text-lg font-bold text-neutral-800 mb-4">
              Wie möchten Sie Ihr Essen erhalten?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderType("PICKUP")}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                  orderType === "PICKUP"
                    ? "border-primary bg-primary/5"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <Store className={`h-6 w-6 ${orderType === "PICKUP" ? "text-primary" : "text-neutral-400"}`} />
                <div className="text-left">
                  <span className="font-semibold text-neutral-800 block">Abholung</span>
                  <span className="text-xs text-neutral-500">Kostenlos</span>
                </div>
              </button>
              <button
                onClick={() => setOrderType("DELIVERY")}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                  orderType === "DELIVERY"
                    ? "border-primary bg-primary/5"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <Truck className={`h-6 w-6 ${orderType === "DELIVERY" ? "text-primary" : "text-neutral-400"}`} />
                <div className="text-left">
                  <span className="font-semibold text-neutral-800 block">Lieferung</span>
                  <span className="text-xs text-neutral-500">
                    {formatCurrency(3.5)} · ab {formatCurrency(MIN_DELIVERY)}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Hinweis: Lieferung erst ab Mindestbestellwert */}
          {deliveryBlocked && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
              Lieferung ist erst ab <strong>{formatCurrency(MIN_DELIVERY)}</strong> möglich
              (aktuell {formatCurrency(total)}). Es fehlen noch{" "}
              <strong>{formatCurrency(MIN_DELIVERY - total)}</strong> – oder wähle{" "}
              <button
                type="button"
                onClick={() => setOrderType("PICKUP")}
                className="underline font-semibold"
              >
                Abholung
              </button>
              .
            </div>
          )}

          {/* Delivery Address */}
          {orderType === "DELIVERY" && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="font-heading text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Lieferadresse
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Straße *</label>
                    <input
                      type="text"
                      value={deliveryStreet}
                      onChange={(e) => setDeliveryStreet(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Nr. *</label>
                    <input
                      type="text"
                      value={deliveryHouseNumber}
                      onChange={(e) => setDeliveryHouseNumber(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">PLZ *</label>
                  <input
                    type="text"
                    value={deliveryPostalCode}
                    onChange={(e) => setDeliveryPostalCode(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Stadt</label>
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Time */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h2 className="font-heading text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Gewünschte Uhrzeit
            </h2>
            <input
              type="time"
              value={requestedTime}
              onChange={(e) => setRequestedTime(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <p className="text-xs text-neutral-400 mt-2">
              Leer lassen für schnellstmögliche Zubereitung.
            </p>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h2 className="font-heading text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Sonderwünsche
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Allergien, besondere Wünsche, Anmerkungen..."
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-warm-50 rounded-2xl p-6 border border-neutral-100 h-fit sticky top-24">
          <h3 className="font-heading text-xl font-bold text-neutral-800 mb-4">
            Ihre Bestellung
          </h3>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex justify-between text-sm">
                <span className="text-neutral-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-200 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Zwischensumme</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {orderType === "DELIVERY" && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Liefergebühr</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-semibold text-neutral-800">Gesamt</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">{error}</p>
          )}

          <button
            onClick={handleOrder}
            disabled={loading || deliveryBlocked}
            className="w-full mt-6 bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading
              ? "Wird bestellt..."
              : deliveryBlocked
              ? `Lieferung ab ${formatCurrency(MIN_DELIVERY)}`
              : orderType === "DELIVERY" && stripeOn
              ? `Weiter zur Bezahlung (${formatCurrency(grandTotal)})`
              : `Jetzt bestellen (${formatCurrency(grandTotal)})`}
          </button>

          <p className="text-xs text-neutral-400 text-center mt-3">
            {orderType === "PICKUP"
              ? "Zahlung bei Abholung (bar oder Karte)"
              : stripeOn
              ? "Online-Vorkasse: Karte, Apple Pay & Google Pay"
              : "Zahlung bei Lieferung"}
          </p>
        </div>
      </div>
    </div>
  );
}
