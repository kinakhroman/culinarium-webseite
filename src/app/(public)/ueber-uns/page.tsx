import { ChefHat, Heart, Leaf, Award, Users, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über uns",
  description: "Erfahren Sie mehr über das Culinarium am Biesenhorst — frische, regionale Küche in Berlin.",
};

export default function UeberUnsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="text-primary font-semibold text-sm uppercase tracking-wider">
          Unsere Geschichte
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-2 mb-6">
          Über uns
        </h1>
        <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
          Das Culinarium am Biesenhorst steht für frische, regionale Küche mit
          Herz und Leidenschaft. Jeden Tag kochen wir für Sie mit den besten
          Zutaten der Saison.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div className="h-80 lg:h-96 bg-gradient-to-br from-secondary/30 to-warm-200 rounded-2xl flex items-center justify-center">
          <ChefHat className="h-24 w-24 text-primary/20" />
          {/* Placeholder — hier echtes Bild einfügen */}
        </div>
        <div>
          <h2 className="font-heading text-3xl font-bold text-neutral-800 mb-4">
            Unsere Philosophie
          </h2>
          <p className="text-neutral-600 mb-4">
            Im Culinarium am Biesenhorst vereinen wir Tradition und
            Modernität in unserer Küche. Unsere erfahrenen Köche bereiten
            täglich abwechslungsreiche Gerichte zu, die sowohl den Gaumen
            als auch das Auge erfreuen.
          </p>
          <p className="text-neutral-600 mb-4">
            Wir setzen auf regionale Lieferanten und saisonale Zutaten.
            Qualität, Frische und Nachhaltigkeit stehen bei uns an erster
            Stelle. Ob herzhaft oder vegetarisch — bei uns findet jeder
            sein Lieblingsgericht.
          </p>
          <p className="text-neutral-600">
            Unser Ziel ist es, Ihnen jeden Tag ein Stück Genuss zu
            bieten — unkompliziert, lecker und zu fairen Preisen.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {[
          { icon: Heart, title: "Mit Liebe gekocht", desc: "Jedes Gericht wird mit Sorgfalt und Leidenschaft zubereitet." },
          { icon: Leaf, title: "Regional & Saisonal", desc: "Wir beziehen unsere Zutaten von regionalen Erzeugern." },
          { icon: Award, title: "Höchste Qualität", desc: "Frische und Geschmack haben bei uns oberste Priorität." },
          { icon: Users, title: "Für alle", desc: "Vegetarisch, vegan oder glutenfrei — wir haben für jeden etwas." },
          { icon: Clock, title: "Pünktlich & zuverlässig", desc: "Bestellen Sie online und wir haben Ihr Essen zur Wunschzeit bereit." },
          { icon: ChefHat, title: "Erfahrenes Team", desc: "Unsere Köche bringen jahrelange Erfahrung und Kreativität mit." },
        ].map((value, i) => (
          <div key={i} className="p-6 bg-warm-50 rounded-2xl text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 text-primary rounded-2xl mb-4">
              <value.icon className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-2">
              {value.title}
            </h3>
            <p className="text-sm text-neutral-500">{value.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
