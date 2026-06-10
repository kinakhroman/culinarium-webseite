"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  category: { name: string };
}

export default function AdminSpeisekartePage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/menu").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/categories").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([menuData, catData]) => {
        setItems(Array.isArray(menuData) ? menuData : []);
        setCategories(Array.isArray(catData) ? catData : []);
      })
      .catch(() => setError("Daten konnten nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(item: MenuItem) {
    setEditing(item);
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function toggleAvailability(id: string, isAvailable: boolean) {
    const res = await fetch(`/api/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !isAvailable }),
    });
    if (!res.ok) return alert("Konnte Verfügbarkeit nicht ändern.");
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isAvailable: !isAvailable } : i)));
  }

  async function deleteItem(id: string) {
    if (!confirm("Wirklich löschen?")) return;
    const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Löschen fehlgeschlagen.");
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      price: parseFloat(fd.get("price") as string),
      categoryId: fd.get("categoryId") as string,
      isVegetarian: fd.get("isVegetarian") === "on",
      isVegan: fd.get("isVegan") === "on",
      isGlutenFree: fd.get("isGlutenFree") === "on",
    };

    const res = await fetch(editing ? `/api/menu/${editing.id}` : "/api/menu", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setError("Speichern fehlgeschlagen. Bitte Eingaben prüfen.");
      return;
    }
    const item = await res.json();
    setItems((prev) =>
      editing ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item]
    );
    closeForm();
  }

  if (loading) return <div className="py-8 text-center text-neutral-500">Lädt...</div>;

  const inputCls = "w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-neutral-800">Speisekarte</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Neues Gericht
        </button>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

      {showForm && (
        <div className="bg-white rounded-xl border border-neutral-100 p-6 mb-6">
          <h2 className="font-semibold text-neutral-800 mb-4">
            {editing ? "Gericht bearbeiten" : "Neues Gericht erstellen"}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
              <input name="name" required defaultValue={editing?.name ?? ""} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Preis (EUR)</label>
              <input name="price" type="number" step="0.01" required defaultValue={editing?.price ?? ""} className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Beschreibung</label>
              <textarea name="description" required rows={2} defaultValue={editing?.description ?? ""} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Kategorie</label>
              <select name="categoryId" required defaultValue={editing?.categoryId ?? ""} className={inputCls}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isVegetarian" defaultChecked={editing?.isVegetarian} className="rounded" /> Vegetarisch
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isVegan" defaultChecked={editing?.isVegan} className="rounded" /> Vegan
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isGlutenFree" defaultChecked={editing?.isGlutenFree} className="rounded" /> Glutenfrei
              </label>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">
                {editing ? "Speichern" : "Erstellen"}
              </button>
              <button type="button" onClick={closeForm} className="text-neutral-500 px-4 py-2 text-sm">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-neutral-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Gericht</th>
              <th className="px-4 py-3 text-left">Kategorie</th>
              <th className="px-4 py-3 text-right">Preis</th>
              <th className="px-4 py-3 text-center">Tags</th>
              <th className="px-4 py-3 text-center">Verfügbar</th>
              <th className="px-4 py-3 text-center">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{item.name}</td>
                <td className="px-4 py-3 text-neutral-500">{item.category.name}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.price)}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-1 justify-center">
                    {item.isVegetarian && <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded">VEG</span>}
                    {item.isVegan && <span className="bg-green-200 text-green-800 text-[10px] px-1.5 py-0.5 rounded">VEGAN</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleAvailability(item.id, item.isAvailable)}
                    className={`p-1.5 rounded-lg ${item.isAvailable ? "text-green-600 hover:bg-green-50" : "text-neutral-400 hover:bg-neutral-100"}`}
                    aria-label="Verfügbarkeit umschalten"
                  >
                    {item.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-neutral-400 hover:text-primary p-1.5"
                      aria-label="Bearbeiten"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-400 hover:text-red-600 p-1.5"
                      aria-label="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  Noch keine Gerichte.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
