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
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Angaben gemäß § 5 DDG</h2>
          <p className="text-neutral-600">
            Burck, Bau und Verwaltung e.K.<br />
            Geschäftsbezeichnungen: Culinarium am Biesenhorst · Culinarium am Bau<br />
            Am alten Flugplatz 100<br />
            10318 Berlin
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Inhaber</h2>
          <p className="text-neutral-600">Roman Kinakh</p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Kontakt</h2>
          <p className="text-neutral-600">
            Telefon: 030 56553364<br />
            E-Mail: info@culinarium-berlin.de
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Registereintrag</h2>
          <p className="text-neutral-600">
            Eintragung im Handelsregister<br />
            Registergericht: Amtsgericht Charlottenburg (Berlin)<br />
            Registernummer: HRA 49128 B
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Umsatzsteuer-ID</h2>
          <p className="text-neutral-600">
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
            DE266181282
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p className="text-neutral-600">
            Roman Kinakh<br />
            Am alten Flugplatz 100<br />
            10318 Berlin
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">EU-Streitschlichtung</h2>
          <p className="text-neutral-600">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <a href="https://ec.europa.eu/consumers/odr/" className="text-primary underline" target="_blank" rel="noopener noreferrer">
              https://ec.europa.eu/consumers/odr/
            </a>
            . Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
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
