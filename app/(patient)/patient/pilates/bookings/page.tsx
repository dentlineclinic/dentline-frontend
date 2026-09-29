"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import {
  useMyBookings,
  useCancelBooking,
} from "@/hooks/usePilates";
import type { PilatesBooking } from "@/services/pilatesService";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  "All",
  "BOOKED",
  "ATTENDED",
  "CANCELLED",
  "NO_SHOW",
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number];

const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function PatientBookingsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [cancelTarget, setCancelTarget] = useState<PilatesBooking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const {
    data,
    isLoading,
    error: queryError,
  } = useMyBookings(page, DEFAULT_PAGE_SIZE);

  const cancelBooking = useCancelBooking();

  const bookings = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const currentPage = data?.data?.number ?? 0;
  const totalElements = data?.data?.totalElements ?? bookings.length;

  const filteredBookings =
    statusFilter === "All"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const error = queryError
    ? typeof queryError === "string"
      ? queryError
      : (queryError as Error).message || "Failed to load your bookings."
    : null;

  const openCancelModal = (booking: PilatesBooking) => {
    setCancelTarget(booking);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelBooking.mutateAsync(cancelTarget.id);
      toast.success("Booking cancelled. Any used credit has been refunded.");
      setShowCancelModal(false);
      setCancelTarget(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel booking");
    }
  };

  const goToPreviousPage = () => {
    setPage((current) => Math.max(current - 1, 0));
  };

  const goToNextPage = () => {
    setPage((current) => Math.min(current + 1, totalPages - 1));
  };

  // Count for the filter pills
  const counts = {
    All: bookings.length,
    BOOKED: bookings.filter((b) => b.status === "BOOKED").length,
    ATTENDED: bookings.filter((b) => b.status === "ATTENDED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
    NO_SHOW: bookings.filter((b) => b.status === "NO_SHOW").length,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="My Pilates Bookings"
        subtitle={`${totalElements} booking${totalElements === 1 ? "" : "s"}`}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Back + new booking */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/patient/pilates"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00685C] hover:underline"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Classes
          </Link>
          <Link
            href="/patient/pilates"
            className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#008375] transition-colors"
          >
            Book New Session
          </Link>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setStatusFilter(option)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                statusFilter === option
                  ? "bg-[#00685C] text-white"
                  : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
              }`}
            >
              {option === "All"
                ? `All (${counts.All})`
                : `${option.replace("_", " ")} (${counts[option]})`}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Bookings list */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm"
              >
                <div className="h-5 bg-[#F1F5F9] rounded animate-pulse w-1/2 mb-3" />
                <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-2/3 mb-2" />
                <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto bg-[#F0FDFA] rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-[#0D9488]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#0B1C30] mb-1">
              {statusFilter !== "All"
                ? `No ${statusFilter.toLowerCase().replace("_", " ")} bookings.`
                : "You have no bookings yet."}
            </p>
            {statusFilter === "All" && (
              <>
                <p className="text-xs text-[#94A3B8] mb-4">
                  Browse classes and book your first session.
                </p>
                <Link
                  href="/patient/pilates"
                  className="inline-block bg-[#00685C] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#008375]"
                >
                  Browse Classes
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left — session info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        booking.status === "ATTENDED"
                          ? "bg-[#DCFCE7]"
                          : booking.status === "CANCELLED"
                          ? "bg-[#F1F5F9]"
                          : booking.status === "NO_SHOW"
                          ? "bg-[#FFDAD6]"
                          : "bg-[#F0FDFA]"
                      }`}
                    >
                      {booking.status === "ATTENDED" ? (
                        <svg
                          className="w-5 h-5 text-[#166534]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : booking.status === "CANCELLED" ? (
                        <svg
                          className="w-5 h-5 text-[#64748B]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      ) : booking.status === "NO_SHOW" ? (
                        <svg
                          className="w-5 h-5 text-[#93000A]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-[#0F766E]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0B1C30]">
                        {booking.sessionName ?? "Session"}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        Booked on {formatDateTime(booking.bookedAt)}
                      </p>
                      {booking.subscriptionId && (
                        <p className="text-xs text-[#0F766E] font-semibold mt-1">
                          Paid with subscription
                        </p>
                      )}
                      {booking.cancelledAt && (
                        <p className="text-xs text-[#94A3B8] mt-1">
                          Cancelled on {formatDateTime(booking.cancelledAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right — status + action */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        booking.status === "BOOKED"
                          ? "bg-[#E5EEFF] text-[#1E40AF]"
                          : booking.status === "ATTENDED"
                          ? "bg-[#DCFCE7] text-[#166534]"
                          : booking.status === "NO_SHOW"
                          ? "bg-[#FFDAD6] text-[#93000A]"
                          : "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                    {booking.status === "BOOKED" && (
                      <button
                        onClick={() => openCancelModal(booking)}
                        className="text-xs font-semibold text-[#93000A] hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="bg-gray-100 text-[#3D4946] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-[#3D4946]">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className="bg-[#00685C] text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-[#008375] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* ── Cancel Booking Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowCancelModal(false)}
              className="text-sm font-semibold text-[#3D4946] px-4 py-2 rounded-lg hover:bg-[#F8FAFC]"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelBooking.isPending}
              className="bg-[#93000A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#BA1A1A] disabled:opacity-50"
            >
              {cancelBooking.isPending ? "Cancelling…" : "Cancel Booking"}
            </button>
          </>
        }
      >
        {cancelTarget && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#FFDAD6] border border-[#FCA5A5] rounded-lg p-4">
              <p className="text-sm font-bold text-[#93000A] mb-1">
                Cancel this booking?
              </p>
              <p className="text-xs text-[#3D4946]">
                {cancelTarget.subscriptionId
                  ? "The credit used for this booking will be refunded to your subscription."
                  : "You will not be charged for this booking."}
              </p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Class</span>
                <span className="font-semibold text-[#0B1C30]">
                  {cancelTarget.sessionName ?? "—"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}