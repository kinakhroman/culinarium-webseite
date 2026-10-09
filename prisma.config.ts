import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Anführungszeichen/Leerzeichen entfernen (Hostinger-Build 09.10.2026: P1013)
    url: (process.env.DATABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").trim(),
  },
});
