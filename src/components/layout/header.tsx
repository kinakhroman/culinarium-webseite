"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, User, LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-neutral-100"
          : "bg-white/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <Image
              src="/images/logo-emblem.png"
              alt="Culinarium am Biesenhorst"
              width={48}
              height={48}
              priority
              className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-heading text-xl md:text-2xl font-bold text-primary leading-tight tracking-tight">
                Culinarium
              </span>
              <span className="text-[10px] md:text-xs text-neutral-400 font-medium tracking-widest uppercase -mt-0.5">
                Berlin.de
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3.5 py-2 text-sm font-medium text-neutral-500 hover:text-primary transition-colors duration-300 rounded-lg hover:bg-primary/5 group"
              >
                {item.label}
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-3/4" />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/bestellen"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 shine"
            >
              <ShoppingCart className="h-4 w-4" />
              Bestellen
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-1">
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 text-sm font-medium text-neutral-500 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/konto"
                  className="p-2.5 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-primary border border-primary/30 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
              >
                Anmelden
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 text-neutral-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-500 ease-in-out ${
          mobileOpen
            ? "max-h-[85vh] opacity-100 overflow-y-auto"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-neutral-100">
          <div className="px-4 py-5 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-base font-medium text-neutral-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-neutral-100 space-y-2">
              <Link
                href="/bestellen"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary to-primary-light text-white px-5 py-3.5 rounded-2xl font-semibold shadow-lg shadow-primary/20"
              >
                <ShoppingCart className="h-4 w-4" />
                Jetzt bestellen
              </Link>
              {session?.user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 rounded-xl">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-400 leading-tight">Angemeldet als</p>
                      <p className="text-sm font-semibold text-neutral-800 truncate">
                        {session.user.name || session.user.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/konto"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center px-3 py-3 text-neutral-600 hover:text-primary rounded-xl transition-all"
                  >
                    Mein Konto
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block text-center px-3 py-3 text-neutral-600 hover:text-primary rounded-xl transition-all"
                    >
                      Admin-Bereich
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-red-600 border border-red-200 rounded-2xl font-medium hover:bg-red-50 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center px-4 py-3 text-primary border border-primary/30 rounded-2xl font-medium hover:bg-primary/5 transition-all"
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="/registrierung"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center px-4 py-3 bg-primary/10 text-primary rounded-2xl font-medium hover:bg-primary/15 transition-all"
                  >
                    Registrieren
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
