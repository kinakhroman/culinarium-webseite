import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Stripe-Webhook: bestätigt Zahlungen serverseitig (verlässlicher als der Redirect).
 * In Stripe (Dashboard → Webhooks) als Endpoint eintragen:
 *   https://culinarium-berlin.de/api/webhooks/stripe   (Event: checkout.session.completed)
 * und das Signing-Secret als STRIPE_WEBHOOK_SECRET hinterlegen.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe nicht konfiguriert" }, { status: 400 });
  }

  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    console.error("[stripe-webhook] Signatur ungültig:", e);
    return NextResponse.json({ error: "Ungültige Signatur" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const sessionObj = event.data.object as { id: string; metadata?: { orderId?: string } };
    const orderId = sessionObj.metadata?.orderId;
    if (orderId) {
      try {
        await db.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID", status: "CONFIRMED" },
        });
      } catch (e) {
        console.error("[stripe-webhook] Bestellung nicht aktualisiert:", e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
