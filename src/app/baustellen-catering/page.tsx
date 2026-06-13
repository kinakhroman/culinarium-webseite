import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  MessageCircle,
  ArrowRight,
  ClipboardList,
  ChefHat,
  Truck,
  ReceiptText,
  Clock,
  MapPin,
  Leaf,
  Building2,
  Users,
  UtensilsCrossed,
  Star,
  Package,
  Wallet,
} from "lucide-react";
import { CateringInquiryForm } from "@/components/catering/inquiry-form";

// ---- Kontaktdaten (bei Bedarf anpassen) ----
const PHONE_DISPLAY = "030 56553364";
const PHONE_TEL = "+493056553364";
const EMAIL = "info@culinarium-berlin.de";
// WhatsApp-Mobilnummer (ohne + und ohne führende 0, im wa.me-Format)
const WHATSAPP = "4915208701105";
const WHATSAPP_TEXT = encodeURIComponent(
  "Hallo Culinarium, wir interessieren uns für die Baustellen-Belieferung."
);

export const metadata: Metadata = {
  title: {
    absolute: "Baustellen-Catering Berlin & Brandenburg | Culinarium am Bau",
  },
  description:
    "Culinarium liefert warmes Mittagessen direkt auf Ihre Baustelle: frisch gekocht, vorbestellt, pünktlich geliefert. Bulette, Bratwurst & wechselnde Gerichte – Sammelbestellung & Sammelrechnung für Bauunternehmen im Raum Berlin/Brandenburg.",
  openGraph: {
    title: "Baustellen-Catering Berlin & Brandenburg | Culinarium am Bau",
    description:
      "Warmes Mittagessen direkt auf Ihre Baustelle – frisch gekocht, pünktlich geliefert.",
    type: "website",
    locale: "de_DE",
  },
};

