"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, ShoppingBag, Settings, ArrowRight } from "lucide-react";

export default function KontoPage() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-8">
        Mein Konto
      </h1>

      <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-neutral-800 text-lg">{session.user.name}</h2>
            <p className="text-neutral-500">{session.user.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/konto/bestellungen"
          className="flex items-center justify-between bg-white rounded-xl border border-neutral-100 p-5 hover:bg-warm-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium text-neutral-800 block">Meine Bestellungen</span>
              <span className="text-sm text-neutral-500">Bestellhistorie einsehen</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-neutral-400" />
        </Link>
        <Link
          href="/konto/einstellungen"
          className="flex items-center justify-between bg-white rounded-xl border border-neutral-100 p-5 hover:bg-warm-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium text-neutral-800 block">Einstellungen</span>
              <span className="text-sm text-neutral-500">Profil und Adresse bearbeiten</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-neutral-400" />
        </Link>
      </div>
    </div>
  );
}
