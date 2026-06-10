import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { listSavedWeeks } from "@/lib/menu-db";

export const dynamic = "force-dynamic";

/**
 * GET /api/weekly-plan/weeks – alle gespeicherten Wochen (neueste zuerst)
 * fürs Druck-Archiv. Zugriff: eingeloggter Admin ODER x-api-key === MENU_API_KEY.
 */
export async function GET(req: Request) {
  const session = await auth();
  const isAdmin = !!session?.user && session.user.role === "ADMIN";
  const token =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const tokenOk = !!process.env.MENU_API_KEY && token === process.env.MENU_API_KEY;
  if (!isAdmin && !tokenOk) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weeks = await listSavedWeeks();
  return NextResponse.json({ weeks });
}