export default function BaustellenCateringPage() {
  return (
    <div className="font-body bg-paper text-ink antialiased selection:bg-paprika selection:text-paper">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,400..900;1,400..700&family=Hanken+Grotesk:wght@400..800&display=swap"
      />

      {/* ===== Header ===== */}
      <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur-md border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo identisch zur Hauptseite (kein Sprung beim Wechsel) – nur Subtitle "am Bau" */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/logo-emblem.png"
              alt="Culinarium am Bau"
              width={48}
              height={48}
              className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-heading text-xl md:text-2xl font-bold text-primary leading-tight tracking-tight">
                Culinarium
              </span>
              <span className="text-[10px] md:text-xs text-neutral-400 font-medium tracking-[0.04em] uppercase -mt-0.5 pl-[2px]">
                am Bau
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={`tel:${PHONE_TEL}`}
              className="hidden sm:flex items-center gap-2 text-sm font-bold text-ink/80 hover:text-paprika transition-colors"
            >
              <Phone className="h-4 w-4 text-paprika" />
              {PHONE_DISPLAY}
            </a>
            <a
              href="#anfrage"
              className="rounded-full bg-paprika hover:bg-paprika-dark px-4 sm:px-5 py-2.5 text-sm font-bold text-paper transition-colors whitespace-nowrap"
            >
              <span className="sm:hidden">Anfragen</span>
              <span className="hidden sm:inline">Bedarf anfragen</span>
            </a>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative">
        <div className="relative h-[88vh] min-h-[560px] max-h-[820px] w-full overflow-hidden">
          <Image
            src="/images/catering/hero.png"
            alt="Bauarbeiter genießen frische Bulette und Bratwurst am Food-Anhänger auf der Baustelle"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105"
          />
          {/* Warmer Verlauf für Lesbarkeit */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12 sm:pb-16">
              <div className="max-w-2xl">
                <span
                  className="inline-flex items-center gap-2 rounded-full bg-paper/15 backdrop-blur-sm border border-paper/25 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-paper animate-fade-in-down"
                  style={{ animationDelay: "0.05s" }}
                >
                  <UtensilsCrossed className="h-4 w-4 text-ember" />
                  Warmküche für Baustellen · Berlin & Brandenburg
                </span>

                <h1
                  className="font-display mt-5 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl font-semibold text-paper animate-fade-in-up"
                  style={{ animationDelay: "0.12s" }}
                >
                  Warmes Essen,
                  <br />
                  <span className="text-ember italic">direkt auf die Baustelle.</span>
                </h1>

                <p
                  className="mt-5 text-lg sm:text-xl text-paper/85 leading-relaxed max-w-xl animate-fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  Wir kochen morgens in unserer Berliner Großküche und bringen
                  das Mittagessen warm zu Ihnen aufs Gelände. Einmal am Vortag
                  bestellen – um den Rest kümmern wir uns. Auch da, wo weit und
                  breit kein Imbiss ist.
                </p>

                <div
                  className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up"
                  style={{ animationDelay: "0.28s" }}
                >
                  <a
                    href="#anfrage"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-paprika hover:bg-paprika-dark px-7 py-4 text-base font-bold text-paper transition-all active:scale-[0.99] shadow-xl shadow-ink/30"
                  >
                    Jetzt Bedarf anfragen
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href="#ablauf"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-paper/40 hover:bg-paper/10 px-7 py-4 text-base font-bold text-paper transition-colors"
                  >
                    So funktioniert&apos;s
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust-Band */}
        <div className="bg-brand text-paper">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
            {[
              { icon: Truck, label: "Lieferung bis vor Ort" },
              { icon: Clock, label: "Vorbestellung bis 16 Uhr" },
              { icon: ReceiptText, label: "Eine Sammelrechnung" },
              { icon: Leaf, label: "Immer veg. Option" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="h-5 w-5 text-ember shrink-0" />
                <span className="text-sm font-semibold text-paper/90">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Problem / Lösung ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-paprika">
                Das kennen Sie
              </span>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.08]">
                Mittagspause auf der Baustelle? Meistens{" "}
                <span className="text-paprika">kalt und kompliziert.</span>
              </h2>
              <div className="mt-7 space-y-4">
                {[
                  {
                    bad: "Kein Imbiss, kein Bäcker, kein Supermarkt in der Nähe.",
                    good: "Wir liefern warmes Essen direkt bis ans Baustellentor.",
                  },
                  {
                    bad: "Lange Wege in der Pause kosten Zeit und Nerven.",
                    good: "Feste Lieferzeit – Sie machen weiter, das Essen kommt.",
                  },
                  {
                    bad: "Jeder organisiert sich selbst, kalte Stullen, mäßige Laune.",
                    good: "Ein Polier bestellt für alle – frisch, warm, deftig.",
                  },
                ].map(({ bad, good }) => (
                  <div
                    key={bad}
                    className="rounded-2xl bg-paper-deep/60 border border-ink/5 p-5"
                  >
                    <p className="text-ink-soft line-through decoration-paprika/40 decoration-2">
                      {bad}
                    </p>
                    <p className="mt-1.5 font-semibold text-ink flex gap-2">
                      <span className="text-paprika">→</span>
                      {good}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl shadow-ink/20 rotate-1">
                <Image
                  src="/images/catering/bauarbeiter.png"
                  alt="Zufriedener Bauarbeiter mit warmem Mittagessen auf der Baustelle"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              {/* Sticker */}
              <div className="absolute -bottom-5 -left-3 sm:-left-6 rotate-[-4deg] bg-ember text-ink rounded-2xl px-5 py-3 shadow-xl">
                <div className="font-display text-2xl font-semibold leading-none">
                  „Endlich warm!"
                </div>
                <div className="text-xs font-bold mt-1 uppercase tracking-wide">
                  — die Kolonne
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== So funktioniert's ===== */}
      <section
        id="ablauf"
        className="relative py-16 sm:py-24 bg-brand text-paper overflow-hidden"
      >
        {/* Atmosphäre */}
        <div
          className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-ember/15 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
          aria-hidden
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-ember">
              So läuft's
            </span>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.08]">
              In vier Schritten satt
            </h2>
            <p className="mt-4 text-paper/75 text-lg">
              Sie bestellen einmal. Ums Kochen, Fahren und Pünktlichsein kümmern
              wir uns.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: ClipboardList,
                title: "Vorbestellen",
                text: "Bis 16:00 Uhr für den nächsten Tag – per Anruf, WhatsApp oder online.",
              },
              {
                icon: ChefHat,
                title: "Frisch gekocht",
                text: "Morgens in unserer Großküche – genau die bestellte Menge, nichts wird verschwendet.",
              },
              {
                icon: Truck,
                title: "Pünktlich geliefert",
                text: "Warm und zur festen Zeit direkt an Ihre Baustelle, bis ans Tor.",
              },
              {
                icon: ReceiptText,
                title: "Einfach abrechnen",
                text: "Pro Essen, als Sammelrechnung an die Firma oder als Mittagessen-Abo.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className="group relative rounded-3xl bg-gradient-to-b from-paper/[0.09] to-paper/[0.02] border border-paper/10 p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-ember/40 hover:from-paper/[0.13]"
              >
                <div className="flex items-center justify-between">
                  <div className="h-14 w-14 rounded-2xl bg-ember text-ink flex items-center justify-center shadow-lg shadow-ember/20 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-display text-7xl font-semibold text-paper/10 leading-none select-none">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display mt-6 text-xl font-semibold text-paper">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-paper/65 leading-relaxed">{text}</p>
                <span className="mt-5 block h-1 w-10 rounded-full bg-ember/50 transition-all duration-300 group-hover:w-20 group-hover:bg-ember" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Food-Sektion ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[5/4] rounded-[2rem] overflow-hidden shadow-2xl shadow-ink/20 -rotate-1">
                <Image
                  src="/images/catering/essen.png"
                  alt="Frische Bulette, Bratwurst und Pommes – dampfend serviert"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-paprika">
                Was auf den Teller kommt
              </span>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.08]">
                Deftig, ehrlich, richtig satt machend.
              </h2>
              <p className="mt-5 text-lg text-ink-soft leading-relaxed">
                Bulette, Bratwurst, Gulasch, Schnitzel – dazu Eintöpfe und immer
                eine vegetarische Option. Klassische Hausmannskost, frisch
                gekocht, in Mengen, die einen Arbeitstag durchtragen.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Wechselnder Wochenplan – nie zweimal dasselbe.",
                  "Große, sättigende Portionen für körperliche Arbeit.",
                  "Vegetarisch, halal oder ohne Schwein auf Wunsch.",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-ink">
                    <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-paprika shrink-0" />
                    <span className="font-medium">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Beispiel-Wochenmenü ===== */}
      <section className="py-16 sm:py-24 bg-paper-deep/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-paprika">
                Beispiel-Wochenmenü
              </span>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl font-semibold">
                Eine Woche zum Reinbeißen
              </h2>
            </div>
            <p className="text-sm text-ink-soft max-w-xs">
              2–3 Gerichte zur Auswahl pro Tag. Beispiel – Ihr echtes Menü
              stimmen wir ab.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { day: "Mo", dish: "Gulasch mit Kartoffeln", veg: "Gemüse-Curry mit Reis", img: "/images/catering/gulasch.png" },
              { day: "Di", dish: "Schnitzel mit Pommes", veg: "Käsespätzle", img: "/images/catering/schnitzel.png" },
              { day: "Mi", dish: "Bulette mit Püree", veg: "Linseneintopf", img: "/images/catering/bulette.png" },
              { day: "Do", dish: "Königsberger Klopse", veg: "Gefüllte Paprika", img: "/images/catering/klopse.png" },
              { day: "Fr", dish: "Currywurst mit Pommes", veg: "Falafel-Bowl", img: "/images/catering/currywurst.png" },
            ].map(({ day, dish, veg, img }) => (
              <div
                key={day}
                className="group rounded-2xl bg-paper border border-ink/8 overflow-hidden hover:border-paprika hover:-translate-y-1 transition-all"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={img}
                    alt={dish}
                    fill
                    sizes="(max-width: 640px) 100vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 font-display text-base font-semibold text-paper bg-ink/55 backdrop-blur-sm px-2.5 py-0.5 rounded-lg">
                    {day}
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-bold text-ink leading-snug">{dish}</div>
                  <div className="mt-2.5 pt-2.5 border-t border-ink/8 flex items-start gap-1.5 text-sm text-brand">
                    <Leaf className="h-4 w-4 mt-0.5 shrink-0 text-green-700" />
                    <span>{veg}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Handwerker-Menü (preiswert) ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-paprika">
                Handwerker-Menü
              </span>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl font-semibold">
                Deftig, schnell &amp; preiswert
              </h2>
            </div>
            <p className="text-sm text-ink-soft max-w-xs">
              Die schnelle Stärkung für zwischendurch – direkt vom Wagen aufs Gerüst. Frühstück,
              Snacks &amp; Kaffee zu fairen Preisen.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: "Caffè to go „Aroma Crema“", price: "2,00 €", img: "/images/catering/kaffee-to-go.png" },
              { name: "Belegtes Brötchen", price: "1,50 €", img: "/images/catering/belegtes-broetchen.png" },
              { name: "Bulette mit Schrippe", price: "2,50 €", img: "/images/catering/bulette.png" },
              { name: "Würstchen", price: "2,00 €", img: "/images/catering/wuerstchen.png" },
              { name: "Bauernfrühstück", price: "5,00 €", img: "/images/catering/bauernfruehstueck.png" },
            ].map(({ name, price, img }) => (
              <div
                key={name}
                className="group rounded-2xl bg-paper border border-ink/8 overflow-hidden hover:border-paprika hover:-translate-y-1 transition-all"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={img}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 right-2 font-display text-base font-semibold text-paper bg-paprika px-2.5 py-0.5 rounded-lg shadow-md">
                    {price}
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-bold text-ink leading-snug">{name}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-ink-soft">
            Richtpreise inkl. MwSt. – finale Preise, Mengen &amp; Mengenrabatte stimmen wir
            individuell mit Ihnen ab.
          </p>
        </div>
      </section>

      {/* ===== Für wen ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-paprika">
              Für wen
            </span>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold">
              Gemacht für den Bau
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group rounded-[2rem] bg-gradient-to-b from-paper-deep/70 to-paper-deep/30 border border-ink/8 p-7 sm:p-9 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/10 hover:border-paprika/30">
              <div className="h-12 w-12 rounded-2xl bg-paprika/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                <Building2 className="h-6 w-6 text-paprika" />
              </div>
              <h3 className="font-display mt-5 text-2xl font-semibold">
                Bauunternehmen
              </h3>
              <ul className="mt-5 space-y-3">
                {[
                  "Eine Lieferung für mehrere Baustellen – wir koordinieren das.",
                  "Am Monatsende eine Rechnung. Kein Belegchaos.",
                  "Auf Wunsch ein festes Mittagessen-Abo zum fairen Preis.",
                  "Leute, die satt sind und nicht hungrig durch den Nachmittag müssen.",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-ink">
                    <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-paprika shrink-0" />
                    <span className="font-medium">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="group rounded-[2rem] bg-gradient-to-b from-paper-deep/70 to-paper-deep/30 border border-ink/8 p-7 sm:p-9 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/10 hover:border-paprika/30">
              <div className="h-12 w-12 rounded-2xl bg-paprika/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                <Users className="h-6 w-6 text-paprika" />
              </div>
              <h3 className="font-display mt-5 text-2xl font-semibold">
                Polier &amp; Kolonne
              </h3>
              <ul className="mt-5 space-y-3">
                {[
                  "Kein Rumtelefonieren – einer bestellt für die ganze Kolonne.",
                  "Warmes Essen, ohne in der Pause irgendwo hinzufahren.",
                  "„Wie letzte Woche“ – einmal tippen, fertig.",
                  "Immer was mit Fleisch und was Vegetarisches dabei.",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-ink">
                    <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-paprika shrink-0" />
                    <span className="font-medium">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Angebotsmodelle ===== */}
      <section className="py-16 sm:py-24 bg-paper-deep/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-paprika">
              So kommt das Essen zu euch
            </span>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold">
              Drei Wege – Sie wählen
            </h2>
            <p className="mt-4 text-lg text-ink-soft">
              Ob ganze Baustelle, einzelne Kolonne oder Büro-Team: Wir richten uns
              danach, wie bei Ihnen gearbeitet wird.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Modell 1 – Imbisswagen vor Ort (Highlight) */}
            <div className="group relative rounded-[2rem] text-paper p-7 sm:p-8 shadow-xl shadow-ink/25 lg:-mt-2 transition-all duration-300 hover:-translate-y-1.5">
              {/* Hintergrund (Verlauf + Glow) – geclippt für saubere runde Ecken */}
              <div
                className="absolute inset-0 rounded-[2rem] overflow-hidden bg-gradient-to-b from-brand to-[#371a0b]"
                aria-hidden
              >
                <div className="absolute -top-16 -right-12 h-48 w-48 rounded-full bg-ember/15 blur-3xl" />
              </div>
              {/* Badge sitzt frei über dem oberen Rand – wird nicht mehr abgeschnitten */}
              <span className="absolute -top-3 left-7 z-20 text-[10px] font-bold uppercase tracking-wider bg-ember text-ink px-3 py-1 rounded-full shadow-md shadow-ink/20">
                Top bei vielen Gewerken
              </span>
              {/* Inhalt */}
              <div className="relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-paper/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-ember" />
              </div>
              <h3 className="font-display mt-5 text-2xl font-semibold">
                Imbisswagen auf die Baustelle
              </h3>
              <p className="mt-2 text-sm text-paper/70">
                Für Bauherren &amp; große Baustellen
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-ember/15 px-3 py-1.5 text-xs font-bold text-ember">
                <Wallet className="h-4 w-4" /> Direktzahlung vor Ort
              </div>
              <ul className="mt-5 space-y-3 text-paper/90 text-sm">
                {[
                  "Wir stellen den Wagen für die vereinbarte Zeit direkt aufs Gelände.",
                  "Jeder zahlt vor Ort selbst – bar oder Karte, keine Sammelrechnung nötig.",
                  "Ideal, wenn viele Firmen gleichzeitig auf der Baustelle sind.",
                  "Sie stellen nur den Standplatz – den Rest machen wir.",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-ember shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
              </div>
            </div>

            {/* Modell 2 – Sammelbestellung & Abo */}
            <div className="group rounded-[2rem] bg-gradient-to-b from-paper to-paper-deep/40 border border-ink/8 p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/10 hover:border-paprika/30">
              <div className="h-12 w-12 rounded-2xl bg-paprika/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                <Package className="h-6 w-6 text-paprika" />
              </div>
              <h3 className="font-display mt-5 text-2xl font-semibold">
                Sammelbestellung &amp; Abo
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                Für einzelne Firmen &amp; Kolonnen
              </p>
              <ul className="mt-5 space-y-3 text-ink text-sm">
                {[
                  "Ein Polier bestellt für die Kolonne – wir liefern warm und pünktlich.",
                  "Abrechnung als Sammelrechnung: monatlich, als Paket (10/20/30 Essen) oder Abo.",
                  "Feste Konditionen, planbare Kosten für die Firma.",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-paprika shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Modell 3 – Büro-Lieferung */}
            <div className="group rounded-[2rem] bg-gradient-to-b from-paper to-paper-deep/40 border border-ink/8 p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/10 hover:border-paprika/30">
              <div className="h-12 w-12 rounded-2xl bg-paprika/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                <Building2 className="h-6 w-6 text-paprika" />
              </div>
              <h3 className="font-display mt-5 text-2xl font-semibold">
                Lieferung ins Büro
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                Für Bauleitung &amp; Büro-Teams
              </p>
              <ul className="mt-5 space-y-3 text-ink text-sm">
                {[
                  "Mittagessen direkt in den Bauleitungscontainer oder ins Büro.",
                  "Vorbestellung, feste Lieferzeit – auch für kleine Teams.",
                  "Wechselnde Gerichte, immer mit vegetarischer Option.",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-paprika shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-ink-soft">
            Nicht sicher, was zu Ihrer Baustelle passt?{" "}
            <a href="#anfrage" className="text-paprika font-semibold hover:underline">
              Fragen Sie uns – wir schlagen etwas vor.
            </a>
          </p>
        </div>
      </section>

      {/* ===== Liefergebiet + Stimme ===== */}
      <section className="py-16 sm:py-24 bg-paper-deep/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-paprika">
                Liefergebiet
              </span>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.08]">
                Berlin & Brandenburg
              </h2>
              <p className="mt-5 text-lg text-ink-soft leading-relaxed">
                Wir beliefern Baustellen im gesamten Berliner Stadtgebiet und im
                angrenzenden Brandenburg. Ihre Baustelle liegt am Rand? Fragen Sie
                einfach an – meistens lässt sich etwas einrichten.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-paper px-4 py-3 text-sm font-semibold text-ink border border-ink/8">
                <MapPin className="h-5 w-5 text-paprika" />
                Großküche: Am alten Flugplatz 100, 10318 Berlin
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-ink/20">
              <Image
                src="/images/catering/truck.png"
                alt="Der Culinarium Food-Truck auf einer Berliner Baustelle"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
              <span className="absolute bottom-5 left-5 right-5 font-display text-xl sm:text-2xl font-semibold text-paper">
                Unsere Küche kommt direkt zu Ihnen.
              </span>
            </div>
          </div>

          <figure className="mt-14 rounded-[2rem] bg-brand text-paper p-8 sm:p-12 shadow-xl shadow-ink/10 text-center max-w-3xl mx-auto">
            <div className="flex justify-center gap-1 text-ember">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <blockquote className="font-display mt-5 text-2xl sm:text-3xl font-semibold leading-snug italic">
              „Endlich warmes Essen auf der Baustelle – die Jungs sind zufrieden
              und wir sparen uns die Fahrerei."
            </blockquote>
            <figcaption className="mt-5 text-sm text-paper/70 font-semibold">
              Platzhalter – Polier, Beispiel-Baustelle
              <span className="block text-paper/40 font-normal">
                Echte Stimmen folgen nach dem Piloten.
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ===== Anfrage ===== */}
      <section id="anfrage" className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-paprika">
                Probebestellung
              </span>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.08]">
                Bedarf anfragen – wir melden uns
              </h2>
              <p className="mt-5 text-lg text-ink-soft leading-relaxed">
                Sagen Sie uns kurz, um welche Baustelle es geht und für wie viele
                Leute. Wir besprechen Mengen, Lieferzeit und Konditionen –
                kostenlos und unverbindlich.
              </p>

              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mt-8 shadow-xl shadow-ink/15">
                <Image
                  src="/images/catering/uebergabe.png"
                  alt="Übergabe des warmen Mittagessens an Bauarbeiter auf der Baustelle"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              <div className="mt-6 space-y-3">
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="group flex items-center gap-4 rounded-2xl bg-paper-deep/60 border border-ink/8 px-5 py-4 transition-all duration-300 hover:border-paprika hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/10"
                >
                  <div className="h-11 w-11 rounded-xl bg-paprika/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-paprika" />
                  </div>
                  <div>
                    <div className="text-sm text-ink-soft">Direkt anrufen</div>
                    <div className="font-bold text-ink text-lg">{PHONE_DISPLAY}</div>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${WHATSAPP}?text=${WHATSAPP_TEXT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl bg-paper-deep/60 border border-ink/8 px-5 py-4 transition-all duration-300 hover:border-paprika hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/10"
                >
                  <div className="h-11 w-11 rounded-xl bg-paprika/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-paprika" />
                  </div>
                  <div>
                    <div className="text-sm text-ink-soft">Per WhatsApp schreiben</div>
                    <div className="font-bold text-ink text-lg">Schnelle Antwort</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-brand to-[#371a0b] p-6 sm:p-8 shadow-2xl shadow-ink/25">
              <div
                className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-ember/15 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <CateringInquiryForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-ink text-paper/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div>
              <div className="font-display text-2xl font-semibold text-paper">
                Culinarium
              </div>
              <div className="text-xs font-bold tracking-[0.18em] text-ember uppercase mt-0.5">
                am Bau · Baustellen-Catering
              </div>
              <p className="mt-4 text-sm leading-relaxed">
                Echte Großküche aus Berlin. Wir kochen jeden Morgen
                frisch und bringen die warme Mittagspause dorthin, wo angepackt
                wird – direkt auf die Baustelle.
              </p>
            </div>
            <div className="text-sm space-y-2">
              <div className="font-bold text-paper">Kontakt</div>
              <p>
                Am alten Flugplatz 100
                <br />
                10318 Berlin
              </p>
              <a href={`tel:${PHONE_TEL}`} className="block hover:text-paper transition-colors">
                {PHONE_DISPLAY}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="block hover:text-paper transition-colors break-all"
              >
                {EMAIL}
              </a>
            </div>
            <div className="text-sm space-y-2">
              <div className="font-bold text-paper">Mehr</div>
              <Link href="/" className="block hover:text-paper transition-colors">
                Kantine &amp; Online-Bestellung
              </Link>
              <Link href="/impressum" className="block hover:text-paper transition-colors">
                Impressum
              </Link>
              <Link href="/datenschutz" className="block hover:text-paper transition-colors">
                Datenschutz
              </Link>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-paper/10 text-xs text-paper/50">
            © {new Date().getFullYear()} Culinarium am Bau — morgens gekocht in
            Berlin, mittags auf Ihrer Baustelle.
          </div>
        </div>
      </footer>
    </div>
  );
}
