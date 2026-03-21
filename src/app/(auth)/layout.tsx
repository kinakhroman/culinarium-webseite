import { ChefHat } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <ChefHat className="h-10 w-10 text-primary" />
          <div className="text-center">
            <span className="font-heading text-2xl font-bold text-primary block">
              Culinarium
            </span>
            <span className="text-xs text-neutral-500">am Biesenhorst</span>
          </div>
        </Link>
        {children}
      </div>
    </div>
  );
}
