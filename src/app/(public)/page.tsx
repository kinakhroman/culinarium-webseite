import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { menuImage } from "@/lib/menu-db";

export const dynamic = "force-dynamic";
import { formatCurrency } from "@/lib/utils";
import { getInstagramPosts } from "@/lib/instagram";
import { InstagramFeed } from "@/components/instagram-feed";
import {
  ChefHat,
  Clock,
  Truck,
  Leaf,
  Star,
  ArrowRight,
  ShoppingCart,
  UtensilsCrossed,
  Heart,
  MapPin,
  Sparkles,
  Quote,
} from "lucide-react";

async function getFeaturedItems() {
  try {
    return await db.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: true },
      take: 6,
      orderBy: { sortOrder: "asc" },
    });
  } catch { return []; }
}

async function getDailySpecials() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await db.dailySpecial.findMany({
      where: { date: today, isActive: true },
      include: { menuItem: { include: { category: true } } },
    });
  } catch { return []; }
}

async function getReviews() {
  try {
    return await db.review.findMany({
      where: { isVisible: true },
      include: { user: { select: { name: true } } },
      take: 3,
      orderBy: { createdAt: "desc" },
    });
  } catch { return []; }
}

async function getReviewStats() {
  try {
    const agg = await db.review.aggregate({
      where: { isVisible: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    return {
      count: agg._count._all ?? 0,
      avg: agg._avg.rating ?? 0,
    };
  } catch { return { count: 0, avg: 0 }; }
}

function getOpenStatus() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const OPEN = 6 * 60;
  const CLOSE = 14 * 60;
  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && minutes >= OPEN && minutes < CLOSE;
  const closesSoon = isOpen && CLOSE - minutes <= 60;
  return { isOpen, closesSoon };
}

export default async function HomePage() {
  const [featuredItems, dailySpecials, reviews, reviewStats, instagramPosts] = await Promise.all([
    getFeaturedItems(),
    getDailySpecials(),
    getReviews(),
    getReviewStats(),
    getInstagramPosts(8),
  ]);
  const { isOpen, closesSoon } = getOpenStatus();

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-neutral-900">
        {/* Header-Foto */}
        <Image
          src="/images/menu/hero-dark.png"
          alt="Frisch gekochtes Mittagessen im Culinarium am Biesenhorst"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        {/* Lesbarkeits-Verläufe – heller gehalten, Foto kommt mehr durch */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 via-neutral-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-transparent to-neutral-900/20" />
        <div className="absolute inset-0 bg-mesh opacity-10" />

        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-48 -left-24 w-[500px] h-[500px] bg-primary-light/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-2xl" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text Content */}
            <div className="animate-fade-in-up">
              <div
                className={`inline-flex items-center gap-2.5 backdrop-blur-md px-5 py-2.5 rounded-full text-sm mb-8 border ${
                  isOpen
                    ? "bg-accent-light/20 text-white border-accent-light/30"
                    : "bg-white/5 text-white/70 border-white/10"
                }`}
              >
                <span className={`relative flex h-2 w-2 ${isOpen ? "" : "opacity-60"}`}>
                  {isOpen && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-light opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isOpen ? "bg-accent-light" : "bg-white/40"
                    }`}
                  />
                </span>
                <span className="font-semibold">
                  {isOpen
                    ? closesSoon
                      ? "Letzte Bestellungen bis 14:00"
                      : "Jetzt geöffnet · Heute bis 14:00"
                    : "Geschlossen · Mo–Fr ab 06:00"}
                </span>
              </div>

              <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl xl:text-[6.5rem] font-bold text-white display-tight mb-8">
                Mittagessen.<br />
                <span className="text-gradient animate-gradient-slow bg-[length:200%_auto]">
                  Heute frisch.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl leading-relaxed">
                Täglich wechselnde Gerichte aus regionaler Küche in Berlin.
                Abholung in 15 Min. oder Lieferung ins Büro — ab 6,90 €.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/bestellen"
                  className="group inline-flex items-center justify-center gap-2.5 bg-white text-primary px-8 py-4 rounded-full text-lg font-bold hover:bg-secondary-light transition-all duration-300 shadow-2xl shadow-black/20 hover:shadow-white/20 hover:-translate-y-0.5 shine"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Jetzt bestellen
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/tagesangebot"
                  className="group inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
                >
                  Menü heute ansehen
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-white/50 text-sm">
                {reviewStats.count > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-warm-400 fill-warm-400" />
                      ))}
                    </div>
                    <span className="font-semibold text-white/80">
                      {reviewStats.avg.toFixed(1)}
                    </span>
                    <span>· {reviewStats.count} Bewertungen</span>
                  </div>
                )}
                {reviewStats.count > 0 && <div className="w-px h-4 bg-white/20" />}
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Am alten Flugplatz 100, 10318 Berlin
                </span>
              </div>
            </div>

            {/* Hero Bento Grid – durch Header-Foto ersetzt */}
            <div className="hidden" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                {/* Ambient glow behind bento */}
                <div className="absolute -inset-8 bg-gradient-to-br from-secondary/20 via-primary-light/10 to-accent/10 rounded-[3rem] blur-3xl animate-pulse-soft" />

                <div className="relative grid grid-cols-3 grid-rows-2 gap-3 h-[520px] xl:h-[560px]">
                  {/* BIG CARD — Today's special / Menu teaser */}
                  <Link
                    href={dailySpecials.length > 0 ? "/tagesangebot" : "/speisekarte"}
                    className="bento-card col-span-2 row-span-2 group flex flex-col justify-between p-6 xl:p-8 relative overflow-hidden"
                  >
                    <Image
                      src="/images/menu/wiener-schnitzel.png"
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 40vw, 0px"
                      className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105"
                      aria-hidden
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/85 to-neutral-900/55" />
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 border border-white/10 mb-6">
                        <Sparkles className="h-3 w-3 text-secondary" />
                        {dailySpecials.length > 0 ? "Heute im Angebot" : "Heute auf der Karte"}
                      </div>

                      {dailySpecials.length > 0 ? (
                        <>
                          <h3 className="font-heading text-2xl xl:text-3xl font-bold text-white leading-tight mb-3">
                            {dailySpecials[0].menuItem.name}
                          </h3>
                          {dailySpecials[0].menuItem.description && (
                            <p className="text-sm text-white/60 leading-relaxed line-clamp-3 fade-mask-b">
                              {dailySpecials[0].menuItem.description}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <h3 className="font-heading text-2xl xl:text-3xl font-bold text-white leading-tight mb-3">
                            Das heutige Menü entdecken
                          </h3>
                          <p className="text-sm text-white/60 leading-relaxed">
                            Täglich wechselnde Gerichte aus unserer Küche.
                          </p>
                        </>
                      )}
                    </div>

                    <div className="relative z-10 flex items-end justify-between">
                      <div>
                        {dailySpecials.length > 0 && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl xl:text-4xl font-bold text-white">
                              {formatCurrency(dailySpecials[0].specialPrice ?? dailySpecials[0].menuItem.price)}
                            </span>
                            {dailySpecials[0].specialPrice && (
                              <span className="text-sm text-white/40 line-through">
                                {formatCurrency(dailySpecials[0].menuItem.price)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center group-hover:scale-110 group-hover:rotate-[-8deg] transition-transform duration-300 shadow-xl">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>

                  </Link>

                  {/* Rating Card */}
                  <div className="bento-card col-span-1 row-span-1 p-5 flex flex-col justify-between">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 text-warm-400 fill-warm-400" />
                      ))}
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white leading-none mb-1">
                        {reviewStats.count > 0 ? reviewStats.avg.toFixed(1) : "4.8"}
                      </div>
                      <div className="text-xs text-white/50 font-medium">
                        {reviewStats.count > 0
                          ? `${reviewStats.count} Bewertungen`
                          : "Hervorragend"}
                      </div>
                    </div>
                  </div>

                  {/* Delivery / Pickup Card */}
                  <div className="bento-card col-span-1 row-span-1 p-5 flex flex-col justify-between">
                    <div className="w-9 h-9 rounded-xl bg-accent/20 backdrop-blur-sm flex items-center justify-center border border-accent-light/20">
                      <Truck className="h-4 w-4 text-accent-light" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white leading-tight">
                        Lieferung & Abholung
                      </div>
                      <div className="text-xs text-white/50 font-medium mt-0.5">
                        Ab 10 € · 10318 Berlin
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
            <path
              fill="var(--color-warm-50)"
              d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,42.7C840,43,960,53,1080,53.3C1200,53,1320,43,1380,37.3L1440,32L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"
            />
          </svg>
        </div>
      </section>

      {/* ─── VORTEILE ─── */}
      <section className="py-20 bg-warm-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ChefHat, title: "Täglich frisch gekocht", desc: "Kein Aufwärmen. Mo–Fr neu zubereitet mit regionalen Zutaten.", color: "from-primary/10 to-secondary/10" },
              { icon: Clock, title: "Abholung in 15 Min.", desc: "Online bestellen, Abholzeit wählen — ohne Warteschlange.", color: "from-warm-100 to-warm-50" },
              { icon: Truck, title: "Lieferung ins Büro", desc: "Liefern ab 10 € Bestellwert direkt an Ihren Arbeitsplatz.", color: "from-accent/5 to-accent/10" },
              { icon: Leaf, title: "Immer vegane Optionen", desc: "Mindestens 2 vegane Gerichte täglich. Vegetarisch ebenfalls.", color: "from-accent/10 to-accent-light/5" },
            ].map((feature, i) => (
              <div
                key={i}
                className={`group relative text-center p-8 rounded-3xl bg-gradient-to-br ${feature.color} border border-white/60 card-hover`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-5 shadow-sm group-hover:shadow-md transition-shadow">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider mx-auto max-w-xs" />

      {/* ─── TAGESANGEBOT ─── */}
      {dailySpecials.length > 0 && (
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider bg-primary/5 px-4 py-1.5 rounded-full">
                <Sparkles className="h-3.5 w-3.5" />
                Heute empfohlen
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-4">
                Tagesangebot
              </h2>
              <p className="text-neutral-500 mt-3 max-w-md mx-auto">
                Unsere heutigen Empfehlungen, frisch für Sie zubereitet
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dailySpecials.map((special) => (
                <Link
                  key={special.id}
                  href="/bestellen"
                  className="group relative bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm card-hover flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden">
                    {(special.menuItem.imageUrl || menuImage(special.menuItem.slug)) ? (
                      <Image
                        src={(special.menuItem.imageUrl || menuImage(special.menuItem.slug))!}
                        alt={special.menuItem.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-warm-100 to-warm-200">
                        <div
                          className="absolute inset-0 opacity-40"
                          style={{
                            backgroundImage: `radial-gradient(circle at 25% 30%, rgba(255,255,255,.5) 0%, transparent 45%), radial-gradient(circle at 75% 70%, rgba(139,69,19,.25) 0%, transparent 45%)`,
                          }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center font-heading text-8xl font-bold text-primary/10 select-none">
                          {special.menuItem.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                        </span>
                        Heute
                      </span>
                      {special.note && (
                        <span className="bg-white/95 backdrop-blur-sm text-neutral-700 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                          {special.note}
                        </span>
                      )}
                    </div>

                    {/* Price floating tag */}
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-xl">
                      {special.specialPrice ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-primary">
                            {formatCurrency(special.specialPrice)}
                          </span>
                          <span className="text-xs text-neutral-400 line-through">
                            {formatCurrency(special.menuItem.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(special.menuItem.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest mb-2">
                      {special.menuItem.category.name}
                    </span>
                    <h3 className="font-heading text-xl font-bold text-neutral-800 mb-2 group-hover:text-primary transition-colors">
                      {special.menuItem.name}
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 flex-1">
                      {special.menuItem.description}
                    </p>

                    <div className="mt-5 pt-5 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-sm text-primary font-semibold">
                        Jetzt bestellen
                      </span>
                      <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center group-hover:rotate-[-8deg] transition-transform duration-300">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── BELIEBTE GERICHTE ─── */}
      <section className="py-20 bg-warm-50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider bg-primary/5 px-4 py-1.5 rounded-full">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              Unsere Küche
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-4">
              Beliebte Gerichte
            </h2>
            <p className="text-neutral-500 mt-3 max-w-md mx-auto">
              Entdecken Sie unsere beliebtesten Kreationen
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <Link
                key={item.id}
                href="/bestellen"
                className="group relative bg-white rounded-[2rem] overflow-hidden border border-neutral-100 card-hover flex flex-col"
              >
                {/* Image / Visual */}
                <div className="relative h-60 overflow-hidden">
                  {(item.imageUrl || menuImage(item.slug)) ? (
                    <Image
                      src={(item.imageUrl || menuImage(item.slug))!}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/25 to-warm-200">
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(139,69,19,.2) 0%, transparent 50%)`,
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center font-heading text-7xl font-bold text-primary/10 select-none">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Top badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <span className="bg-white/90 backdrop-blur-md text-neutral-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                      {item.category.name}
                    </span>
                    <div className="flex gap-1.5">
                      {item.isVegan ? (
                        <span className="bg-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          VEGAN
                        </span>
                      ) : item.isVegetarian ? (
                        <span className="bg-accent-light text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          VEG
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Price tag floating */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-lg">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-heading text-xl font-bold text-neutral-800 mb-2 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed flex-1">
                    {item.description}
                  </p>

                  <div className="mt-5 pt-5 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-medium">
                      Jetzt bestellen
                    </span>
                    <div className="w-9 h-9 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/speisekarte"
              className="group inline-flex items-center gap-2.5 text-primary font-semibold hover:text-primary-dark transition-colors text-lg"
            >
              Komplette Speisekarte ansehen
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider mx-auto max-w-xs" />

      {/* ─── INSTAGRAM FEED ─── */}
      <InstagramFeed posts={instagramPosts} />

      {/* ─── SO BESTELLEN SIE ─── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/3 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider bg-primary/5 px-4 py-1.5 rounded-full">
              Einfach &amp; schnell
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-4">
              So bestellen Sie
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {/* Connection lines (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {[
              { step: "1", title: "Menü wählen", desc: "Stöbern Sie in unserer Speisekarte und wählen Sie Ihre Lieblingsgerichte.", emoji: "📋" },
              { step: "2", title: "Online bestellen", desc: "Legen Sie Gerichte in den Warenkorb und wählen Sie Abholung oder Lieferung.", emoji: "🛒" },
              { step: "3", title: "Genießen", desc: "Holen Sie Ihr Essen ab oder lassen Sie es sich bequem liefern.", emoji: "😋" },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-light text-white rounded-3xl flex items-center justify-center text-2xl font-bold shadow-xl shadow-primary/20 group-hover:shadow-2xl group-hover:shadow-primary/30 transition-all duration-300 group-hover:-translate-y-1 rotate-3 group-hover:rotate-0">
                    {item.step}
                  </div>
                  <div className="absolute -top-2 -right-2 text-2xl animate-float" style={{ animationDelay: `${i}s` }}>
                    {item.emoji}
                  </div>
                </div>
                <h3 className="font-heading text-xl font-bold text-neutral-800 mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEWERTUNGEN ─── */}
      {reviews.length > 0 && (
        <section className="py-20 bg-warm-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider bg-primary/5 px-4 py-1.5 rounded-full">
                <Heart className="h-3.5 w-3.5" />
                Was unsere Gäste sagen
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-4">
                Kundenbewertungen
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="relative bg-white p-8 rounded-3xl border border-neutral-100 card-hover"
                >
                  <Quote className="absolute top-6 right-6 h-8 w-8 text-secondary/20" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating
                            ? "text-warm-400 fill-warm-400"
                            : "text-neutral-200"
                        }`}
                      />
                    ))}
                  </div>
                  {review.title && (
                    <h4 className="font-heading font-semibold text-neutral-800 mb-2 text-lg">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-neutral-500 mb-6 line-clamp-3 leading-relaxed">
                    {review.comment}
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-white">
                        {review.user.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-700">
                      {review.user.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/bewertungen"
                className="group inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors"
              >
                Alle Bewertungen ansehen
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light" />
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/10">
            <Heart className="h-8 w-8 text-secondary" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight">
            Heute Mittag schon{" "}
            <span className="text-gradient">bestellt?</span>
          </h2>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
            In 2 Minuten online bestellt — Abholung oder Lieferung nach Wunsch.
            Mo–Fr von 06:00 bis 14:00.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/bestellen"
              className="group inline-flex items-center justify-center gap-2.5 bg-white text-primary px-8 py-4 rounded-full text-lg font-bold hover:bg-secondary-light transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5 shine"
            >
              <ShoppingCart className="h-5 w-5" />
              Jetzt bestellen
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
            >
              <MapPin className="h-5 w-5" />
              So finden Sie uns
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
