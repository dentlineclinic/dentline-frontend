"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import {
  useSessionsByDateRange,
  usePilatesSessionCalendar,
  useCancelSession,
} from "@/hooks/usePilates";
import type { PilatesSession } from "@/services/pilatesService";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import SessionDayDrawer from "./SessionDayDrawer";
import { formatDisplayDate, formatTime } from "./types";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 20;

type ViewMode = "table" | "calendar";

const todayISO = () => new Date().toISOString().slice(0, 10);

const daysFromNowISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function AdminPilatesSessionsPage() {
  const now = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // ── TABLE STATE ──────────────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(daysFromNowISO(30));
  const [statusFilter, setStatusFilter] = useState<
    "All" | "SCHEDULED" | "COMPLETED" | "CANCELLED"
  >("All");

  // ── CALENDAR STATE ───────────────────────────────────────────────────────
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ── SHARED: Cancel session modal ─────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState<PilatesSession | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────
  const {
    data: tableData,
    isLoading: tableLoading,
    error: tableError,
    refetch: refetchTable,
  } = useSessionsByDateRange(startDate, endDate, page, DEFAULT_PAGE_SIZE);

  const {
    data: calendarData,
    isLoading: calendarLoading,
    error: calendarError,
    refetch: refetchCalendar,
  } = usePilatesSessionCalendar(year, month);

  const cancelSession = useCancelSession();

  // ── Table derived values ─────────────────────────────────────────────────
  const sessions = tableData?.data?.content ?? [];
  const totalPages = tableData?.data?.totalPages ?? 1;
  const currentPage = tableData?.data?.number ?? 0;
  const totalElements = tableData?.data?.totalElements ?? sessions.length;

  const filteredSessions = useMemo(() => {
    if (statusFilter === "All") return sessions;
    return sessions.filter((s) => s.status === statusFilter);
  }, [sessions, statusFilter]);

  const tableErr = tableError
    ? typeof tableError === "string"
      ? tableError
      : (tableError as Error).message || "Failed to load sessions."
    : null;

  const calendarErr = calendarError
    ? typeof calendarError === "string"
      ? calendarError
      : (calendarError as Error).message || "Failed to load calendar."
    : null;

  // Reset page when the date range changes (table mode only)
  useEffect(() => {
    setPage(0);
  }, [startDate, endDate]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openCancelModal = (session: PilatesSession) => {
    setCancelTarget(session);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelSession.mutateAsync(cancelTarget.id);
      toast.success("Session cancelled. Booked patients will be notified.");
      setShowCancelModal(false);
      setCancelTarget(null);
      // Refresh whichever view is active
      if (viewMode === "table") refetchTable();
      else refetchCalendar();
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel session");
    }
  };

  const goToPreviousPage = () =>
    setPage((current) => Math.max(current - 1, 0));
  const goToNextPage = () =>
    setPage((current) => Math.min(current + 1, totalPages - 1));

  const quickRange = (days: number) => {
    setStartDate(todayISO());
    setEndDate(daysFromNowISO(days));
  };

  const handleCalendarNavigate = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setSelectedDate(null);
  };

  const handleDayClick = (date: string) => {
    setSelectedDate((prev) => (prev === date ? null : date));
  };

  const closeDayDrawer = () => setSelectedDate(null);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Pilates Sessions"
        subtitle={
          viewMode === "table"
            ? `${totalElements} session${totalElements === 1 ? "" : "s"} in range`
            : `Calendar view`
        }
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* ── View toggle ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 bg-[#F8FAFC] p-1 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === "table"
                  ? "bg-white text-[#00685C] shadow-sm"
                  : "text-[#3D4946] hover:text-[#00685C]"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === "calendar"
                  ? "bg-white text-[#00685C] shadow-sm"
                  : "text-[#3D4946] hover:text-[#00685C]"
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* ── TABLE MODE ─────────────────────────────────────────────── */}
        {viewMode === "table" && (
          <>
            {/* Filters */}
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div>
                  <label className="block text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white border border-[#F1F5F9] rounded-lg px-3 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white border border-[#F1F5F9] rounded-lg px-3 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-1.5">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as typeof statusFilter)
                    }
                    className="bg-white border border-[#F1F5F9] rounded-lg px-3 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => quickRange(7)}
                  className="text-xs font-semibold text-[#3D4946] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 rounded-lg hover:bg-[#E2E8F0]"
                >
                  Next 7 days
                </button>
                <button
                  onClick={() => quickRange(30)}
                  className="text-xs font-semibold text-[#3D4946] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 rounded-lg hover:bg-[#E2E8F0]"
                >
                  Next 30 days
                </button>
                <button
                  onClick={() => quickRange(90)}
                  className="text-xs font-semibold text-[#3D4946] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 rounded-lg hover:bg-[#E2E8F0]"
                >
                  Next 90 days
                </button>
              </div>
            </div>

            {tableErr && (
              <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                {tableErr}
              </div>
            )}

            {/* Table */}
            <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    <tr>
                      {["DATE", "TIME", "CLASS", "CAPACITY", "STATUS", "ACTIONS"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {tableLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-t border-[#F8FAFC]">
                          {[...Array(6)].map((__, j) => (
                            <td key={j} className="px-6 py-4">
                              <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredSessions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-sm text-[#94A3B8]"
                        >
                          {statusFilter !== "All"
                            ? "No sessions match this status in the selected date range."
                            : "No sessions in this date range. Generate sessions from the Classes page."}
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((session) => {
                        const isFull =
                          session.bookedCount >= session.capacity;
                        const available = Math.max(
                          0,
                          session.capacity - session.bookedCount
                        );
                        return (
                          <tr
                            key={session.id}
                            className="border-t border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-[#0B1C30]">
                              {formatDisplayDate(session.sessionDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#3D4946]">
                              {formatTime(session.startTime)}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-[#0B1C30]">
                                {session.className ?? "—"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-semibold ${
                                    isFull
                                      ? "text-[#93000A]"
                                      : "text-[#0B1C30]"
                                  }`}
                                >
                                  {session.bookedCount}/{session.capacity}
                                </span>
                                {isFull && (
                                  <span className="text-xs font-bold text-[#93000A] bg-[#FFDAD6] px-2 py-0.5 rounded">
                                    Full
                                  </span>
                                )}
                                {!isFull && available <= 3 && (
                                  <span className="text-xs font-bold text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded">
                                    {available} left
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-full ${
                                  session.status === "SCHEDULED"
                                    ? "bg-[#E5EEFF] text-[#1E40AF]"
                                    : session.status === "COMPLETED"
                                      ? "bg-[#DCFCE7] text-[#166534]"
                                      : "bg-[#F1F5F9] text-[#64748B]"
                                }`}
                              >
                                {session.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {session.status === "SCHEDULED" ? (
                                <button
                                  onClick={() => openCancelModal(session)}
                                  className="text-sm font-semibold text-[#93000A] hover:underline"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <span className="text-sm text-[#94A3B8]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {!tableLoading && totalPages > 1 && (
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

        {/* ── CALENDAR MODE ──────────────────────────────────────────── */}
        {viewMode === "calendar" && (
          <>
            {calendarErr && (
              <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                {calendarErr}
              </div>
            )}

            {calendarLoading || !calendarData ? (
              <div className="bg-white border border-[#F1F5F9] rounded-2xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 border-b border-[#F1F5F9]">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div
                      key={d}
                      className="py-3 text-center text-xs font-bold text-[#94A3B8] tracking-widest uppercase"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {[...Array(35)].map((_, i) => (
                    <div
                      key={i}
                      className="border-b border-r border-[#F9FAFB] p-2 sm:p-3 min-h-[90px] sm:min-h-[120px]"
                    >
                      <div className="h-5 w-5 bg-[#F1F5F9] rounded animate-pulse mb-2" />
                      <div className="hidden sm:block space-y-1">
                        <div className="h-2 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
                        <div className="h-2 bg-[#F1F5F9] rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <CalendarHeader
                  calendarData={calendarData.data}
                  onNavigate={handleCalendarNavigate}
                />
                <CalendarGrid
                  calendarData={calendarData.data}
                  selectedDate={selectedDate}
                  onSelectDate={handleDayClick}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Overlay (calendar day drawer) ────────────────────────────── */}
      {selectedDate && viewMode === "calendar" && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-30"
          onClick={closeDayDrawer}
        />
      )}

      {/* ── Day drawer ────────────────────────────────────────────────── */}
      {selectedDate && viewMode === "calendar" && (
        <SessionDayDrawer
          date={selectedDate}
          onClose={closeDayDrawer}
          onRefresh={() => {
            refetchCalendar();
          }}
          onCancelSession={openCancelModal}
        />
      )}

      {/* ── Cancel Confirmation Modal ─────────────────────────────────── */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Session"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowCancelModal(false)}
              className="text-sm font-semibold text-[#3D4946] px-4 py-2 rounded-lg hover:bg-[#F8FAFC]"
            >
              Keep Session
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelSession.isPending}
              className="bg-[#93000A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#BA1A1A] disabled:opacity-50"
            >
              {cancelSession.isPending ? "Cancelling…" : "Cancel Session"}
            </button>
          </>
        }
      >
        {cancelTarget && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#FFDAD6] border border-[#FCA5A5] rounded-lg p-4">
              <p className="text-sm font-bold text-[#93000A] mb-1">
                This will cancel the session
              </p>
              <p className="text-xs text-[#3D4946]">
                All {cancelTarget.bookedCount} booked patient
                {cancelTarget.bookedCount === 1 ? "" : "s"} will receive a
                cancellation notification. Any credits used will be refunded.
              </p>
            </div>

            <div className="bg-[#F8FAFC] rounded-lg p-4">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Class</span>
                  <span className="font-semibold text-[#0B1C30]">
                    {cancelTarget.className ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Date</span>
                  <span className="font-semibold text-[#0B1C30]">
                    {formatDisplayDate(cancelTarget.sessionDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Time</span>
                  <span className="font-semibold text-[#0B1C30]">
                    {formatTime(cancelTarget.startTime)}
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