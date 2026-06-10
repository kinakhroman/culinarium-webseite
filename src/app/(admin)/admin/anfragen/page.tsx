import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { Mail, Phone, Building2, MapPin, Users, Inbox } from "lucide-react";
import InquiryActions from "@/components/admin/inquiry-actions";

export const dynamic = "force-dynamic";

async function getInquiries() {
  try {
    return await db.inquiry.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminAnfragenPage() {
  const inquiries = await getInquiries();
  const offen = inquiries.filter((i) => i.status !== "DONE").length;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-800">Anfragen</h1>
          <p className="text-sm text-neutral-500">
            Kontakt- und Catering-Anfragen ({offen} offen, {inquiries.length} gesamt)
          </p>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-100">
          <Inbox className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">Noch keine Anfragen.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((i) => (
            <div
              key={i.id}
              className={`bg-white rounded-2xl border p-5 ${
                i.status === "DONE" ? "border-neutral-100 opacity-70" : "border-secondary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      i.type === "CATERING"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {i.type === "CATERING" ? "Catering" : "Kontakt"}
                  </span>
                  {i.status === "NEW" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-white">
                      Neu
                    </span>
                  )}
                  <span className="font-semibold text-neutral-800">{i.name}</span>
                </div>
                <InquiryActions id={i.id} status={i.status} />
              </div>

              {i.subject && (
                <p className="font-medium text-neutral-700 mb-1">{i.subject}</p>
              )}
              {i.message && (
                <p className="text-sm text-neutral-600 whitespace-pre-wrap mb-3">{i.message}</p>
              )}

              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-500">
                {i.email && (
                  <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                    <Mail className="h-3.5 w-3.5" /> {i.email}
                  </a>
                )}
                {i.phone && (
                  <a href={`tel:${i.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                    <Phone className="h-3.5 w-3.5" /> {i.phone}
                  </a>
                )}
                {i.company && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> {i.company}
                  </span>
                )}
                {i.site && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {i.site}
                  </span>
                )}
                {i.people != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> ca. {i.people} Personen
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-3">{formatDateTime(i.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
