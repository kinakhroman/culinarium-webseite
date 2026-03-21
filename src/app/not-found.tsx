import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <ChefHat className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
        <h1 className="font-heading text-4xl font-bold text-neutral-800 mb-2">404</h1>
        <p className="text-neutral-500 mb-6">Diese Seite wurde nicht gefunden.</p>
        <Link
          href="/"
          className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
