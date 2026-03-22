import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// ============================================
// WARTUNGSMODUS: auf true setzen um die Seite
// offline zu nehmen. Auf false für Normalbetrieb.
// ============================================
const MAINTENANCE_MODE = true;

const authMiddleware = NextAuth(authConfig).auth;

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Wartungsmodus: alle Seiten zur Wartungsseite umleiten
  if (MAINTENANCE_MODE) {
    // Diese Pfade nicht umleiten (Wartungsseite selbst, Assets, API)
    if (
      pathname === "/wartung" ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/images") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/favicon")
    ) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL("/wartung", request.url));
  }

  // Normaler Auth-Schutz für geschützte Routen
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/konto") ||
    pathname.startsWith("/kasse")
  ) {
    return (authMiddleware as any)(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
