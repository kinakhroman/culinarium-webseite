"use client";

import { useEffect, useState } from "react";
import { Save, Check } from "lucide-react";

interface SiteSettings {
  businessName: string;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  street: string | null;
  houseNumber: string | null;
  postalCode: string | null;
  city: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  telegramChatId: string | null;
  minimumOrderAmount: number;
  deliveryFee: number;
}

export default function AdminEinstellungenPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fd.forEach((value, key) => {
      if (key === "minimumOrderAmount" || key === "deliveryFee") {
        data[key] = parseFloat(value as string);
      } else {
        data[key] = value || null;
      }
    });

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!settings) return <div className="py-8 text-center text-neutral-500">Lädt...</div>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-neutral-800 mb-6">
        Einstellungen
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-neutral-100 p-6">
          <h2 className="font-semibold text-neutral-800 mb-4">Geschäftsinformationen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Geschäftsname</label>
              <input name="businessName" defaultValue={settings.businessName} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Slogan</label>
              <input name="tagline" defaultValue={settings.tagline || ""} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Telefon</label>
              <input name="phone" defaultValue={settings.phone || ""} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">E-Mail</label>
              <input name="email" defaultValue={settings.email || ""} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Straße</label>
              <input name="street" defaultValue={settings.street || ""} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Hausnummer</label>
              <input name="houseNumber" defaultValue={settings.houseNumber || ""} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">PLZ</label>
              <input name="postalCode" defaultValue={settings.postalCode || ""} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Stadt</label>
              <input name="city" defaultValue={settings.city || ""} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 p-6">
          <h2 className="font-semibold text-neutral-800 mb-4">Social Media & Telegram</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Instagram URL</label>
              <input name="instagramUrl" defaultValue={settings.instagramUrl || ""} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Facebook URL</label>
              <input name="facebookUrl" defaultValue={settings.facebookUrl || ""} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Telegram Chat-ID</label>
              <input name="telegramChatId" defaultValue={settings.telegramChatId || ""} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" placeholder="-1001234567890" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 p-6">
          <h2 className="font-semibold text-neutral-800 mb-4">Bestelleinstellungen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Mindestbestellwert (EUR)</label>
              <input name="minimumOrderAmount" type="number" step="0.5" defaultValue={settings.minimumOrderAmount} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Liefergebühr (EUR)</label>
              <input name="deliveryFee" type="number" step="0.5" defaultValue={settings.deliveryFee} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saved ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          {saved ? "Gespeichert!" : saving ? "Speichert..." : "Speichern"}
        </button>
      </form>
    </div>
  );
}
