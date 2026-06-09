// Direkter MariaDB-Lesezugriff für Menü-Anzeigen.
// Grund: @prisma/client (v7 Driver-Adapter) liefert UTF-8-Umlaute beim Lesen
// fehlerhaft (U+FFFD). Der rohe mariadb-Treiber dekodiert korrekt. Schreibzugriffe
// laufen weiter über Prisma (Schreiben ist nicht betroffen).
import { createPool, type Pool } from "mariadb";
import { existsSync } from "fs";
import { join } from "path";

let pool: Pool | undefined;

/**
 * Foto eines Gerichts: gibt `/images/menu/{slug}.png` zurück, wenn die Datei
 * existiert, sonst null (dann zeigt die UI das Platzhalter-Icon). Server-only.
 */
export function menuImage(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const file = join(process.cwd(), "public", "images", "menu", `${slug}.png`);
  return existsSync(file) ? `/images/menu/${slug}.png` : null;
}

function getPool(): Pool {
  if (!pool) {
    const u = new URL((process.env.DATABASE_URL || "").replace(/^(mysql|mariadb):\/\//, "http://"));
    pool = createPool({
      host: u.hostname === "localhost" ? "127.0.0.1" : u.hostname,
      port: parseInt(u.port) || 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.slice(1),
      connectionLimit: 3,
    });
  }
  return pool;
}

export type WeekPlanRow = {
  dayOfWeek: number;
  name: string;
  price: number;
  category: string | null;
  note: string | null;
  slug: string;
  imageUrl: string | null;
};

/** Wochenplan einer Woche (korrekte Umlaute) – ab Montag (Date) */
export async function getWeekPlanRows(weekStart: Date): Promise<WeekPlanRow[]> {
  const ws = weekStart.toISOString().slice(0, 10);
  const conn = await getPool().getConnection();
  try {
    const rows = await conn.query(
      `SELECT w.dayOfWeek AS dayOfWeek, w.note AS note,
              m.name AS name, m.price AS price, m.slug AS slug, m.imageUrl AS imageUrl,
              c.name AS category
       FROM WeeklyPlanItem w
       JOIN MenuItem m ON w.menuItemId = m.id
       LEFT JOIN Category c ON m.categoryId = c.id
       WHERE w.weekStart = ?
       ORDER BY w.dayOfWeek ASC, w.mealType ASC`,
      [ws]
    );
    return (rows as Record<string, unknown>[]).map((r) => {
      const slug = r.slug != null ? String(r.slug) : "";
      const dbImg = r.imageUrl != null ? String(r.imageUrl) : null;
      return {
        dayOfWeek: Number(r.dayOfWeek),
        name: String(r.name),
        price: Number(r.price),
        category: r.category != null ? String(r.category) : null,
        note: r.note != null ? String(r.note) : null,
        slug,
        imageUrl: dbImg || menuImage(slug),
      };
    });
  } finally {
    conn.release();
  }
}
