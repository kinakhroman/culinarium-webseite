import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
};

export default function DatenschutzPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-bold text-neutral-800 mb-8">Datenschutzerklärung</h1>

      <div className="prose prose-neutral max-w-none space-y-6">
        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">1. Datenschutz auf einen Blick</h2>
          <p className="text-neutral-600">
            Die folgenden Hinweise geben einen Überblick darüber, was mit Ihren personenbezogenen
            Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten,
            mit denen Sie persönlich identifiziert werden können.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">2. Verantwortliche Stelle</h2>
          <p className="text-neutral-600">
            Culinarium am Biesenhorst<br />
            Am alten Flugplatz 100<br />
            10318 Berlin<br />
            E-Mail: culinariumambiesenhorst@gmail.com
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">3. Datenerfassung auf dieser Website</h2>
          <p className="text-neutral-600">
            <strong>Registrierung und Bestellungen:</strong> Bei der Registrierung und Bestellung speichern wir
            Ihren Namen, Ihre E-Mail-Adresse, Telefonnummer und ggf. Ihre Lieferadresse. Diese Daten
            werden ausschließlich zur Abwicklung Ihrer Bestellung verwendet.
          </p>
          <p className="text-neutral-600">
            <strong>Cookies:</strong> Diese Website verwendet technisch notwendige Cookies für die
            Sitzungsverwaltung und Authentifizierung. Es werden keine Tracking-Cookies verwendet.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">4. Ihre Rechte</h2>
          <p className="text-neutral-600">
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der
            Verarbeitung Ihrer personenbezogenen Daten. Bitte kontaktieren Sie uns unter der
            oben genannten Adresse.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">5. SSL-Verschlüsselung</h2>
          <p className="text-neutral-600">
            Diese Seite nutzt aus Sicherheitsgründen eine SSL-Verschlüsselung. Eine verschlüsselte
            Verbindung erkennen Sie daran, dass die Adresszeile Ihres Browsers von „http://"
            auf „https://" wechselt.
          </p>
        </section>
      </div>
    </div>
  );
}
