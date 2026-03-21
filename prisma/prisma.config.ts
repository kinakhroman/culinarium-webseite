import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join(__dirname, "schema.prisma"),
  migrate: {
    adapter: async () => {
      const mariadb = await import("mariadb");
      const { PrismaMariaDb } = await import("@prisma/adapter-mariadb");

      const pool = mariadb.createPool({
        uri: process.env.DATABASE_URL,
        connectionLimit: 1,
      });

      return new PrismaMariaDb(pool);
    },
  },
});
