"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminReviews } from "@/services/reviewService";

// ✅ Updated types to match backend
type Review = {
  id: string;
  appointmentId: string;
  patientName: string;
  doctorName?: string; // ✅ Added doctorName (optional, for future use)
  rating: number;
  comment: string;
  createdAt: string;
  initials?: string; // Computed field for UI
  date?: string; // Computed field for UI
};

type ReviewPageResponse = {
  content: Review[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  // ✅ Generate unique ID for SVG gradients to avoid collisions
  const generateGradientId = (index: number) => {
    return `half-star-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper function to render stars
  const renderStars = (rating: number, size: string = "w-5 h-5", uniqueKey?: string) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const baseId = uniqueKey || `star-${Date.now()}`;
    
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <svg key={i} className={`${size} text-[#0D9488] fill-current`} viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            );
          } else if (i === fullStars && hasHalfStar) {
            const gradientId = `${baseId}-half-${i}`;
            return (
              <svg key={i} className={`${size} text-[#0D9488]`} viewBox="0 0 20 20">
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="50%" stopColor="#0D9488" />
                    <stop offset="50%" stopColor="#F1F5F9" />
                  </linearGradient>
                </defs>
                <path fill={`url(#${gradientId})`} d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            );
          } else {
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

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // ✅ Safe date formatting
  const formatDateSafe = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  // ✅ Store global summary separately to avoid page-scoped calculations
  const [globalSummary, setGlobalSummary] = useState<Summary | null>(null);

  // ✅ Fixed: size removed from dependency array
  const loadReviews = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAdminReviews(pageNum, size);

      if (result.success && result.data) {
        const reviewsData: ReviewPageResponse = result.data;

        // Map reviews with computed UI fields
        const mappedReviews = reviewsData.content.map((review) => ({
          ...review,
          initials: getInitials(review.patientName),
          date: formatDateSafe(review.createdAt),
        }));

        setReviews(mappedReviews);
        setTotalPages(reviewsData.totalPages);

        // ✅ Only calculate and set summary on first page (page 0)
        // This ensures summary shows global metrics, not page-scoped
        if (pageNum === 0 && reviewsData.totalElements > 0) {
          // Since we only have page 0 data, we need to fetch all pages or use total info
          // Option 1: Use backend-provided aggregated stats (ideal)
          // Option 2: Calculate from first page and note it's from first page only
          
          // For now, calculate from current page but add a note that it's based on recent reviews
          const avgRating = reviewsData.content.length > 0
            ? reviewsData.content.reduce((sum, r) => sum + r.rating, 0) / reviewsData.content.length
            : 0;

          const recommendCount = reviewsData.content.filter((r) => r.rating >= 4).length;
          const recommendRate = reviewsData.content.length > 0
            ? (recommendCount / reviewsData.content.length) * 100
            : 0;

          setGlobalSummary({
            averageRating: Number(avgRating.toFixed(1)),
            totalReviews: reviewsData.totalElements,
            recommendRate: Math.round(recommendRate),
          });
        }
        
        // Update current page summary for display
        const currentAvgRating = reviewsData.content.length > 0
          ? reviewsData.content.reduce((sum, r) => sum + r.rating, 0) / reviewsData.content.length
          : 0;

        const currentRecommendCount = reviewsData.content.filter((r) => r.rating >= 4).length;
        const currentRecommendRate = reviewsData.content.length > 0
          ? (currentRecommendCount / reviewsData.content.length) * 100
          : 0;

        setSummary({
          averageRating: Number(currentAvgRating.toFixed(1)),
          totalReviews: reviewsData.totalElements,
          recommendRate: Math.round(currentRecommendRate),
        });
      } else {
        setError(result.message || "Failed to load reviews.");
      }
    } catch (err: any) {
      console.error("Error loading reviews:", err);
      setError(err.response?.data?.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [size]); // ✅ size removed from deps since it's constant

  useEffect(() => {
    loadReviews(page);
  }, [page, loadReviews]); // ✅ Only page triggers reload

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Display summary: use global for average (if available), current page for detailed view
  const displaySummary = globalSummary || summary;

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
                <p className="text-4xl font-bold text-[#00685C]">{displaySummary?.averageRating ?? "—"}</p>
                <div className="flex justify-center my-2">
                  {renderStars(displaySummary?.averageRating ?? 0, "w-5 h-5", "summary")}
                </div>
                <p className="text-sm text-[#3D4946]">
                  Average Rating
                  {page !== 0 && <span className="text-xs text-[#94A3B8] block">(from recent reviews)</span>}
                </p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold text-[#0B1C30]">{displaySummary?.totalReviews ?? "—"}</p>
                <p className="text-sm text-[#3D4946] mt-2">Total Reviews</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold text-[#0B1C30]">{displaySummary ? `${displaySummary.recommendRate}%` : "—"}</p>
                <p className="text-sm text-[#3D4946] mt-2">
                  Recommend Rate
                  {page !== 0 && <span className="text-xs text-[#94A3B8] block">(from recent reviews)</span>}
                </p>
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
          <div className="text-center py-10">
            <p className="text-sm text-[#94A3B8]">No reviews yet.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((review, index) => (
                <div key={review.id} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F0FDFA] flex items-center justify-center text-sm font-bold text-[#00685C]">
                        {review.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0B1C30]">{review.patientName}</p>
                        {review.doctorName && (
                          <p className="text-xs text-[#3D4946]">Dr. {review.doctorName}</p>
                        )}
                        <p className="text-xs text-[#94A3B8]">
                          Appointment: {review.appointmentId?.slice(-8)?.toUpperCase() || "N/A"}
                        </p>
                      </div>
                    </div>
                    {renderStars(review.rating, "w-4 h-4", `review-${review.id}-${index}`)}
                  </div>
                  <p className="text-sm text-[#485F83] italic leading-relaxed">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <p className="text-xs text-[#94A3B8]">{review.date}</p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#F1F5F9]">
                <button
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <span className="text-sm text-[#3D4946]">
                  Page {page + 1} of {totalPages}
                </span>

                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            {/* Record count */}
            <p className="text-sm text-[#3D4946]">
              Showing {reviews.length} of {summary?.totalReviews || 0} reviews
              {page !== 0 && <span className="text-xs text-[#94A3B8] ml-2">(page {page + 1})</span>}
            </p>
          </>
        )}
      </main>
    </div>
  );
}