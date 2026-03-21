"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, ShoppingCart, User, LogOut, ChefHat } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <ChefHat className="h-8 w-8 text-primary" />
            <div>
              <span className="font-heading text-xl md:text-2xl font-bold text-primary">
                Culinarium
              </span>
              <span className="hidden sm:block text-xs text-neutral-500 -mt-1">
                am Biesenhorst
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary transition-colors rounded-md hover:bg-warm-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/bestellen"
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              Bestellen
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-2">
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/konto"
                  className="p-2 text-neutral-600 hover:text-primary"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-neutral-400 hover:text-red-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                Anmelden
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-neutral-600"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white">
          <div className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-base font-medium text-neutral-700 hover:text-primary hover:bg-warm-100 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-neutral-100 space-y-2">
              <Link
                href="/bestellen"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-primary text-white px-5 py-3 rounded-full font-semibold"
              >
                <ShoppingCart className="h-4 w-4" />
                Jetzt bestellen
              </Link>
              {session?.user ? (
                <>
                  <Link
                    href="/konto"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center px-3 py-2.5 text-neutral-600 hover:text-primary"
                  >
                    Mein Konto
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block text-center px-3 py-2.5 text-neutral-600 hover:text-primary"
                    >
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-2.5 text-primary border border-primary rounded-full font-medium"
                >
                  Anmelden
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
