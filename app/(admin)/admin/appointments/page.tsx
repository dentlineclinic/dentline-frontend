"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppointments, useAdminBookAppointment, useRescheduleAppointment } from "@/hooks/useAppointments";
import { fetchDoctors } from "@/services/doctorService";
import { toast } from "react-toastify";
import api from "@/lib/axios"

export const dynamic = "force-dynamic";

type Appointment = {
  id: string;
  rawId: string;
  patientId: string;
  patientName: string;
  initials: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
  observation: string;
};

type Doctor = {
  id: string;
  shortId: string;
  fullName: string;
  initials: string;
  specialty: string;
  email: string;
  patients: number;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  BOOKED: "bg-[#E5EEFF] text-[#1E40AF]",
  ARRIVED: "bg-[#F0FDFA] text-[#0F766E]",
  ASSIGNED: "bg-[#FEF3C7] text-[#92400E]",
  COMPLETED: "bg-[#DCFCE7] text-[#166534]",
  CANCELLED: "bg-[#F1F5F9] text-[#475569]",
  MISSED: "bg-[#FFDAD6] text-[#93000A]",
};

const ALL_FILTERS = ["All", "TODAY", "BOOKED", "ARRIVED", "ASSIGNED", "COMPLETED", "CANCELLED", "MISSED"];

