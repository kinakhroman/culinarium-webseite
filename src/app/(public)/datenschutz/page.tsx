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
            Burck, Bau und Verwaltung e.K. (Culinarium am Biesenhorst / Culinarium am Bau)<br />
            Inhaber: Roman Kinakh<br />
            Am alten Flugplatz 100<br />
            10318 Berlin<br />
            Telefon: 030 56553364<br />
            E-Mail: info@culinarium-berlin.de
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
          <p className="text-neutral-600">
            <strong>Instagram-Inhalte:</strong> Auf unserer Startseite zeigen wir öffentliche Beiträge
            unseres Instagram-Profils an. Dabei können Inhalte von den Servern der Meta Platforms Ireland
            Ltd. (4 Grand Canal Square, Dublin, Irland) geladen und hierbei Daten wie Ihre IP-Adresse an
            Meta übertragen werden. Weitere Informationen finden Sie in der Datenschutzerklärung von
            Instagram:{" "}
            <a
              href="https://privacycenter.instagram.com/policy"
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacycenter.instagram.com/policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">4. Hosting &amp; Server-Logfiles</h2>
          <p className="text-neutral-600">
            Diese Website wird bei einem externen Dienstleister (Hosting-Provider) betrieben. Beim
            Aufruf der Seiten erfasst der Provider automatisch Informationen in sogenannten
            Server-Logfiles: Browsertyp und -version, verwendetes Betriebssystem, Referrer-URL,
            Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage und die IP-Adresse. Diese
            Daten sind technisch erforderlich, um die Website stabil und sicher auszuliefern, und
            werden nicht mit anderen Datenquellen zusammengeführt.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">5. Rechtsgrundlagen &amp; Speicherdauer</h2>
          <p className="text-neutral-600">
            Die Verarbeitung Ihrer Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
            (Vertragserfüllung – Registrierung, Bestellungen, Anfragen), Art. 6 Abs. 1 lit. f DSGVO
            (berechtigtes Interesse – sicherer und technisch fehlerfreier Betrieb der Website) sowie
            ggf. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
          </p>
          <p className="text-neutral-600">
            Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke
            erforderlich ist bzw. gesetzliche Aufbewahrungsfristen (z. B. handels- und steuerrechtlich)
            dies vorschreiben. Server-Logfiles werden in der Regel nach kurzer Zeit gelöscht.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">6. Ihre Rechte</h2>
          <p className="text-neutral-600">
            Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
            Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung Ihrer
            personenbezogenen Daten. Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für
            die Zukunft widerrufen. Bitte kontaktieren Sie uns dazu unter der oben genannten Adresse.
          </p>
          <p className="text-neutral-600">
            Ihnen steht zudem ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu, etwa der
            Berliner Beauftragten für Datenschutz und Informationsfreiheit.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-neutral-800">7. SSL-Verschlüsselung</h2>
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
