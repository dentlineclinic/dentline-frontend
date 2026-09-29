"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  useBookingsByPatient,
  useCancelBooking,
} from "@/hooks/usePilates";
import { fetchPatients } from "@/services/patientService";
import type { PilatesBooking } from "@/services/pilatesService";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 10;

const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
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
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type PatientOption = {
  patientId: string;
  userId: string | null;
  name: string;
  email: string;
  phoneNumber: string;
};

export default function AdminPilatesBookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PatientOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "BOOKED" | "ATTENDED" | "CANCELLED" | "NO_SHOW"
  >("All");

  const [cancelTarget, setCancelTarget] = useState<PilatesBooking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const {
    data,
    isLoading,
    error: queryError,
  } = useBookingsByPatient(
    selectedPatient?.patientId ?? null,
    page,
    DEFAULT_PAGE_SIZE
  );

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
      : (queryError as Error).message || "Failed to load bookings."
    : null;

  // ── Patient search (debounced) ─────────────────────────────────────────

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetchPatients(0, 10, term);
        const mapped: PatientOption[] = (res.data?.content ?? []).map(
          (p: any) => ({
            patientId: p.id ?? p.patientId,
            userId: p.userId ?? null,
            name: p.fullName ?? p.name ?? "Unknown",
            email: p.email ?? "—",
            phoneNumber: p.phoneNumber ?? "—",
          })
        );
        setSearchResults(mapped);
      } catch (err) {
        console.error("Failed to search patients:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const selectPatient = (patient: PatientOption) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    setSearchTerm("");
    setPage(0);
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    setPage(0);
    setStatusFilter("All");
  };

  // ── Cancel ──────────────────────────────────────────────────────────────

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

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Pilates Bookings"
        subtitle="Search a patient to view their class bookings"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Patient selector */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-3">
            Select a Patient
          </p>

          {!selectedPatient ? (
            <div className="relative">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-2.5 pl-10 text-sm text-[#3D4946] outline-none focus:border-[#00685C]"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8]">
                  Searching…
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.patientId}
                      onClick={() => selectPatient(p)}
                      className="w-full text-left px-4 py-3 hover:bg-[#F8FAFC] border-b border-[#F1F5F9] last:border-b-0"
                    >
                      <p className="text-sm font-semibold text-[#0B1C30]">
                        {p.name}
                      </p>
                      <p className="text-xs text-[#94A3B8]">
                        {p.email} · {p.phoneNumber}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {searchTerm.trim().length >= 2 &&
                !searching &&
                searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-10 px-4 py-3">
                    <p className="text-xs text-[#94A3B8]">
                      No patients found.
                    </p>
                  </div>
                )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#CCFBF1] text-[#0F766E] text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {selectedPatient.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0B1C30]">
                    {selectedPatient.name}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    {selectedPatient.email} · {selectedPatient.phoneNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={clearSelectedPatient}
                className="text-xs font-semibold text-[#3D4946] px-3 py-2 rounded-lg hover:bg-[#F8FAFC]"
              >
                Change Patient
              </button>
            </div>
          )}
        </div>

        {/* Bookings */}
        {selectedPatient && (
          <>
            {/* Status filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mr-2">
                Filter:
              </span>
              {(["All", "BOOKED", "ATTENDED", "CANCELLED", "NO_SHOW"] as const).map(
                (option) => (
                  <button
                    key={option}
                    onClick={() => setStatusFilter(option)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      statusFilter === option
                        ? "bg-[#00685C] text-white"
                        : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {option === "All" ? "All" : option.replace("_", " ")}
                  </button>
                )
              )}
            </div>

            {error && (
              <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    <tr>
                      {[
                        "CLASS",
                        "SESSION DATE",
                        "BOOKED ON",
                        "SUBSCRIPTION",
                        "STATUS",
                        "ACTIONS",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-t border-[#F8FAFC]">
                          {[...Array(6)].map((__, j) => (
                            <td key={j} className="px-6 py-4">
                              <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-sm text-[#94A3B8]"
                        >
                          {statusFilter !== "All"
                            ? "No bookings match this filter."
                            : "No bookings yet for this patient."}
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-t border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-[#0B1C30]">
                            {booking.sessionName ?? "Session"}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#3D4946]">
                            {formatDate(booking.bookedAt)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#3D4946]">
                            {formatDateTime(booking.bookedAt)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#3D4946]">
                            {booking.subscriptionId ? (
                              <span className="text-xs font-semibold text-[#0D9488]">
                                Using subscription
                              </span>
                            ) : (
                              <span className="text-xs text-[#94A3B8]">
                                Pay-per-class
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
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
                          </td>
                          <td className="px-6 py-4">
                            {booking.status === "BOOKED" ? (
                              <button
                                onClick={() => openCancelModal(booking)}
                                className="text-sm font-semibold text-[#93000A] hover:underline"
                              >
                                Cancel
                              </button>
                            ) : (
                              <span className="text-sm text-[#94A3B8]">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

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
          </>
        )}

        {!selectedPatient && (
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
              Select a patient to view their bookings
            </p>
            <p className="text-xs text-[#94A3B8]">
              Use the search box above to find a patient.
            </p>
          </div>
        )}
      </main>

      {/* ── Cancel Booking Confirmation Modal ────────────────────────────── */}
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
                If a subscription credit was used, it will be refunded to the
                patient's account. The session will have one less booked spot.
              </p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-4 text-sm">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Class</span>
                  <span className="font-semibold text-[#0B1C30]">
                    {cancelTarget.sessionName ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Booked on</span>
                  <span className="font-semibold text-[#0B1C30]">
                    {formatDateTime(cancelTarget.bookedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}