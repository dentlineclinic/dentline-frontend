"use client";

import { useEffect, useState, useCallback } from "react";
import TopBar from "@/components/layout/TopBar";
import { getAdminReviews } from "@/services/reviewService";

export const dynamic = "force-dynamic";

type Review = {
  id: string;
  patientName: string;
  initials: string;
  doctorName: string;
  rating: number;
  comment: string;
  date: string;
};

function getInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(raw: string | null | undefined) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Stars({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${size} ${star <= Math.round(rating) ? "text-[#0D9488]" : "text-[#E2E8F0]"} fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
}

export default function DoctorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 20;

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminReviews(p, size);
      const content: any[] = res?.data?.content ?? [];

      const mapped: Review[] = content.map((r) => ({
        id: r.id,
        patientName: r.patientName || r.reviewerName || "Anonymous",
        initials: getInitials(r.patientName || r.reviewerName || ""),
        doctorName: r.doctorName || "—",
        rating: r.rating ?? 0,
        comment: r.comment || r.review || "No comment provided.",
        date: formatDate(r.createdAt || r.date),
      }));

      setReviews(mapped);
      setTotalPages(res?.data?.totalPages ?? 0);
      setTotalElements(res?.data?.totalElements ?? 0);
    } catch (e: any) {
      setError(e.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  // Derived summary
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const recommendRate =
    reviews.length > 0
      ? Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100)
      : 0;

  const doctorName = reviews.find((r) => r.doctorName !== "—")?.doctorName ?? "";

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Reviews & Feedback"
        subtitle={doctorName ? `Patient satisfaction for ${doctorName}` : "Patient satisfaction"}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
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
                <p className="text-4xl font-bold text-[#00685C]">{avgRating.toFixed(1)}</p>
                <div className="flex justify-center my-2">
                  <Stars rating={avgRating} size="w-5 h-5" />
                </div>
                <p className="text-sm text-[#3D4946]">Average Rating</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold text-[#0B1C30]">{totalElements}</p>
                <p className="text-sm text-[#3D4946] mt-2">Total Reviews</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold text-[#0B1C30]">{recommendRate}%</p>
                <p className="text-sm text-[#3D4946] mt-2">Recommend Rate</p>
              </div>
            </>
          )}
        </div>

        {/* Reviews grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-3">
                <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-1/2" />
                <div className="h-3 bg-[#F1F5F9] rounded animate-pulse" />
                <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto text-[#94A3B8] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-sm text-[#94A3B8]">No reviews yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F0FDFA] flex items-center justify-center text-sm font-bold text-[#00685C] flex-shrink-0">
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0B1C30]">{review.patientName}</p>
                      {review.doctorName !== "—" && (
                        <p className="text-xs text-[#94A3B8]">{review.doctorName}</p>
                      )}
                    </div>
                  </div>
                  <Stars rating={review.rating} size="w-4 h-4" />
                </div>
                <p className="text-sm text-[#485F83] italic leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <p className="text-xs text-[#94A3B8]">{review.date}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-[#3D4946]">Page {page + 1} of {totalPages}</span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {!loading && (
          <p className="text-sm text-[#3D4946]">
            Showing {reviews.length} of {totalElements} reviews
          </p>
        )}
      </main>
    </div>
  );
}
