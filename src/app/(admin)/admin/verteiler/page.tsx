import { db } from "@/lib/db";
import RecipientManager from "@/components/admin/recipient-manager";

export const dynamic = "force-dynamic";

async function getRecipients() {
  try {
    const list = await db.mailingRecipient.findMany({ orderBy: { createdAt: "desc" } });
    return list.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    // Tabelle evtl. noch nicht migriert
    return [];
  }
}

export default async function AdminVerteilerPage() {
  const recipients = await getRecipients();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-neutral-800">Verteiler</h1>
        <p className="text-sm text-neutral-500">
          E-Mail-Verteiler für das Wochenmenü. Wird automatisch{" "}
          <strong>jeden Freitag</strong> mit dem Menü der kommenden Woche verschickt.
        </p>
      </div>
      <RecipientManager initial={recipients} />
    </div>
  );
}
