"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import { 
  fetchDoctorAppointments, 
  fetchAssignedDoctorAppointments,
  searchDoctorAppointments 
} from "@/services/doctorService";

export const dynamic = "force-dynamic";

type Appointment = {
  id: string;
  shortId: string;
  patientName: string;
  initials: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
  reason: string;
  rawDate?: string;
};

const STATUS_COLORS: Record<string, string> = {
  BOOKED:      "bg-[#E5EEFF] text-[#1E40AF]",
  ARRIVAL:     "bg-[#F0FDFA] text-[#0F766E]",
  ASSIGNED:    "bg-[#FEF3C7] text-[#92400E]",
  COMPLETED:   "bg-[#DCFCE7] text-[#166534]",
  CANCELLED:   "bg-[#F1F5F9] text-[#475569]",
  MISSED:      "bg-[#FFDAD6] text-[#93000A]",
  IN_PROGRESS: "bg-[#FEF3C7] text-[#92400E]",
};

type ViewMode = 'all' | 'assigned';

function formatDate(raw: string | null | undefined) {
  if (!raw) return { date: "—", time: "—" };
  const d = new Date(raw);
  if (isNaN(d.getTime())) return { date: "—", time: "—" };
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function getInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const size = 20;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isInitialLoad = useRef(true);

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async (p: number, searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      
      // If searching, use search API
      if (searchTerm.trim()) {
        setIsSearching(true);
        res = await searchDoctorAppointments(searchTerm.trim(), p, size);
      } else {
        setIsSearching(false);
        // Choose which API to call based on view mode
        res = viewMode === 'all' 
          ? await fetchDoctorAppointments(p, size)
          : await fetchAssignedDoctorAppointments(p, size);
      }
      
      const content: any[] = res.data?.content ?? [];

      const mapped: Appointment[] = content.map((a) => {
        const { date, time } = formatDate(a.appointmentDate);
        return {
          id: `APT-${a.id.slice(0, 6).toUpperCase()}`,
          shortId: a.id,
          patientName: a.patientName || "Unknown",
          initials: getInitials(a.patientName || ""),
          doctorName: a.doctorName || "Unassigned",
          date,
          time,
          rawDate: a.appointmentDate,
          status: a.status || "BOOKED",
          reason: a.reason || "—",
        };
      });

      setAppointments(mapped);
      setTotalPages(res.data?.totalPages ?? 0);
      setTotalElements(res.data?.totalElements ?? 0);
    } catch (e: any) {
      setError(e.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }, [viewMode, size]);

  // Handle search with debounce
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, search);
    }, 500);
    
    return () => clearTimeout(debounceRef.current);
  }, [search, load]);

  // Load when page changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad.current) {
      load(page, search);
    }
    isInitialLoad.current = false;
  }, [page, load, search]);

  // Initial load
  useEffect(() => {
    load(0, "");
  }, []);

  // Reset to page 0 when view mode changes
  useEffect(() => {
    setPage(0);
    setSearch("");
  }, [viewMode]);

  // Count for assigned badge - only show after mounted
  const assignedCount = mounted ? appointments.length : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="My Appointments" subtitle="Manage your schedule" />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">

        {/* View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex gap-2 bg-[#F8FAFC] p-1 rounded-lg">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === 'all'
                  ? "bg-white text-[#00685C] shadow-sm"
                  : "text-[#3D4946] hover:text-[#00685C]"
              }`}
            >
              All Appointments
            </button>
            <button
              onClick={() => setViewMode('assigned')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                viewMode === 'assigned'
                  ? "bg-white text-[#00685C] shadow-sm"
                  : "text-[#3D4946] hover:text-[#00685C]"
              }`}
            >
              <span>Assigned to Me</span>
              {mounted && viewMode === 'assigned' && (
                <span className="bg-[#E5EEFF] text-[#1E40AF] text-xs px-2 py-0.5 rounded-full">
                  {appointments.length}
                </span>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="text-sm text-[#3D4946]">
            {isSearching ? `Showing results for "${search}"` : 
              viewMode === 'all' ? 'Showing all appointments' : 'Showing only appointments assigned to you'}
          </div>
        </div>

        {/* Search - Real-time */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="relative w-full sm:w-96">
            <input
              type="search"
              placeholder="Search by patient name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 pl-10 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-full"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#3D4946]"
              >
                ✕
              </button>
            )}
          </div>
          {isSearching && mounted && (
            <span className="text-xs text-[#00685C] font-medium">
              Found {totalElements} results
            </span>
          )}
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Info banner when viewing assigned appointments */}
        {viewMode === 'assigned' && !loading && !isSearching && appointments.length === 0 && mounted && (
          <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg px-4 py-3 text-sm text-[#0F766E]">
            <p className="font-semibold">No assigned appointments</p>
            <p className="text-[#0D9488]">You don't have any appointments assigned to you yet.</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  {["ID", "PATIENT", "DOCTOR", "REASON", "DATE & TIME", "STATUS"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-t border-[#F8FAFC]">
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                      {isSearching 
                        ? `No appointments found for "${search}"` 
                        : viewMode === 'assigned' 
                          ? 'No assigned appointments found.' 
                          : 'No appointments found.'}
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt, i) => (
                    <tr
                      key={appt.shortId}
                      className={`${i > 0 ? "border-t border-[#F8FAFC]" : ""} hover:bg-[#F8FAFC] transition-colors`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-[#0D9488]">{appt.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
                            {appt.initials}
                          </div>
                          <span className="text-sm font-semibold text-[#0B1C30]">{appt.patientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">{appt.doctorName}</td>
                      <td className="px-6 py-4 text-sm text-[#3D4946] max-w-[180px] truncate">{appt.reason}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#0B1C30]">{appt.date}</p>
                        <p className="text-xs text-[#94A3B8]">{appt.time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[appt.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                          {appt.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && mounted && (
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

        {!loading && mounted && (
          <p className="text-sm text-[#3D4946]">
            Showing {appointments.length} of {totalElements} appointments
          </p>
        )}
      </main>
    </div>
  );
}