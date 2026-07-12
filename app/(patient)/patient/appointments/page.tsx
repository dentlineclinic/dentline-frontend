"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { fetchMyAppointments, cancelAppointment, Appointment } from "@/services/patientService";
import { toast } from "react-toastify";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  BOOKED: "bg-[#E5EEFF] text-[#435B7E]",
  ASSIGNED: "bg-[#E5EEFF] text-[#435B7E]",
  ARRIVED: "bg-[#E5EEFF] text-[#435B7E]",
  COMPLETED: "bg-[#F0FDFA] text-[#0F766E]",
  CANCELLED: "bg-[#FFDAD6] text-[#93000A]",
  MISSED: "bg-[#FFDAD6] text-[#93000A]",
};

export default function AppointmentHistoryPage() {
  const [histories, setHistories] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  // Cancel state
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelAppointment(id);
      toast.success("Appointment cancelled.");
      // Update local state immediately — no need to refetch
      setHistories(prev =>
        prev.map(h => h.id === id ? { ...h, status: "CANCELLED" } : h)
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
    }
  };

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchMyAppointments(0, 10);

        if (res.success) {
          setHistories(res.data.content || []);
        } else {
          setError(res.message || "Failed to load appointments");
        }
      } catch (err) {
        setError("Failed to load appointments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const filteredHistories = histories.filter((h) => {
    if (statusFilter === "All") return true;
    // Map BOOK filter to include BOOKED, ASSIGNED, ARRIVED
    if (statusFilter === "BOOK") {
      return h.status === "BOOKED" || h.status === "ASSIGNED" || h.status === "ARRIVED";
    }
    return h.status === statusFilter;
  });

  // Count COMPLETED status
  const completedCount = histories.filter(h => h.status === "COMPLETED").length;
  
  // Count BOOK (includes BOOKED, ASSIGNED, ARRIVED)
  const bookCount = histories.filter(h => 
    h.status === "BOOKED" || h.status === "ASSIGNED" || h.status === "ARRIVED"
  ).length;
  
  const cancelledCount = histories.filter(h => h.status === "CANCELLED").length;
  const missedCount = histories.filter(h => h.status === "MISSED").length;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar 
        title="My Appointments" 
        subtitle="View all your scheduled and past appointments" 
      />

      <main className="flex-1 p-10 flex flex-col gap-6">
        {/* Statistics Cards */}
        {!loading && histories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#3D4946]">Total Appointments</p>
                  <p className="text-2xl font-bold text-[#0B1C30] mt-1">
                    {histories.length}
                  </p>
                  <p className="text-xs text-[#0D9488] mt-1">
                    {completedCount} completed
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#3D4946]">Appointment Status</p>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
                      <span className="text-xs text-[#3D4946]">Completed: {completedCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#435B7E]"></span>
                      <span className="text-xs text-[#3D4946]">Booked: {bookCount}</span>
                    </div>
                    {cancelledCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#93000A]"></span>
                        <span className="text-xs text-[#3D4946]">Cancelled: {cancelledCount}</span>
                      </div>
                    )}
                    {missedCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#93000A]"></span>
                        <span className="text-xs text-[#3D4946]">Missed: {missedCount}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#3D4946]">Upcoming</p>
                  <p className="text-2xl font-bold text-[#0B1C30] mt-1">
                    {bookCount}
                  </p>
                  <p className="text-xs text-[#3D4946] mt-1">
                    active appointments
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-3 flex-wrap">
          {["All", "BOOK", "COMPLETED", "CANCELLED", "MISSED"].map((f) => {
            // Only show status filter if there are appointments with that status
            let hasStatus = false;
            if (f === "BOOK") {
              hasStatus = histories.some(h => 
                h.status === "BOOKED" || h.status === "ASSIGNED" || h.status === "ARRIVED"
              );
            } else if (f === "COMPLETED") {
              hasStatus = histories.some(h => h.status === "COMPLETED");
            } else if (f === "CANCELLED") {
              hasStatus = histories.some(h => h.status === "CANCELLED");
            } else if (f === "MISSED") {
              hasStatus = histories.some(h => h.status === "MISSED");
            } else {
              hasStatus = histories.length > 0;
            }
            
            if (f !== "All" && !hasStatus) return null;
            
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  f === statusFilter
                    ? "bg-[#00685C] text-white"
                    : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
                }`}
              >
                {f === "All" ? "All Appointments" : f === "BOOK" ? "Booked (Booked/Assigned/Arrived)" : f}
              </button>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-4 bg-[#F1F5F9] rounded w-40" />
                      <div className="h-3 bg-[#F1F5F9] rounded w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-[#F1F5F9] rounded w-24" />
                      <div className="h-3 bg-[#F1F5F9] rounded w-16" />
                    </div>
                    <div className="h-6 bg-[#F1F5F9] rounded-full w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredHistories.length === 0 ? (
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 shadow-sm text-center">
            <svg
              className="w-16 h-16 mx-auto text-[#94A3B8] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm text-[#94A3B8] mb-2">No appointments found</p>
            <p className="text-xs text-[#94A3B8]">
              {statusFilter !== "All" ? "Try changing the filter" : "Book your first appointment to get started"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredHistories.map((history) => (
              <div
                key={history.id}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-[#00685C]"
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
                    <div>
                      <p className="text-base font-semibold text-[#0B1C30]">
                        Appointment #{history.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-[#00685C] font-medium mt-1">
                        {new Date(history.appointmentDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-[#3D4946] mt-1">
                        Booked on: {new Date(history.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-left md:text-right">
                      <p className="text-sm font-semibold text-[#0B1C30]">Status</p>
                      <span
                        className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-1 ${
                          statusColors[history.status] || "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {history.status}
                      </span>
                    </div>

                    {/* Cancel — only for BOOKED appointments */}
                    {history.status === "BOOKED" && (
                      <div className="flex flex-col items-end gap-1">
                        {confirmCancelId === history.id ? (
                          // Inline confirmation
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#93000A] font-semibold">Confirm cancel?</span>
                            <button
                              onClick={() => handleCancel(history.id)}
                              disabled={cancellingId === history.id}
                              className="text-xs font-bold text-white bg-[#93000A] px-3 py-1 rounded-lg hover:bg-[#BA1A1A] transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              {cancellingId === history.id && (
                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                              )}
                              Yes, cancel
                            </button>
                            <button
                              onClick={() => setConfirmCancelId(null)}
                              className="text-xs font-semibold text-[#3D4946] px-3 py-1 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                            >
                              Keep
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmCancelId(history.id)}
                            className="text-xs font-semibold text-[#93000A] hover:underline"
                          >
                            Cancel appointment
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && histories.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#3D4946]">
              Showing {filteredHistories.length} of {histories.length} appointments
            </p>
            {statusFilter !== "All" && filteredHistories.length > 0 && (
              <button
                onClick={() => setStatusFilter("All")}
                className="text-xs text-[#0D9488] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}