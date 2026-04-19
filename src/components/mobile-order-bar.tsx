"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, ArrowRight } from "lucide-react";

interface Props {
  hint?: string;
}

export function MobileOrderBar({ hint = "Täglich frisch · ab 6,90 €" }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="mx-3 mb-3 rounded-2xl bg-neutral-900/95 backdrop-blur-xl shadow-2xl shadow-black/30 border border-white/10 overflow-hidden">
        <Link
          href="/bestellen"
          className="flex items-center gap-3 p-3.5 group active:scale-[0.98] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/30">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm leading-tight">
              Jetzt bestellen
            </div>
            <div className="text-white/50 text-xs truncate">{hint}</div>
          </div>

          <div className="flex items-center gap-1.5 text-secondary-light font-semibold text-sm pr-1">
            Los
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
