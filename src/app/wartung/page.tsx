import Image from "next/image";
import { Phone, Mail, MapPin, Instagram, Facebook, Clock } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";

export const metadata = {
  title: "Culinarium am Biesenhorst – Wir kommen bald zurück!",
  description: "Unsere Webseite wird gerade überarbeitet. Wir sind bald mit einem frischen Look zurück.",
};

export default function WartungPage() {
  return (
    <div className="min-h-screen bg-neutral-900 relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/30 via-transparent to-primary/20" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-lg mx-auto px-6 py-16 text-center">
        {/* Logo */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-pulse-soft" />
          <Image
            src="/images/logo-icon.png"
            alt="Culinarium am Biesenhorst"
            fill
            className="object-contain relative drop-shadow-2xl"
            priority
          />
        </div>

        {/* Brand */}
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
          Culinarium
        </h1>
        <p className="text-secondary text-sm uppercase tracking-[0.25em] font-medium mb-10">
          am Biesenhorst
        </p>

        {/* Divider */}
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent mx-auto mb-10" />

        {/* Message */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-2xl mb-5">
            <Clock className="h-7 w-7 text-secondary" />
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mb-3">
            Wir arbeiten an etwas Neuem!
          </h2>
          <p className="text-neutral-400 leading-relaxed">
            Unsere Webseite wird gerade überarbeitet und kommt bald mit einem frischen,
            modernen Look zurück. In der Zwischenzeit erreichen Sie uns wie gewohnt
            telefonisch oder vor Ort.
          </p>
        </div>

        {/* Contact info */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center justify-center gap-3 text-neutral-300">
            <div className="p-2 bg-white/5 rounded-xl">
              <MapPin className="h-4 w-4 text-secondary" />
            </div>
            <span className="text-sm">Am alten Flugplatz 100, 10318 Berlin</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-neutral-300">
            <div className="p-2 bg-white/5 rounded-xl">
              <Phone className="h-4 w-4 text-secondary" />
            </div>
            <span className="text-sm">030 56553364</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-neutral-300">
            <div className="p-2 bg-white/5 rounded-xl">
              <Mail className="h-4 w-4 text-secondary" />
            </div>
            <span className="text-sm">culinariumambiesenhorst@gmail.com</span>
          </div>
        </div>

        {/* Öffnungszeiten */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 mb-10 inline-block">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3 font-medium">Öffnungszeiten</p>
          <p className="text-neutral-300 text-sm">
            Mo – Fr: <span className="text-secondary font-semibold">06:00 – 14:00</span>
          </p>
          <p className="text-neutral-500 text-sm">Sa – So: Geschlossen</p>
        </div>

        {/* Social */}
        <div className="flex justify-center gap-4">
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-3 bg-white/5 rounded-xl hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 transition-all duration-300 border border-white/5"
          >
            <Instagram className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" />
          </a>
          <a
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-3 bg-white/5 rounded-xl hover:bg-blue-600 transition-all duration-300 border border-white/5"
          >
            <Facebook className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-neutral-600 text-xs mt-12">
          &copy; {new Date().getFullYear()} Culinarium am Biesenhorst
        </p>
      </div>
    </div>
  );
}
