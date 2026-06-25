import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../../../auth";

export const dynamic = "force-dynamic";

/**
 * Löscht Test-/Alt-Bestellungen. Sicherheitshalber nur Bestellungen, die VOR
 * einem Stichtag erstellt wurden (Standard: heute 00:00) – so werden echte,
 * neue Bestellungen nie versehentlich gelöscht. OrderItems gehen per Cascade mit.
 *
 *   POST /api/admin/orders/purge            -> löscht alles vor heute 00:00
 *   POST /api/admin/orders/purge?before=YYYY-MM-DD
 *
 * Auth: Admin-Session ODER x-api-key/Bearer === MENU_API_KEY.
 */
async function authorized(req: Request): Promise<boolean> {
  const header =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const apiKey = process.env.MENU_API_KEY;
  if (apiKey && header === apiKey) return true;
  const session = await auth();
  return !!session?.user && session.user.role === "ADMIN";
}

export async function POST(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const beforeParam = new URL(req.url).searchParams.get("before");
  let cutoff: Date;
  if (beforeParam && /^\d{4}-\d{2}-\d{2}$/.test(beforeParam)) {
    cutoff = new Date(`${beforeParam}T00:00:00`);
  } else {
    cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
  }

  const toDelete = await db.order.count({ where: { createdAt: { lt: cutoff } } });
  const result = await db.order.deleteMany({ where: { createdAt: { lt: cutoff } } });

  return NextResponse.json({
    ok: true,
    deleted: result.count,
    matched: toDelete,
    before: cutoff.toISOString(),
  });
}
