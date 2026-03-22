import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-bold text-neutral-800 mb-8">Impressum</h1>

      <div className="prose prose-neutral max-w-none space-y-6">
        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Angaben gemäß § 5 TMG</h2>
          <p className="text-neutral-600">
            Culinarium am Biesenhorst<br />
            Am alten Flugplatz 100<br />
            10318 Berlin
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Kontakt</h2>
          <p className="text-neutral-600">
            Telefon: 030 56553364<br />
            E-Mail: info@culinarium-biesenhorst.de
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Umsatzsteuer-ID</h2>
          <p className="text-neutral-600">
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
            [USt-IdNr. hier einfügen]
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p className="text-neutral-600">
            [Name des Verantwortlichen]<br />
            Am alten Flugplatz 100<br />
            10318 Berlin
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Haftungsausschluss</h2>
          <p className="text-neutral-600">
            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.
            Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
          </p>
        </section>
      </div>
    </div>
  );
}
