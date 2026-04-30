"use client";

import { useEffect, useState } from "react";

type Review = {
  id: string;
  patientName: string;
  initials: string;
  doctorName: string;
  rating: number;
  comment: string;
  date: string;
};

type Summary = {
  averageRating: number;
  totalReviews: number;
  recommendRate: number;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/reviews", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
        });
        const result = await res.json();
        if (result.success) {
          setReviews(result.data.reviews);
          setSummary(result.data.summary);
        } else {
          setError(result.message);
        }
      } catch {
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Helper function to render stars
  const renderStars = (rating: number, size: string = "w-5 h-5") => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            // Full star
            return (
              <svg key={i} className={`${size} text-[#0D9488] fill-current`} viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            );
          } else if (i === fullStars && hasHalfStar) {
            // Half star
            return (
              <svg key={i} className={`${size} text-[#0D9488] fill-current`} viewBox="0 0 20 20">
                <defs>
                  <linearGradient id={`half-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="50%" stopColor="#0D9488" />
                    <stop offset="50%" stopColor="#F1F5F9" />
                  </linearGradient>
                </defs>
                <path fill={`url(#half-${i})`} d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            );
          } else {
            // Empty star
            return (
              <svg key={i} className={`${size} text-[#F1F5F9] fill-current`} viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10 flex flex-col gap-6">
        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm text-center">
                <div className="h-10 bg-[#F1F5F9] rounded animate-pulse mx-auto w-20 mb-2" />
                <div className="h-3 bg-[#F1F5F9] rounded animate-pulse mx-auto w-28" />
              </div>
            ))
          ) : (
            <>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold text-[#00685C]">{summary?.averageRating ?? "—"}</p>
                <div className="flex justify-center my-2">
                  {renderStars(summary?.averageRating ?? 0, "w-5 h-5")}
                </div>
                <p className="text-sm text-[#3D4946]">Average Rating</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold text-[#0B1C30]">{summary?.totalReviews ?? "—"}</p>
                <p className="text-sm text-[#3D4946] mt-2">Total Reviews</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold text-[#0B1C30]">{summary ? `${summary.recommendRate}%` : "—"}</p>
                <p className="text-sm text-[#3D4946] mt-2">Recommend Rate</p>
              </div>
            </>
          )}
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-3">
                <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-1/2" />
                <div className="h-3 bg-[#F1F5F9] rounded animate-pulse" />
                <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-[#94A3B8] text-center py-10">No reviews yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F0FDFA] flex items-center justify-center text-sm font-bold text-[#00685C]">
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0B1C30]">{review.patientName}</p>
                      <p className="text-xs text-[#3D4946]">{review.doctorName}</p>
                    </div>
                  </div>
                  {renderStars(review.rating, "w-4 h-4")}
                </div>
                <p className="text-sm text-[#485F83] italic">&ldquo;{review.comment}&rdquo;</p>
                <p className="text-xs text-[#94A3B8]">{review.date}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}