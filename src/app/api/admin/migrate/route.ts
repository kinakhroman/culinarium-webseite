import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../../auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/migrate – legt fehlende Tabellen idempotent an.
 * Nötig, weil der Hostinger-Build-Container die DB nicht erreicht
 * (prisma db push läuft dort ins Leere); die laufende App erreicht sie.
 * Auth: Admin-Session ODER x-api-key === MENU_API_KEY.
 */
export async function POST(req: Request) {
  const session = await auth();
  const isAdmin = !!session?.user && session.user.role === "ADMIN";
  const token =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const tokenOk = !!process.env.MENU_API_KEY && token === process.env.MENU_API_KEY;
  if (!isAdmin && !tokenOk) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const results: Record<string, string> = {};

  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`Inquiry\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`type\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`email\` VARCHAR(191) NULL,
        \`phone\` VARCHAR(191) NULL,
        \`subject\` VARCHAR(191) NULL,
        \`message\` TEXT NULL,
        \`company\` VARCHAR(191) NULL,
        \`site\` VARCHAR(191) NULL,
        \`people\` INT NULL,
        \`status\` VARCHAR(191) NOT NULL DEFAULT 'NEW',
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`Inquiry_type_idx\`(\`type\`),
        INDEX \`Inquiry_status_idx\`(\`status\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    results.Inquiry = "ok";
  } catch (e) {
    results.Inquiry = `Fehler: ${e instanceof Error ? e.message : "unbekannt"}`;
  }

  return NextResponse.json({ success: true, tables: results });
}
