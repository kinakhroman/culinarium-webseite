import Link from "next/link";
import { ChefHat, Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="h-7 w-7 text-secondary" />
              <span className="font-heading text-xl font-bold text-white">
                Culinarium
              </span>
            </div>
            <p className="text-sm text-neutral-400 mb-4">
              Frisch, regional und mit Liebe zubereitet. Ihr Partner für
              erstklassige Kantinenküche in Berlin-Biesdorf.
            </p>
            <div className="flex gap-3">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800 rounded-full hover:bg-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800 rounded-full hover:bg-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-4">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/speisekarte" className="hover:text-secondary transition-colors">Speisekarte</Link></li>
              <li><Link href="/tagesangebot" className="hover:text-secondary transition-colors">Tagesangebot</Link></li>
              <li><Link href="/wochenplan" className="hover:text-secondary transition-colors">Wochenplan</Link></li>
              <li><Link href="/bestellen" className="hover:text-secondary transition-colors">Online bestellen</Link></li>
              <li><Link href="/ueber-uns" className="hover:text-secondary transition-colors">Über uns</Link></li>
              <li><Link href="/bewertungen" className="hover:text-secondary transition-colors">Bewertungen</Link></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-4">
              Kontakt
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                <span>Biesenhorster Weg 1<br />12683 Berlin</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary shrink-0" />
                <span>030 1234567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary shrink-0" />
                <span>info@culinarium-biesenhorst.de</span>
              </li>
            </ul>
          </div>

          {/* Öffnungszeiten */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-4">
              Öffnungszeiten
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li className="flex justify-between">
                <span>Mo – Fr</span>
                <span className="text-secondary">08:00 – 16:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sa – So</span>
                <span className="text-neutral-500">Geschlossen</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Culinarium am Biesenhorst. Alle Rechte vorbehalten.</p>
          <div className="flex gap-4">
            <Link href="/impressum" className="hover:text-neutral-300 transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-neutral-300 transition-colors">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
