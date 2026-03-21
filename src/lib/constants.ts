export const APP_NAME = "Culinarium am Biesenhorst";
export const APP_DESCRIPTION = "Frisch, regional und mit Liebe zubereitet. Bestellen Sie Ihr Mittagessen bequem online.";

export const ORDER_STATUS = {
  PENDING: "Ausstehend",
  CONFIRMED: "Bestätigt",
  PREPARING: "In Zubereitung",
  READY: "Abholbereit",
  DELIVERED: "Geliefert",
  CANCELLED: "Storniert",
} as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-orange-100 text-orange-800",
  READY: "bg-green-100 text-green-800",
  DELIVERED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/culinariumambiesenhorst",
  facebook: "https://www.facebook.com/Culinariumambiesenhorst",
};

export const NAV_ITEMS = [
  { label: "Startseite", href: "/" },
  { label: "Speisekarte", href: "/speisekarte" },
  { label: "Tagesangebot", href: "/tagesangebot" },
  { label: "Wochenplan", href: "/wochenplan" },
  { label: "Bestellen", href: "/bestellen" },
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Kontakt", href: "/kontakt" },
] as const;
