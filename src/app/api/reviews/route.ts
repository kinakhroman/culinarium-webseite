import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";
import { reviewSchema } from "@/lib/validators";

export async function GET() {
  const reviews = await db.review.findMany({
    where: { isVisible: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const review = await db.review.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(review, { status: 201 });
}
