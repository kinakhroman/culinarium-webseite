import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";
import { orderSchema } from "@/lib/validators";
import { generateOrderNumber } from "@/lib/utils";
import { sendTelegramMessage, formatOrderTelegramMessage } from "@/lib/telegram";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const orders = await db.order.findMany({
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
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Fetch menu items for pricing
  const menuItemIds = data.items.map((i) => i.menuItemId);
  const menuItems = await db.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  // Calculate totals
  let subtotal = 0;
  const orderItems = data.items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId);
    if (!menuItem) throw new Error(`Menüeintrag ${item.menuItemId} nicht gefunden`);
    const lineTotal = menuItem.price * item.quantity;
    subtotal += lineTotal;
    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: menuItem.price,
      itemName: menuItem.name,
      notes: item.notes || null,
    };
  });

  const deliveryFee = data.orderType === "DELIVERY" ? 3.5 : 0;
  const total = subtotal + deliveryFee;

  // Get user info
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
  }

  // Parse requested time
  let requestedTime: Date | null = null;
  if (data.requestedTime) {
    const today = new Date();
    const [hours, minutes] = data.requestedTime.split(":").map(Number);
    requestedTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
  }

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
      orderItems: {
        create: orderItems,
      },
    },
    include: { orderItems: true },
  });

  // Send Telegram notification
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
    await db.order.update({
      where: { id: order.id },
      data: { telegramNotified: true },
    });
  }

  return NextResponse.json(order, { status: 201 });
}
