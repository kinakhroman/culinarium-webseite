"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderOpen,
  ShoppingBag,
  Star as StarIcon,
  Sparkles,
  Calendar,
  Settings,
  ChefHat,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Bestellungen", href: "/admin/bestellungen", icon: ShoppingBag },
  { label: "Speisekarte", href: "/admin/speisekarte", icon: UtensilsCrossed },
  { label: "Kategorien", href: "/admin/kategorien", icon: FolderOpen },
  { label: "Tagesangebot", href: "/admin/tagesangebot", icon: Sparkles },
  { label: "Wochenplan", href: "/admin/wochenplan", icon: Calendar },
  { label: "Bewertungen", href: "/admin/bewertungen", icon: StarIcon },
  { label: "Einstellungen", href: "/admin/einstellungen", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Zugriff verweigert</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-neutral-200">
        <div className="p-6 border-b border-neutral-100">
          <Link href="/admin" className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            <div>
              <span className="font-heading text-lg font-bold text-primary block leading-tight">
                Culinarium
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                Admin
              </span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-neutral-100">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Zur Webseite
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-primary">Admin</span>
          </Link>
          <Link href="/" className="text-sm text-neutral-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </header>

        {/* Mobile Nav */}
        <nav className="lg:hidden bg-white border-b border-neutral-200 px-4 py-2 flex gap-2 overflow-x-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap",
                  isActive ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
