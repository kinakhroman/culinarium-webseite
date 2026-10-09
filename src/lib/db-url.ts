/**
 * Liest DATABASE_URL robust ein.
 *
 * Beim Hostinger-Build am 09.10.2026 meldete Prisma „P1013: The scheme is not
 * recognized in database URL" – typisch, wenn der Wert im hPanel mit
 * Anführungszeichen oder Leerzeichen gespeichert wurde. Ohne Bereinigung
 * würde die Seite im Betrieb an derselben Stelle scheitern.
 */
export function cleanDatabaseUrl(raw: string | undefined): string {
  return (raw || "").trim().replace(/^["']+|["']+$/g, "").trim();
}

export function parseDatabaseUrl(raw: string | undefined) {
  const url = cleanDatabaseUrl(raw);
  const parsed = new URL(url.replace(/^(mysql|mariadb):\/\//, "http://"));
  return {
    host: parsed.hostname === "localhost" ? "127.0.0.1" : parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
  };
}
