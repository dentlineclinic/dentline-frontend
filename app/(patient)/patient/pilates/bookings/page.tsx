"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import { useMyBookings, useCancelBooking } from "@/hooks/usePilates";
import type { PilatesBooking } from "@/services/pilatesService";

export const dynamic = "force-dynamic";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const STATUS_STYLES: Record<string, string> = {
  BOOKED: "bg-[#E5EEFF] text-[#1E40AF]",
  ATTENDED: "bg-[#DCFCE7] text-[#166534]",
  CANCELLED: "bg-[#F1F5F9] text-[#64748B]",
  NO_SHOW: "bg-[#FFDAD6] text-[#93000A]",
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PatientPilatesBookingsPage() {
  const [page, setPage] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<PilatesBooking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useMyBookings(page, 10);

  const bookings: PilatesBooking[] = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const currentPage = data?.data?.number ?? 0;
  const totalElements = data?.data?.totalElements ?? 0;

  const cancelBooking = useCancelBooking();

  const error = queryError
    ? (queryError as Error).message || "Failed to load bookings."
    : null;

  const openCancelModal = (booking: PilatesBooking) => {
    setCancelTarget(booking);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelBooking.mutateAsync(cancelTarget.id);
      toast.success("Booking cancelled. Your credit has been refunded.");
      setShowCancelModal(false);
      setCancelTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="My Pilates Bookings"
        subtitle={
          totalElements > 0
            ? `${totalElements} booking${totalElements === 1 ? "" : "s"}`
            : "Your booked sessions"
        }
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Quick link to browse classes */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-[#3D4946]">
            Cancellations are allowed up to 48 hours before a session starts.
          </p>
          <Link
            href="/patient/pilates"
            className="text-sm font-semibold text-[#00685C] hover:underline whitespace-nowrap"
          >
            ← Browse Classes
          </Link>
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
                className="h-20 bg-[#F1F5F9] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-12 text-center shadow-sm">
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
              No bookings yet
            </p>
            <p className="text-xs text-[#94A3B8] mb-4">
              Browse available classes and book your first session.
            </p>
            <Link
              href="/patient/pilates"
              className="inline-block bg-[#00685C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#008375] transition-colors"
            >
              Browse Classes
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((booking) => {
              const canCancel = booking.status === "BOOKED";
              return (
                <div
                  key={booking.id}
                  className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {/* Status dot */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                        booking.status === "ATTENDED"
                          ? "bg-[#166534]"
                          : booking.status === "BOOKED"
                          ? "bg-[#1E40AF]"
                          : booking.status === "NO_SHOW"
                          ? "bg-[#93000A]"
                          : "bg-[#94A3B8]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-bold text-[#0B1C30]">
                          {booking.sessionName ?? "Pilates Session"}
                        </p>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            STATUS_STYLES[booking.status] ??
                            "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8]">
                        Booked {formatDate(booking.bookedAt)}
                      </p>
                    </div>
                  </div>

                  {canCancel && (
                    <button
                      onClick={() => openCancelModal(booking)}
                      className="text-xs font-semibold text-[#93000A] hover:underline whitespace-nowrap flex-shrink-0"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={currentPage === 0}
              className="bg-gray-100 text-[#3D4946] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-[#3D4946]">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={currentPage >= totalPages - 1}
              className="bg-[#00685C] text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-[#008375] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* ── Cancel confirmation modal ────────────────────────────────── */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
        subtitle="Your credit will be refunded"
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
              className="bg-[#93000A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-800 disabled:opacity-50"
            >
              {cancelBooking.isPending ? "Cancelling…" : "Yes, Cancel"}
            </button>
          </>
        }
      >
        <p className="text-sm text-[#3D4946]">
          Cancel your booking for{" "}
          <strong>
            {cancelTarget?.sessionName ?? "this session"}
          </strong>
          ? If it's within 48 hours of the session, the server will reject this
          request.
        </p>
      </Modal>
    </div>
  );
}
