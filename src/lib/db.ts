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
  const connectionString = `mariadb://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;

  const adapter = new PrismaMariaDb(connectionString as any);

  return new PrismaClient({
    adapter,
  } as any);
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
