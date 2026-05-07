"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import { fetchDoctorAppointments } from "@/services/doctorService";

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
};

const STATUS_COLORS: Record<string, string> = {
  BOOKED:      "bg-[#E5EEFF] text-[#1E40AF]",
  ARRIVAL:     "bg-[#F0FDFA] text-[#0F766E]",
  ASSIGN:      "bg-[#FEF3C7] text-[#92400E]",
  COMPLETE:    "bg-[#DCFCE7] text-[#166534]",
  COMPLETED:   "bg-[#DCFCE7] text-[#166534]",
  CANCEL:      "bg-[#F1F5F9] text-[#475569]",
  CANCELLED:   "bg-[#F1F5F9] text-[#475569]",
  MISSED:      "bg-[#FFDAD6] text-[#93000A]",
  IN_PROGRESS: "bg-[#FEF3C7] text-[#92400E]",
};

const STATUS_FILTERS = ["All", "TODAY", "BOOKED", "ARRIVAL", "ASSIGN", "COMPLETE", "CANCEL", "MISSED"];

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
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 20;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDoctorAppointments(p, size);
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
        } as any;
      });

      setAppointments(mapped);
      setTotalPages(res.data?.totalPages ?? 0);
      setTotalElements(res.data?.totalElements ?? 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(page), 300);
    return () => clearTimeout(debounceRef.current);
  }, [page, load]);

  const todayStr = new Date().toDateString();

  const visible = appointments.filter((a) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "TODAY"
        ? new Date((a as any).rawDate).toDateString() === todayStr
        : a.status === filter);
    const matchesSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="My Appointments" subtitle="Manage your schedule" />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f
                    ? "bg-[#00685C] text-white"
                    : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search by patient, doctor or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-full sm:w-64"
          />
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
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
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  visible.map((appt, i) => (
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
            Showing {visible.length} of {totalElements} appointments
          </p>
        )}
      </main>
    </div>
  );
}
