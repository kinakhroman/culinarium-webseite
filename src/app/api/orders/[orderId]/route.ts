import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../../auth";

export async function GET(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const { orderId } = await params;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true, user: { select: { name: true, email: true } } },
  });

  if (!order) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PUT(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { orderId } = await params;
  const body = await req.json();

  const order = await db.order.update({
    where: { id: orderId },
    data: { status: body.status },
    include: { orderItems: true },
  });

  return NextResponse.json(order);
}
