"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, Loader2 } from "lucide-react";

export default function InquiryActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(status);

  async function setStatus(next: string) {
    setBusy(true);
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) {
      setCurrent(next);
      router.refresh();
    }
  }

  async function remove() {
    if (!confirm("Diese Anfrage wirklich löschen?")) return;
    setBusy(true);
    const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {busy && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
      {current !== "DONE" && (
        <button
          type="button"
          onClick={() => setStatus("DONE")}
          disabled={busy}
          className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-2.5 py-1 rounded-full disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" /> Erledigt
        </button>
      )}
      {current === "DONE" && (
        <button
          type="button"
          onClick={() => setStatus("NEW")}
          disabled={busy}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-700 px-2.5 py-1 rounded-full bg-neutral-100"
        >
          Wieder öffnen
        </button>
      )}
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="inline-flex items-center text-neutral-400 hover:text-red-600 disabled:opacity-50"
        aria-label="Anfrage löschen"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
