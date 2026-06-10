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

  // Order: Zahlungs-Spalten (MariaDB unterstützt IF NOT EXISTS)
  try {
    await db.$executeRawUnsafe(
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'ON_SITE'"
    );
    await db.$executeRawUnsafe(
      "ALTER TABLE `Order` ADD COLUMN IF NOT EXISTS `stripeSessionId` VARCHAR(191) NULL"
    );
    results.OrderPayment = "ok";
  } catch (e) {
    results.OrderPayment = `Fehler: ${e instanceof Error ? e.message : "unbekannt"}`;
  }

  // Order.userId nullable machen (Gast-Bestellungen ohne Konto).
  // Der Fremdschlüssel verhindert ein direktes MODIFY -> lösen, ändern, neu setzen.
  try {
    // 1. Fremdschlüssel lösen (falls vorhanden)
    try {
      await db.$executeRawUnsafe("ALTER TABLE `Order` DROP FOREIGN KEY `Order_userId_fkey`");
    } catch {
      /* FK existiert evtl. schon nicht mehr – ignorieren */
    }
    // 2. Spalte auf nullable umstellen (idempotent)
    await db.$executeRawUnsafe("ALTER TABLE `Order` MODIFY `userId` VARCHAR(191) NULL");
    // 3. Fremdschlüssel neu setzen: Konto gelöscht -> Bestellung wird Gast-Bestellung
    try {
      await db.$executeRawUnsafe(
        "ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE"
      );
    } catch {
      /* FK existiert bereits – ignorieren */
    }
    results.OrderGuest = "ok";
  } catch (e) {
    results.OrderGuest = `Fehler: ${e instanceof Error ? e.message : "unbekannt"}`;
  }

  return NextResponse.json({ success: true, tables: results });
}
