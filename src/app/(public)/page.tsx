import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import { formatCurrency } from "@/lib/utils";
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
} from "lucide-react";

async function getFeaturedItems() {
  return db.menuItem.findMany({
    where: { isAvailable: true },
    include: { category: true },
    take: 6,
    orderBy: { sortOrder: "asc" },
  });
}

async function getDailySpecials() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return db.dailySpecial.findMany({
    where: { date: today, isActive: true },
    include: { menuItem: { include: { category: true } } },
  });
}

async function getReviews() {
  return db.review.findMany({
    where: { isVisible: true },
    include: { user: { select: { name: true } } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });
}

export default async function HomePage() {
  const [featuredItems, dailySpecials, reviews] = await Promise.all([
    getFeaturedItems(),
    getDailySpecials(),
    getReviews(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-6">
              <UtensilsCrossed className="h-4 w-4" />
              <span>Frisch zubereitet, täglich für Sie</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Genuss, der
              <br />
              <span className="text-secondary-light">begeistert.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
              Frische, regionale Küche mit Liebe zubereitet. Bestellen Sie Ihr
              Mittagessen bequem online — Abholung oder Lieferung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/bestellen"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-full text-lg font-bold hover:bg-secondary-light transition-colors shadow-xl hover:shadow-2xl"
              >
                <ShoppingCart className="h-5 w-5" />
                Jetzt bestellen
              </Link>
              <Link
                href="/speisekarte"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 transition-colors"
              >
                Speisekarte ansehen
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vorteile */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ChefHat, title: "Frisch zubereitet", desc: "Täglich frisch gekocht mit regionalen Zutaten" },
              { icon: Clock, title: "Schnelle Abholung", desc: "Online bestellen und zur Wunschzeit abholen" },
              { icon: Truck, title: "Lieferservice", desc: "Bequem ins Büro oder nach Hause liefern lassen" },
              { icon: Leaf, title: "Vegetarisch & Vegan", desc: "Vielfältige Auswahl für jeden Geschmack" },
            ].map((feature, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl hover:bg-warm-50 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-secondary/20 text-primary rounded-2xl mb-4">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tagesangebot */}
      {dailySpecials.length > 0 && (
        <section className="py-16 bg-warm-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                Heute empfohlen
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-800 mt-2">
                Tagesangebot
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dailySpecials.map((special) => (
                <div
                  key={special.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-neutral-100"
                >
                  <div className="h-48 bg-gradient-to-br from-secondary/30 to-warm-200 flex items-center justify-center">
                    <UtensilsCrossed className="h-16 w-16 text-primary/30" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full">
                        {special.menuItem.category.name}
                      </span>
                      {special.note && (
                        <span className="bg-warm-100 text-warm-700 text-xs px-2.5 py-1 rounded-full">
                          {special.note}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-xl font-bold text-neutral-800 mb-1">
                      {special.menuItem.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-4">
                      {special.menuItem.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        {special.specialPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-primary">
                              {formatCurrency(special.specialPrice)}
                            </span>
                            <span className="text-sm text-neutral-400 line-through">
                              {formatCurrency(special.menuItem.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-primary">
                            {formatCurrency(special.menuItem.price)}
                          </span>
                        )}
                      </div>
                      <Link
                        href="/bestellen"
                        className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
                      >
                        Bestellen
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Beliebte Gerichte */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Unsere Küche
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-800 mt-2">
              Beliebte Gerichte
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className="bg-warm-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all border border-neutral-100 group"
              >
                <div className="h-44 bg-gradient-to-br from-secondary/20 to-warm-200 flex items-center justify-center relative overflow-hidden">
                  <UtensilsCrossed className="h-12 w-12 text-primary/20" />
                  {/* Placeholder — hier echtes Bild einfügen */}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {item.isVegetarian && (
                      <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        VEG
                      </span>
                    )}
                    {item.isVegan && (
                      <span className="bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        VEGAN
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs text-neutral-400 font-medium">
                    {item.category.name}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-neutral-800 mt-1 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(item.price)}
                    </span>
                    <Link
                      href="/bestellen"
                      className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
                    >
                      In den Warenkorb
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/speisekarte"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors"
            >
              Komplette Speisekarte ansehen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* So funktioniert es */}
      <section className="py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Einfach & schnell
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-800 mt-2">
              So bestellen Sie
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Menü wählen", desc: "Stöbern Sie in unserer Speisekarte und wählen Sie Ihre Lieblingsgerichte." },
              { step: "2", title: "Online bestellen", desc: "Legen Sie Gerichte in den Warenkorb und wählen Sie Abholung oder Lieferung." },
              { step: "3", title: "Genießen", desc: "Holen Sie Ihr Essen ab oder lassen Sie es sich bequem liefern." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full text-2xl font-bold mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-heading text-xl font-semibold text-neutral-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bewertungen */}
      {reviews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                Was unsere Gäste sagen
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-800 mt-2">
                Kundenbewertungen
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-warm-50 p-6 rounded-2xl border border-neutral-100"
                >
                  <div className="flex gap-1 mb-3">
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
                    <h4 className="font-semibold text-neutral-800 mb-1">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
                    {review.comment}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {review.user.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      {review.user.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="h-10 w-10 text-secondary mx-auto mb-4" />
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Hunger? Bestellen Sie jetzt!
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Frische Gerichte warten auf Sie. Einfach online bestellen und
            genießen — täglich wechselnde Angebote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/bestellen"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-full text-lg font-bold hover:bg-secondary-light transition-colors shadow-xl"
            >
              <ShoppingCart className="h-5 w-5" />
              Jetzt bestellen
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 transition-colors"
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
