import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Instagram, Facebook, ArrowRight } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2" />

      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo-icon.png"
                  alt="Culinarium"
                  fill
                  className="object-contain brightness-110"
                />
              </div>
              <div>
                <span className="font-heading text-xl font-bold text-white">
                  Culinarium
                </span>
                <span className="block text-[10px] text-neutral-500 uppercase tracking-widest -mt-0.5">
                  am Biesenhorst
                </span>
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              Frisch, regional und mit Liebe zubereitet. Ihr Partner für
              erstklassige Kantinenküche in Berlin.
            </p>
            <div className="flex gap-3">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 bg-neutral-800/80 rounded-xl hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 transition-all duration-300"
              >
                <Instagram className="h-5 w-5 group-hover:text-white transition-colors" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 bg-neutral-800/80 rounded-xl hover:bg-blue-600 transition-all duration-300"
              >
                <Facebook className="h-5 w-5 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading text-base font-semibold text-white mb-5 tracking-wide">
              Navigation
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/speisekarte", label: "Speisekarte" },
                { href: "/tagesangebot", label: "Tagesangebot" },
                { href: "/wochenplan", label: "Wochenplan" },
                { href: "/bestellen", label: "Online bestellen" },
                { href: "/ueber-uns", label: "Über uns" },
                { href: "/bewertungen", label: "Bewertungen" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-neutral-400 hover:text-secondary transition-colors duration-300"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="font-heading text-base font-semibold text-white mb-5 tracking-wide">
              Kontakt
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <div className="p-1.5 bg-neutral-800/80 rounded-lg mt-0.5">
                  <MapPin className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-neutral-400 leading-relaxed">
                  Am alten Flugplatz 100<br />10318 Berlin
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1.5 bg-neutral-800/80 rounded-lg">
                  <Phone className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-neutral-400">030 56553364</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1.5 bg-neutral-800/80 rounded-lg">
                  <Mail className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-neutral-400 text-xs">info@culinarium-berlin.de</span>
              </li>
            </ul>
          </div>

          {/* Öffnungszeiten */}
          <div>
            <h3 className="font-heading text-base font-semibold text-white mb-5 tracking-wide">
              Öffnungszeiten
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-neutral-800/40 rounded-xl">
                <span className="text-neutral-400">Mo – Fr</span>
                <span className="text-secondary font-semibold">06:00 – 14:00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-800/40 rounded-xl">
                <span className="text-neutral-400">Sa – So</span>
                <span className="text-neutral-600">Geschlossen</span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/bestellen"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-5 py-2.5 rounded-full hover:bg-primary/20 transition-colors"
              >
                Jetzt bestellen
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Culinarium am Biesenhorst. Alle Rechte vorbehalten.</p>
          <div className="flex gap-6">
            <Link href="/impressum" className="hover:text-neutral-300 transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-neutral-300 transition-colors">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
