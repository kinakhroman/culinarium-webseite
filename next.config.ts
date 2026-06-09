import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mariadb nicht bündeln (sonst bricht die UTF-8/Umlaut-Dekodierung)
  serverExternalPackages: ["mariadb"],
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
