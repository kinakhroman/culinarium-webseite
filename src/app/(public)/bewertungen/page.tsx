import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Star, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bewertungen",
  description: "Was unsere Gäste über das Culinarium am Biesenhorst sagen.",
};

async function getReviews() {
  return db.review.findMany({
    where: { isVisible: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function BewertungenPage() {
  const reviews = await getReviews();
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <span className="text-primary font-semibold text-sm uppercase tracking-wider">
          Feedback
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-2 mb-4">
          Kundenbewertungen
        </h1>
        {reviews.length > 0 && (
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(avgRating) ? "text-warm-400 fill-warm-400" : "text-neutral-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-bold text-neutral-800">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-neutral-400">
              ({reviews.length} Bewertung{reviews.length !== 1 ? "en" : ""})
            </span>
          </div>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {review.user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-800">{review.user.name}</span>
                    <span className="block text-xs text-neutral-400">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? "text-warm-400 fill-warm-400" : "text-neutral-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.title && (
                <h3 className="font-semibold text-neutral-800 mb-1">{review.title}</h3>
              )}
              <p className="text-neutral-600">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-warm-50 rounded-2xl">
          <MessageSquare className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-neutral-600 mb-2">
            Noch keine Bewertungen
          </h3>
          <p className="text-neutral-400">
            Seien Sie der Erste, der eine Bewertung hinterlässt!
          </p>
        </div>
      )}
    </div>
  );
}
