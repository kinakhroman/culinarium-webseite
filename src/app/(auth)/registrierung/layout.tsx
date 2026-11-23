import { redirect } from "next/navigation";
import { CUSTOMER_LOGIN_ENABLED } from "@/lib/constants";

// Solange der Kunden-Login abgeschaltet ist, führt die Registrierung zur Startseite.
export default function RegistrierungLayout({ children }: { children: React.ReactNode }) {
  if (!CUSTOMER_LOGIN_ENABLED) redirect("/");
  return <>{children}</>;
}
