import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Phone, ArrowLeft, ArrowRight, Coffee, Flame, UtensilsCrossed, CupSoda } from "lucide-react";

const PHONE_DISPLAY = "030 56553364";
const PHONE_TEL = "+493056553364";

export const metadata: Metadata = {
  title: {
    absolute: "Speisekarte Baustellen-Catering | Culinarium am Bau",
  },
  description:
    "Die komplette Auswahl für die Baustelle: Frühstück, Snacks & Fastfood, warme Mittagsküche wie in der Kantine und Getränke – deftig, schnell und preiswert geliefert.",
};

type Item = { name: string; price: string; img: string; tag?: string };
type Group = { id: string; label: string; title: string; sub: string; icon: typeof Coffee; items: Item[] };

const GROUPS: Group[] = [
  {
    id: "fruehstueck",
    label: "Frühstück & Kaffee",
    title: "Guter Start in den Tag",
    sub: "Damit auf der Baustelle keiner mit leerem Magen anfangen muss.",
    icon: Coffee,
    items: [
      { name: "Caffè to go „Aroma Crema“", price: "2,00 €", img: "/images/catering/kaffee-to-go.png" },
      { name: "Belegtes Brötchen", price: "1,50 €", img: "/images/catering/belegtes-broetchen.png" },
      { name: "Bauernfrühstück", price: "5,00 €", img: "/images/catering/bauernfruehstueck.png" },
    ],
  },
  {
    id: "snacks",
    label: "Snacks & Fastfood",
    title: "Deftig, schnell & preiswert",
    sub: "Die schnelle Stärkung für zwischendurch – direkt vom Wagen aufs Gerüst.",
    icon: Flame,
    items: [
      { name: "Bulette mit Schrippe", price: "2,50 €", img: "/images/catering/bulette.png" },
      { name: "Würstchen", price: "2,00 €", img: "/images/catering/wuerstchen.png" },
      { name: "Pommes", price: "2,50 €", img: "/images/catering/pommes.png" },
      { name: "Pommes mit Würstchen", price: "3,50 €", img: "/images/catering/pommes-wuerstchen.png" },
      { name: "Currywurst", price: "3,00 €", img: "/images/catering/currywurst.png" },
      { name: "Currywurst mit Pommes", price: "4,00 €", img: "/images/catering/currywurst-pommes.png" },
      { name: "Burger", price: "5,00 €", img: "/images/catering/burger.png" },
    ],
  },
  {
    id: "warm",
    label: "Warme Mittagsküche",
    title: "Wie in der Kantine – 6,00 €",
    sub: "Vollwertige, täglich wechselnde Gerichte, warm auf die Baustelle geliefert. Auswahl je nach Tageskarte.",
    icon: UtensilsCrossed,
    items: [
      { name: "Wiener Schnitzel mit Pommes", price: "6,00 €", img: "/images/catering/schnitzel.png" },
      { name: "Gulasch mit Kartoffeln", price: "6,00 €", img: "/images/catering/gulasch.png" },
      { name: "Königsberger Klopse", price: "6,00 €", img: "/images/catering/klopse.png" },
      { name: "Frikadellen mit Kartoffelsalat", price: "6,00 €", img: "/images/menu/frikadellen-mit-kartoffelsalat.png" },
      { name: "Bratwurst mit Sauerkraut", price: "6,00 €", img: "/images/menu/bratwurst-mit-sauerkraut.png" },
      { name: "Spaghetti Bolognese", price: "6,00 €", img: "/images/menu/spaghetti-bolognese.png" },
      { name: "Gemüse-Curry mit Reis", price: "6,00 €", img: "/images/menu/gemuese-curry.png", tag: "vegetarisch" },
      { name: "Soljanka (Teller)", price: "4,50 €", img: "/images/menu/soljanka.png" },
    ],
  },
  {
    id: "getraenke",
    label: "Getränke",
    title: "Was zum Runterspülen",
    sub: "Kalt und gut gekühlt – passend zum Essen mitbestellt.",
    icon: CupSoda,
    items: [
      { name: "Softdrink (Cola / Fanta)", price: "1,50 €", img: "/images/catering/softdrink.png" },
      { name: "Apfelschorle", price: "1,50 €", img: "/images/menu/apfelschorle.png" },
      { name: "Mineralwasser", price: "1,00 €", img: "/images/menu/mineralwasser.png" },
      { name: "Kaffee", price: "2,00 €", img: "/images/menu/kaffee.png" },
    ],
  },
];

