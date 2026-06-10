import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";
import { orderSchema } from "@/lib/validators";
import { generateOrderNumber } from "@/lib/utils";
import { sendTelegramMessage, formatOrderTelegramMessage } from "@/lib/telegram";
import { getStripe, isStripeEnabled } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  // Admin sieht alle Bestellungen, Kunden nur ihre eigenen
  const where = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

  const orders = await db.order.findMany({
    where,
    include: { orderItems: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    const firstMsg =
      parsed.error.issues[0]?.message || "Bitte alle Pflichtfelder korrekt ausfüllen.";
    return NextResponse.json({ error: firstMsg }, { status: 400 });
  }

  const data = parsed.data;

  // Fetch menu items for pricing
  const menuItemIds = data.items.map((i) => i.menuItemId);
  const menuItems = await db.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  // Calculate totals (Preise serverseitig aus der DB – Client-Preise werden ignoriert)
  let subtotal = 0;
  const orderItems = [];
  for (const item of data.items) {
    const menuItem = menuItemMap.get(item.menuItemId);
    if (!menuItem || !menuItem.isAvailable) {
      return NextResponse.json(
        { error: "Ein Gericht ist nicht mehr verfügbar. Bitte Warenkorb prüfen." },
        { status: 409 }
      );
    }
    subtotal += menuItem.price * item.quantity;
    orderItems.push({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: menuItem.price,
      itemName: menuItem.name,
      notes: item.notes || null,
    });
  }

  // Lieferung erst ab Mindestbestellwert (serverseitig erzwungen)
  const MIN_DELIVERY = 50;
  if (data.orderType === "DELIVERY" && subtotal < MIN_DELIVERY) {
    return NextResponse.json(
      { error: `Lieferung ist erst ab ${MIN_DELIVERY.toFixed(2)} € möglich.` },
      { status: 400 }
    );
  }

  const deliveryFee = data.orderType === "DELIVERY" ? 3.5 : 0;
  const total = subtotal + deliveryFee;

  // Get user info
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
  }

  // Parse requested time
  let requestedTime: Date | null = null;
  if (data.requestedTime && /^\d{1,2}:\d{2}$/.test(data.requestedTime)) {
    const today = new Date();
    const [hours, minutes] = data.requestedTime.split(":").map(Number);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      requestedTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    }
  }

  // Lieferung wird online vorab bezahlt (sofern Stripe konfiguriert); sonst „vor Ort"
  const needsPrepay = data.orderType === "DELIVERY" && isStripeEnabled();

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.user.id,
      orderType: data.orderType,
      subtotal,
      deliveryFee,
      total,
      notes: data.notes || null,
      deliveryStreet: data.deliveryStreet || null,
      deliveryHouseNumber: data.deliveryHouseNumber || null,
      deliveryPostalCode: data.deliveryPostalCode || null,
      deliveryCity: data.deliveryCity || null,
      requestedTime,
      customerName: user.name,
      customerPhone: user.phone,
      customerEmail: user.email,
      paymentStatus: needsPrepay ? "UNPAID" : "ON_SITE",
      orderItems: { create: orderItems },
    },
    include: { orderItems: true },
  });

  // Lieferung: Stripe-Checkout-Session erstellen und Kunden zur Bezahlung schicken
  if (needsPrepay) {
    const stripe = getStripe()!;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://culinarium-berlin.de";
    try {
      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: order.customerEmail,
        line_items: [
          ...order.orderItems.map((it) => ({
            price_data: {
              currency: "eur",
              product_data: { name: it.itemName },
              unit_amount: Math.round(it.unitPrice * 100),
            },
            quantity: it.quantity,
          })),
          {
            price_data: {
              currency: "eur",
              product_data: { name: "Liefergebühr" },
              unit_amount: Math.round(deliveryFee * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/bestaetigung/${order.id}?paid=1`,
        cancel_url: `${baseUrl}/kasse`,
        metadata: { orderId: order.id },
      });
      await db.order.update({
        where: { id: order.id },
        data: { stripeSessionId: checkout.id },
      });
      return NextResponse.json({ ...order, checkoutUrl: checkout.url }, { status: 201 });
    } catch (e) {
      console.error("[orders] Stripe-Checkout fehlgeschlagen:", e);
      // Bestellung existiert – Kunde soll es erneut versuchen
      return NextResponse.json(
        { error: "Bezahlung konnte nicht gestartet werden. Bitte erneut versuchen." },
        { status: 502 }
      );
    }
  }

  // Abholung / ohne Stripe: Telegram-Benachrichtigung (no-op ohne Token)
  const telegramMsg = formatOrderTelegramMessage({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    orderType: order.orderType,
    requestedTime: order.requestedTime,
    total: order.total,
    notes: order.notes,
    items: order.orderItems,
  });
  const sent = await sendTelegramMessage({ text: telegramMsg });
  if (sent) {
    await db.order.update({ where: { id: order.id }, data: { telegramNotified: true } });
  }

  return NextResponse.json(order, { status: 201 });
}
