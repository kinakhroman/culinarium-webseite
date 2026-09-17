import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mariadb nicht bündeln (sonst bricht die UTF-8/Umlaut-Dekodierung);
  // sharp nicht bündeln (natives Modul – gebündelt schlägt import("sharp") auf
  // dem Server fehl und Gericht-Fotos werden als rohe 2-MB-PNGs gespeichert)
  serverExternalPackages: ["mariadb", "sharp"],
  // Den GENERIERTEN Prisma-Client zwingend mit ins Standalone-Paket kopieren.
  // Ohne das fehlte er nach einem Server-seitigen npm-Lauf (Ausfall 14.–17.09.
  // 2026): `import "@prisma/client"` warf beim Laden, wodurch JEDE Seite, die
  // die Datenbank nutzt, mit „Internal Server Error" abstürzte – die ganze
  // Website war tot, obwohl die Datenbank lief.
  outputFileTracingIncludes: {
    "/**/*": [
      "./node_modules/.prisma/client/**/*",
      "./node_modules/@prisma/client/**/*",
      // Nicht gebündelte Pakete VOLLSTÄNDIG mitkopieren. Beim Ausfall
      // 14.–17.09.2026 lag von `lru-cache` nur eine unvollständige Kopie im
      // Paket (package.json ohne index.js) – der Datenbanktreiber ließ sich
      // nicht laden und jede datenbanknutzende Seite warf 500.
      "./node_modules/lru-cache/**/*",
      "./node_modules/mariadb/**/*",
      "./node_modules/@prisma/adapter-mariadb/**/*",
      "./node_modules/denque/**/*",
      "./node_modules/iconv-lite/**/*",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
