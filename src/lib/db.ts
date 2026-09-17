import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url.replace(/^(mysql|mariadb):\/\//, "http://"));
  return {
    host: parsed.hostname === "localhost" ? "127.0.0.1" : parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
  };
}

function createPrismaClient() {
  const config = parseDatabaseUrl(process.env.DATABASE_URL || "");

  const adapter = new PrismaMariaDb({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    charset: "utf8mb4",
    collation: "utf8mb4_unicode_ci",
  } as any);

  return new PrismaClient({
    adapter,
  } as any);
}

/**
 * Prisma-Client wird ERST beim ersten Zugriff erzeugt (Ausfall 14.–17.09.2026).
 *
 * Vorher lief `createPrismaClient()` beim Laden des Moduls. Als der generierte
 * Prisma-Client auf dem Server kaputt war, warf schon der Import – und damit
 * stürzte JEDE Route ab, die db (direkt oder über auth) einbindet: die ganze
 * Website lieferte „Internal Server Error", obwohl die Datenbank lief und
 * Seiten mit direktem MariaDB-Zugriff (z. B. /wochenplan) funktionierten.
 * Mit der verzögerten Erzeugung scheitert nur noch die Route, die Prisma
 * wirklich braucht; alles andere bleibt online.
 */
let client: PrismaClient | undefined;

export function getDb(): PrismaClient {
  if (!client) {
    client = globalForPrisma.prisma ?? createPrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  }
  return client;
}

/** Prüft, ob Prisma nutzbar ist – für die Diagnose-Route /api/health. */
export function prismaStatus(): { ok: boolean; error?: string } {
  try {
    getDb();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const value = getDb()[prop as keyof PrismaClient];
    return typeof value === "function" ? (value as Function).bind(getDb()) : value;
  },
}) as PrismaClient;
