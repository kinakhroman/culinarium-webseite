import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <Image
            src="/images/logo-emblem.png"
            alt="Culinarium am Biesenhorst"
            width={48}
            height={48}
            className="w-11 h-11 object-contain"
          />
          <div>
            <span className="font-heading text-2xl font-bold text-primary block leading-tight">
              Culinarium
            </span>
            <span className="text-[11px] text-neutral-400 font-medium tracking-[0.04em] uppercase pl-[2px]">
              Berlin.de
            </span>
          </div>
        </Link>
        {children}
      </div>
    </div>
  );
}