export default function CateringSpeisekartePage() {
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
            <Link
              href="/baustellen-catering#anfrage"
              className="rounded-full bg-paprika hover:bg-paprika-dark px-4 sm:px-5 py-2.5 text-sm font-bold text-paper transition-colors whitespace-nowrap"
            >
              <span className="sm:hidden">Anfragen</span>
              <span className="hidden sm:inline">Bedarf anfragen</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Intro ===== */}
      <section className="border-b border-ink/8 bg-paper-deep/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Link
            href="/baustellen-catering"
            className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-paprika transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Baustellen-Catering
          </Link>
          <span className="mt-6 block text-xs font-bold uppercase tracking-[0.15em] text-paprika">
            Speisekarte
          </span>
          <h1 className="font-display mt-3 text-4xl sm:text-5xl font-semibold leading-tight">
            Die ganze Auswahl für die Baustelle
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Von Kaffee &amp; Brötchen morgens über Currywurst &amp; Burger mittags bis zur
            warmen Kantinenküche – alles frisch zubereitet und direkt zu euch geliefert.
          </p>

          {/* Sprungmarken */}
          <nav className="mt-7 flex flex-wrap gap-2">
            {GROUPS.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-4 py-2 text-sm font-bold text-ink/80 hover:border-paprika hover:text-paprika transition-colors"
              >
                <Icon className="h-4 w-4 text-paprika" />
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ===== Kategorien ===== */}
      {GROUPS.map(({ id, label, title, sub, icon: Icon, items }) => (
        <section key={id} id={id} className="scroll-mt-20 py-14 sm:py-20 odd:bg-paper even:bg-paper-deep/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paprika/10">
                <Icon className="h-6 w-6 text-paprika" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-paprika">
                  {label}
                </span>
                <h2 className="font-display mt-2 text-3xl sm:text-4xl font-semibold">{title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-ink-soft">{sub}</p>
              </div>
            </div>

            <div className="mt-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {items.map(({ name, price, img, tag }) => (
                <div
                  key={name}
                  className="group rounded-2xl bg-paper border border-ink/8 overflow-hidden hover:border-paprika hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10 transition-all"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={img}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2 right-2 font-display text-base font-semibold text-paper bg-paprika px-2.5 py-0.5 rounded-lg shadow-md">
                      {price}
                    </span>
                    {tag && (
                      <span className="absolute top-2 left-2 rounded-md bg-accent/90 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-paper shadow">
                        {tag}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-ink leading-snug">{name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ===== Abschluss-CTA ===== */}
      <section className="py-16 sm:py-20 bg-brand text-paper">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">
            Hunger gemacht? Dann holen wir euch ab.
          </h2>
          <p className="mt-4 text-lg text-paper/80">
            Sagt uns, wie viele ihr seid und wo gebaut wird – wir machen euch ein faires
            Angebot mit Sammelbestellung und Sammelrechnung.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/baustellen-catering#anfrage"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-7 py-3.5 text-base font-bold text-ink hover:brightness-105 transition"
            >
              Bedarf anfragen
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href={`tel:${PHONE_TEL}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-paper/30 px-7 py-3.5 text-base font-bold text-paper hover:bg-paper/10 transition"
            >
              <Phone className="h-5 w-5" />
              {PHONE_DISPLAY}
            </a>
          </div>
          <p className="mt-6 text-xs text-paper/60">
            Richtpreise inkl. MwSt. – finale Preise, Mengen &amp; Mengenrabatte stimmen wir
            individuell mit euch ab.
          </p>
        </div>
      </section>
    </div>
  );
}