export default function AppointmentsPage() {
  const [page, setPage] = useState(0);
  const size = 10;

  const { data, isLoading, error, refetch } = useAppointments(page, size);

  const bookMutation = useAdminBookAppointment();
  const rescheduleMutation = useRescheduleAppointment();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Panel 1 — appointment detail
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Panel 2 — doctor picker
  const [showDoctorPanel, setShowDoctorPanel] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [doctorPage, setDoctorPage] = useState(0);
  const [totalDoctorPages, setTotalDoctorPages] = useState(0);

  // Copy ID feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Book Appointment modal - simplified (only patientId and date)
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookPatientId, setBookPatientId] = useState("");
  const [bookDate, setBookDate] = useState("");

  // Reschedule modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleApptId, setRescheduleApptId] = useState("");
  const [rescheduleApptLabel, setRescheduleApptLabel] = useState("");
  const [newDate, setNewDate] = useState("");

  const copyId = (rawId: string) => {
    navigator.clipboard.writeText(rawId).then(() => {
      setCopiedId(rawId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // ✅ Service-based doctor fetcher with proper separation of concerns
  const loadDoctors = useCallback(async (pageNum = 0, pageSize = 10, searchTerm = "") => {
    setLoadingDoctors(true);
    try {
      const response = await fetchDoctors(pageNum, pageSize, searchTerm);

      if (response.success && response.data) {
        const mapped = response.data.content.map((doc: any) => ({
          id: doc.id,
          shortId: `DOC-${doc.id.slice(0, 6).toUpperCase()}`,
          fullName: doc.name,
          initials: doc.name
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
          specialty: doc.specialization,
          email: doc.email,
          patients: 0,
          status: doc.status,
        }));

        setDoctors(mapped);
        setTotalDoctorPages(response.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to load doctors", err);
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  // Load doctors only when popup opens
  useEffect(() => {
    if (showDoctorPanel) {
      setDoctorPage(0);
      setDoctorSearch("");
      loadDoctors(0, 10, "");
    }
  }, [showDoctorPanel, loadDoctors]);

  // Debounced search for doctors
  useEffect(() => {
    if (!showDoctorPanel) return;

    const delay = setTimeout(() => {
      loadDoctors(0, 10, doctorSearch);
      setDoctorPage(0);
    }, 300);

    return () => clearTimeout(delay);
  }, [doctorSearch, showDoctorPanel, loadDoctors]);

  // Map backend data to UI shape
  // Change 4: appointmentDate is LocalDate (date only, no time)
  const mappedAppointments: Appointment[] =
    data?.data?.content?.map((appt: any) => {
      // appointmentDate is "YYYY-MM-DD" — display as date only, no fake time
      const dateDisplay = appt.appointmentDate
        ? new Date(appt.appointmentDate + "T00:00:00").toLocaleDateString()
        : "—";

      return {
        id: `APT-${appt.id.slice(0, 6).toUpperCase()}`,
        rawId: appt.id,
        patientId: appt.patientId,
        patientName: appt.patientName,
        initials: appt.patientName
          .split(" ")
          .map((n: string) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
        doctorId: appt.doctorId,
        doctorName: appt.doctorName || "Unassigned",
        date: dateDisplay,
        time: "",
        status: appt.status,
        observation: appt.observation ?? "No notes",
      };
    }) ?? [];

  const openPanel = (appt: Appointment) => {
    setSelectedAppt(appt);
    setShowDoctorPanel(false);
    setStatusError(null);
    setAssignError(null);
  };

  const closeAll = () => {
    setSelectedAppt(null);
    setShowDoctorPanel(false);
    setStatusError(null);
    setAssignError(null);
  };

  const markArrival = async () => {
    if (!selectedAppt) return;

    setUpdatingStatus(true);
    setStatusError(null);

    try {
      const response = await api.patch(`/appointments/${selectedAppt.rawId}/arrive`);

      if (response.data.success) {
        await refetch();
        closeAll();
      } else {
        setStatusError(response.data.message || "Failed to update status");
      }
    } catch (err: any) {
      setStatusError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignClick = () => {
    setDoctorSearch("");
    setAssignError(null);
    setShowDoctorPanel(true);
  };

  const assignDoctor = async (doctor: Doctor) => {
    if (!selectedAppt) return;

    setAssigning(true);
    setAssignError(null);

    try {
      const response = await api.patch(`/appointments/${selectedAppt.rawId}/assign`, {
        doctorId: doctor.id,
      });

      if (response.data.success) {
        await refetch();
        closeAll(); // ✅ Correct UX decision - close panel after assign
      } else {
        setAssignError(response.data.message || "Failed to assign doctor");
      }
    } catch (err: any) {
      setAssignError(err.response?.data?.message || "Failed to assign doctor");
    } finally {
      setAssigning(false);
    }
  };

  const handleDoctorPageChange = (newPage: number) => {
    setDoctorPage(newPage);
    loadDoctors(newPage, 10, doctorSearch);
  };

  // ── Book appointment handlers (simplified) ────────────────────────────────────────────
  const openBookModal = () => {
    setBookPatientId("");
    setBookDate("");
    setShowBookModal(true);
  };

  const handleBookSubmit = async () => {
    if (!bookPatientId || !bookDate) {
      toast.error("Please enter a patient ID and select a date.");
      return;
    }
    try {
      await bookMutation.mutateAsync({ patientId: bookPatientId, appointmentDate: bookDate });
      toast.success("Appointment booked successfully.");
      setShowBookModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to book appointment.");
    }
  };

  // ── Reschedule handlers ──────────────────────────────────────────────────
  const openRescheduleModal = (appt: Appointment) => {
    setRescheduleApptId(appt.rawId);
    setRescheduleApptLabel(`${appt.patientName} — ${appt.date}`);
    setNewDate("");
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!newDate) {
      toast.error("Please select a new date.");
      return;
    }
    try {
      await rescheduleMutation.mutateAsync({ appointmentId: rescheduleApptId, newAppointmentDate: newDate });
      toast.success("Appointment rescheduled.");
      setShowRescheduleModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reschedule.");
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString();
  };

  const visible = mappedAppointments.filter(a => {
    let matchesFilter = true;
    if (filter === "All") {
      matchesFilter = true;
    } else if (filter === "TODAY") {
      matchesFilter = a.date === getTodayDate();
    } else {
      matchesFilter = a.status === filter;
    }

    const matchesSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Frontend fallback filter (if backend doesn't support search)
  const filteredDoctors = doctors.filter(d =>
    d.fullName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialty.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const errorMessage = error ? "Failed to load appointments." : null;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-4 lg:gap-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {ALL_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${filter === f
                    ? "bg-[#00685C] text-white"
                    : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search appointments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-full sm:w-64"
            />
            {/* Change 2: Book Appointment button */}
            <button
              onClick={openBookModal}
              className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Book Appointment
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  {["ID", "PATIENT", "DOCTOR", "OBSERVATION", "DATE", "STATUS", "ACTIONS"].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t border-[#F8FAFC]">
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  visible.map((appt, i) => {
                    const canManage = appt.status === "BOOKED" || appt.status === "ARRIVED";
                    return (
                      <tr
                        key={appt.rawId}
                        className={`${i > 0 ? "border-t border-[#F8FAFC]" : ""} hover:bg-[#F8FAFC] transition-colors ${selectedAppt?.rawId === appt.rawId ? "bg-[#F0FDFA]" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#0D9488]">{appt.id}</span>
                            <button
                              onClick={e => { e.stopPropagation(); copyId(appt.rawId); }}
                              title="Copy full appointment ID"
                              className="flex-shrink-0 p-1 rounded hover:bg-[#F0FDFA] transition-colors group"
                            >
                              {copiedId === appt.rawId ? (
                                <svg className="w-3.5 h-3.5 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#0D9488] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E]">
                              {appt.initials}
                            </div>
                            <span className="text-sm font-semibold text-[#0B1C30]">{appt.patientName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3D4946]">{appt.doctorName}</td>
                        <td className="px-6 py-4 text-sm text-[#3D4946] max-w-[180px] truncate">{appt.observation}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#0B1C30]">{appt.date}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[appt.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openPanel(appt)}
                              disabled={!canManage}
                              className={`text-xs font-semibold transition-colors ${canManage
                                  ? "text-[#0D9488] hover:underline cursor-pointer"
                                  : "text-[#94A3B8] cursor-not-allowed"
                                }`}
                            >
                              Manage
                            </button>
                            {/* Change 3: Reschedule — only for BOOKED appointments */}
                            {appt.status === "BOOKED" && (
                              <button
                                onClick={() => openRescheduleModal(appt)}
                                className="text-xs font-semibold text-[#435B7E] hover:underline cursor-pointer"
                              >
                                Reschedule
                              </button>
                            )}
                          </div>
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
        <div className="flex items-center justify-between mt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <span className="text-sm text-[#3D4946]">
            Page {page + 1} of {data?.data?.totalPages ?? 1}
          </span>

          <button
            disabled={page >= (data?.data?.totalPages ?? 1) - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

        {!isLoading && (
          <p className="text-sm text-[#3D4946]">
            Showing {visible.length} of {mappedAppointments.length} appointments
          </p>
        )}
      </main>

      {/* ── OVERLAY — only when a panel is open ── */}
      {selectedAppt && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
          onClick={closeAll}
        />
      )}

      {/* ── PANEL 1: Appointment detail — slides in from right ── */}
      {selectedAppt && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-96 lg:w-80 bg-white shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
            <h2 className="text-base font-bold text-[#0B1C30]">Appointment</h2>
            <button onClick={closeAll} className="text-[#94A3B8] hover:text-[#475569]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
            {/* Patient */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#CCFBF1] flex items-center justify-center text-sm font-bold text-[#0F766E] flex-shrink-0">
                {selectedAppt.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0B1C30]">{selectedAppt.patientName}</p>
                <p className="text-xs text-[#3D4946]">{selectedAppt.id}</p>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-[#94A3B8] text-xs font-semibold uppercase tracking-widest">Doctor</span>
                <span className="text-[#0B1C30] text-sm font-medium text-right max-w-[160px]">{selectedAppt.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8] text-xs font-semibold uppercase tracking-widest">Date</span>
                <span className="text-[#0B1C30] text-sm font-medium">{selectedAppt.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8] text-xs font-semibold uppercase tracking-widest">Status</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[selectedAppt.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                  {selectedAppt.status}
                </span>
              </div>
            </div>

            {/* Observation */}
            <div className="bg-[#F8FAFC] rounded-lg p-4">
              <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-2">Observation</p>
              <p className="text-sm text-[#485F83] leading-relaxed">{selectedAppt.observation || "No notes."}</p>
            </div>

            {statusError && (
              <div className="bg-[#FFDAD6] text-[#93000A] text-xs font-semibold px-3 py-2 rounded-lg">
                {statusError}
              </div>
            )}

            {/* Actions */}
            {selectedAppt.status === "BOOKED" || selectedAppt.status === "ARRIVED" ? (
              <div className="flex flex-col gap-3 pt-2">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Change Status</p>

                {selectedAppt.status === "BOOKED" && (
                  <button
                    onClick={markArrival}
                    disabled={updatingStatus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#0B1C30] hover:bg-[#F0FDFA] hover:border-[#0F766E] hover:text-[#0F766E] transition-all"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#F0FDFA] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </span>
                    <div className="text-left">
                      <p className="font-semibold">Mark as Arrived</p>
                      <p className="text-xs text-[#94A3B8] font-normal">Patient has checked in</p>
                    </div>
                  </button>
                )}

                {selectedAppt.status === "ARRIVED" && (
                  <button
                    onClick={handleAssignClick}
                    disabled={assigning}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${showDoctorPanel
                        ? "bg-[#FEF3C7] border-[#92400E] text-[#92400E]"
                        : "bg-white border-[#E2E8F0] text-[#0B1C30] hover:bg-[#FEF3C7] hover:border-[#92400E] hover:text-[#92400E]"
                      }`}
                  >
                    <span className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#92400E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Assign to Doctor</p>
                      <p className="text-xs text-[#94A3B8] font-normal">Choose a doctor</p>
                    </div>
                    <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#F1F5F9] rounded-lg p-4 text-center">
                <p className="text-xs text-[#64748B]">
                  Status is <strong>{selectedAppt.status}</strong> — no further actions available.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#F1F5F9]">
            <button
              onClick={closeAll}
              className="w-full py-2.5 text-sm font-semibold text-[#3D4946] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── PANEL 2: Doctor picker — slides in on top of panel 1 ── */}
      {showDoctorPanel && selectedAppt && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-96 lg:w-80 bg-white shadow-2xl z-[60] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-base font-bold text-[#0B1C30]">Select Doctor</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">for {selectedAppt.patientName}</p>
            </div>
            <button onClick={() => setShowDoctorPanel(false)} className="text-[#94A3B8] hover:text-[#475569]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-[#F1F5F9]">
            <input
              type="search"
              placeholder="Search doctors..."
              value={doctorSearch}
              onChange={e => setDoctorSearch(e.target.value)}
              autoFocus
              className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg px-4 py-2.5 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
            />
          </div>

          {/* Doctor list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
            {assignError && (
              <div className="bg-[#FFDAD6] text-[#93000A] text-xs font-semibold px-3 py-2 rounded-lg mb-2">
                {assignError}
              </div>
            )}

            {loadingDoctors ? (
              <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 bg-[#F1F5F9] rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-[#F1F5F9] rounded w-32 animate-pulse mb-2" />
                      <div className="h-3 bg-[#F1F5F9] rounded w-24 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm text-[#94A3B8]">No doctors found</p>
              </div>
            ) : (
              filteredDoctors.map(doctor => (
                <button
                  key={doctor.id}
                  onClick={() => assignDoctor(doctor)}
                  disabled={assigning}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#F1F5F9] bg-white hover:bg-[#F0FDFA] hover:border-[#0D9488] transition-all text-left disabled:opacity-50 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F0FDFA] flex items-center justify-center text-sm font-bold text-[#00685C] flex-shrink-0 group-hover:bg-[#CCFBF1]">
                    {doctor.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0B1C30] truncate">{doctor.fullName}</p>
                    <p className="text-xs text-[#0D9488]">{doctor.specialty}</p>
                    <p className="text-xs text-[#94A3B8]">{doctor.patients} patients</p>
                  </div>
                  <svg className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0D9488] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))
            )}
          </div>

          {/* Footer with pagination */}
          <div className="px-6 py-4 border-t border-[#F1F5F9] flex items-center justify-between">
            <p className="text-xs text-[#94A3B8]">
              {loadingDoctors ? "Loading..." : `${filteredDoctors.length} available`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDoctorPageChange(doctorPage - 1)}
                disabled={doctorPage === 0 || loadingDoctors}
                className="text-sm font-semibold text-[#3D4946] hover:text-[#0B1C30] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-[#94A3B8]">
                {doctorPage + 1} / {totalDoctorPages || 1}
              </span>
              <button
                onClick={() => handleDoctorPageChange(doctorPage + 1)}
                disabled={doctorPage >= totalDoctorPages - 1 || loadingDoctors}
                className="text-sm font-semibold text-[#3D4946] hover:text-[#0B1C30] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Book Appointment (simplified: patient ID + date) ── */}
      {showBookModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]" onClick={() => setShowBookModal(false)} />
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
                <h2 className="text-base font-bold text-[#0B1C30]">Book Appointment</h2>
                <button onClick={() => setShowBookModal(false)} className="text-[#94A3B8] hover:text-[#475569]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 flex flex-col gap-5">
                {/* Patient ID input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#3D4946]">Patient ID</label>
                  <input
                    type="text"
                    placeholder="Enter patient UUID"
                    value={bookPatientId}
                    onChange={(e) => setBookPatientId(e.target.value)}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  />
                </div>

                {/* Date picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#3D4946]">Appointment Date</label>
                  <input
                    type="date"
                    value={bookDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setBookDate(e.target.value)}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-[#F1F5F9]">
                <button
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-[#3D4946] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookSubmit}
                  disabled={bookMutation.isPending || !bookPatientId || !bookDate}
                  className="flex-1 py-2.5 text-sm font-semibold bg-[#00685C] text-white rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bookMutation.isPending && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  {bookMutation.isPending ? "Booking…" : "Book Appointment"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── MODAL: Reschedule Appointment (Change 3) ── */}
      {showRescheduleModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]" onClick={() => setShowRescheduleModal(false)} />
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
                <div>
                  <h2 className="text-base font-bold text-[#0B1C30]">Reschedule Appointment</h2>
                  <p className="text-xs text-[#94A3B8] mt-0.5 truncate max-w-[220px]">{rescheduleApptLabel}</p>
                </div>
                <button onClick={() => setShowRescheduleModal(false)} className="text-[#94A3B8] hover:text-[#475569]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#3D4946]">New Appointment Date</label>
                  <input
                    type="date"
                    value={newDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setNewDate(e.target.value)}
                    autoFocus
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-[#F1F5F9]">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-[#3D4946] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleSubmit}
                  disabled={rescheduleMutation.isPending || !newDate}
                  className="flex-1 py-2.5 text-sm font-semibold bg-[#00685C] text-white rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {rescheduleMutation.isPending && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  {rescheduleMutation.isPending ? "Rescheduling…" : "Confirm Reschedule"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}