import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktieren Sie das Culinarium am Biesenhorst – Telefon 030 56553364, info@culinarium-berlin.de, Am alten Flugplatz 100, 10318 Berlin.",
};

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  return children;
}
