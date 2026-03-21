import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as mariadb from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = mariadb.createPool({
    host: new URL((process.env.DATABASE_URL || "").replace("mysql://", "http://")).hostname,
    port: parseInt(new URL((process.env.DATABASE_URL || "").replace("mysql://", "http://")).port) || 3306,
    user: decodeURIComponent(new URL((process.env.DATABASE_URL || "").replace("mysql://", "http://")).username),
    password: decodeURIComponent(new URL((process.env.DATABASE_URL || "").replace("mysql://", "http://")).password),
    database: new URL((process.env.DATABASE_URL || "").replace("mysql://", "http://")).pathname.slice(1),
    connectionLimit: 5,
  });

  const adapter = new PrismaMariaDb(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  } as any);
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
