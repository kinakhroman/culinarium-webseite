import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mariadb nicht bündeln (sonst bricht die UTF-8/Umlaut-Dekodierung);
  // sharp nicht bündeln (natives Modul – gebündelt schlägt import("sharp") auf
  // dem Server fehl und Gericht-Fotos werden als rohe 2-MB-PNGs gespeichert)
  serverExternalPackages: ["mariadb", "sharp"],
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
