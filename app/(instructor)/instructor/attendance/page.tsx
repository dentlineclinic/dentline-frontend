"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import {
  useMyUpcomingSessions,
  useBookingsBySession,
  useMarkAttendance,
} from "@/hooks/usePilates";
import type { PilatesSession, PilatesBooking } from "@/services/pilatesService";

export const dynamic = "force-dynamic";

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (time: string) => time?.slice(0, 5) ?? "—";

const getInitials = (name: string) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function InstructorAttendancePage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  // 1. Load instructor's own upcoming sessions (default: next 30 days)
  const {
    data: sessionsData,
    isLoading: loadingSessions,
  } = useMyUpcomingSessions();

  const sessions: PilatesSession[] = sessionsData?.data ?? [];

  // 2. Load bookings for the selected session
  const {
    data: bookingsData,
    isLoading: loadingBookings,
    refetch: refetchBookings,
  } = useBookingsBySession(selectedSessionId || null);

  const bookings: PilatesBooking[] = bookingsData?.data ?? [];

  // 3. Mutation for marking attendance
  const markAttendance = useMarkAttendance();

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const handleMark = async (bookingId: string, attended: boolean) => {
    try {
      await markAttendance.mutateAsync({
        bookingId,
        payload: { attended },
      });
      toast.success(attended ? "Marked as attended" : "Marked as no-show");
      await refetchBookings();
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark attendance");
    }
  };

  const attendedCount = bookings.filter((b) => b.status === "ATTENDED").length;
  const noShowCount = bookings.filter((b) => b.status === "NO_SHOW").length;
  const stillBookedCount = bookings.filter((b) => b.status === "BOOKED").length;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Mark Attendance"
        subtitle="Pick a session, then mark each student"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Step 1 — Select Session */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#00685C] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              1
            </div>
            <p className="text-sm font-bold text-[#0B1C30]">Select a Session</p>
          </div>

          {loadingSessions ? (
            <div className="h-10 bg-[#F1F5F9] rounded animate-pulse" />
          ) : sessions.length === 0 ? (
            <p className="text-sm text-[#94A3B8] italic">
              No upcoming sessions in the next 30 days.
            </p>
          ) : (
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            >
              <option value="">Choose a session…</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {formatDisplayDate(session.sessionDate)} · {formatTime(session.startTime)}{" "}
                  — {session.className ?? "Class"}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Step 2 — Roster */}
        {selectedSessionId && (
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#00685C] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#0B1C30]">Mark Attendance</p>
                {selectedSession && (
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {selectedSession.className} ·{" "}
                    {formatDisplayDate(selectedSession.sessionDate)} ·{" "}
                    {formatTime(selectedSession.startTime)}
                  </p>
                )}
              </div>
            </div>

            {bookings.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-[#DCFCE7] rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-[#166534]">{attendedCount}</p>
                  <p className="text-xs text-[#166534] font-semibold">Attended</p>
                </div>
                <div className="bg-[#FFDAD6] rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-[#93000A]">{noShowCount}</p>
                  <p className="text-xs text-[#93000A] font-semibold">No Show</p>
                </div>
                <div className="bg-[#E5EEFF] rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-[#1E40AF]">{stillBookedCount}</p>
                  <p className="text-xs text-[#1E40AF] font-semibold">Unmarked</p>
                </div>
              </div>
            )}

            {loadingBookings ? (
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-[#F1F5F9] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#94A3B8]">No bookings for this session yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {bookings.map((booking) => {
                  const patientName = booking.patientName ?? "Unknown Patient";
                  const isAttended = booking.status === "ATTENDED";
                  const isNoShow = booking.status === "NO_SHOW";
                  const isCancelled = booking.status === "CANCELLED";

                  return (
                    <div
                      key={booking.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                        isCancelled
                          ? "bg-[#F8FAFC] border-[#F1F5F9] opacity-60"
                          : isAttended
                            ? "bg-[#F0FDFA] border-[#D1FAE5]"
                            : isNoShow
                              ? "bg-[#FEF2F2] border-[#FCA5A5]"
                              : "bg-white border-[#F1F5F9] hover:border-[#E2E8F0]"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-[#CCFBF1] text-[#0F766E] text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {getInitials(patientName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0B1C30] truncate">
                          {patientName}
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                          {isCancelled
                            ? "Booking cancelled"
                            : isAttended
                              ? "Attended"
                              : isNoShow
                                ? "Marked as no-show"
                                : "Awaiting attendance"}
                        </p>
                      </div>

                      {isCancelled ? (
                        <span className="text-xs font-bold text-[#64748B] bg-[#F1F5F9] px-3 py-1 rounded-full">
                          Cancelled
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleMark(booking.id, true)}
                            disabled={markAttendance.isPending || isAttended}
                            className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                              isAttended
                                ? "bg-[#166534] text-white"
                                : "bg-[#DCFCE7] text-[#166534] hover:bg-[#A7F3D0]"
                            } disabled:opacity-70`}
                          >
                            ✓ Attended
                          </button>
                          <button
                            onClick={() => handleMark(booking.id, false)}
                            disabled={markAttendance.isPending || isNoShow}
                            className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                              isNoShow
                                ? "bg-[#93000A] text-white"
                                : "bg-[#FFDAD6] text-[#93000A] hover:bg-[#FCA5A5]"
                            } disabled:opacity-70`}
                          >
                            ✕ No Show
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!selectedSessionId && !loadingSessions && sessions.length > 0 && (
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 shadow-sm text-center">
            <p className="text-sm font-semibold text-[#0B1C30] mb-1">
              Ready to mark attendance
            </p>
            <p className="text-xs text-[#94A3B8]">Pick a session above to begin.</p>
          </div>
        )}
      </main>
    </div>
  );
}