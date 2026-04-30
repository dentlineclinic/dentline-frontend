"use client";

import { useEffect, useState } from "react";

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
  BOOKED:   "bg-[#E5EEFF] text-[#1E40AF]",
  ARRIVAL:  "bg-[#F0FDFA] text-[#0F766E]",
  ASSIGN:   "bg-[#FEF3C7] text-[#92400E]",
  COMPLETE: "bg-[#DCFCE7] text-[#166534]",
  CANCEL:   "bg-[#F1F5F9] text-[#475569]",
  MISSED:   "bg-[#FFDAD6] text-[#93000A]",
};

const ALL_FILTERS = ["All","TODAY", "BOOKED", "ARRIVAL", "ASSIGN", "COMPLETE", "CANCEL", "MISSED"];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await fetch("/api/admin/appointments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
      });
      const result = await res.json();
      if (result.success) setAppointments(result.data);
      else setError(result.message);
    } catch {
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await fetch("/api/admin/doctors", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
      });
      const result = await res.json();
      if (result.success) setDoctors(result.data);
    } catch {
      // non-critical
    }
  };

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

  const markArrival = () => {
    if (!selectedAppt) return;
    setUpdatingStatus(true);
    const updated = { ...selectedAppt, status: "ARRIVAL" };
    setAppointments(prev => prev.map(a => a.rawId === selectedAppt.rawId ? updated : a));
    setSelectedAppt(updated);
    setUpdatingStatus(false);
  };

  const handleAssignClick = () => {
    setDoctorSearch("");
    setAssignError(null);
    setShowDoctorPanel(true);
  };

  const assignDoctor = (doctor: Doctor) => {
    if (!selectedAppt) return;
    setAssigning(true);
    const updated = { ...selectedAppt, doctorId: doctor.id, doctorName: doctor.fullName, status: "ASSIGN" };
    setAppointments(prev => prev.map(a => a.rawId === selectedAppt.rawId ? updated : a));
    setSelectedAppt(updated);
    setShowDoctorPanel(false);
    setAssigning(false);
  };

  const visible = appointments.filter(a => {
    const matchesFilter = filter === "All" || a.status === filter;
    const matchesSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredDoctors = doctors.filter(d =>
    d.fullName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialty.toLowerCase().includes(doctorSearch.toLowerCase())
  );

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
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
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
            placeholder="Search appointments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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
            <table className="w-full min-w-[800px]">
            <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
              <tr>
                {["ID", "PATIENT", "DOCTOR", "OBSERVATION", "DATE & TIME", "STATUS", "ACTIONS"].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
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
                  const canManage = appt.status === "BOOKED" || appt.status === "ARRIVAL";
                  return (
                    <tr
                      key={appt.rawId}
                      className={`${i > 0 ? "border-t border-[#F8FAFC]" : ""} hover:bg-[#F8FAFC] transition-colors ${selectedAppt?.rawId === appt.rawId ? "bg-[#F0FDFA]" : ""}`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-[#0D9488]">{appt.id}</td>
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
                        <p className="text-xs text-[#3D4946]">{appt.time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[appt.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openPanel(appt)}
                          disabled={!canManage}
                          className={`text-xs font-semibold transition-colors ${
                            canManage
                              ? "text-[#0D9488] hover:underline cursor-pointer"
                              : "text-[#94A3B8] cursor-not-allowed"
                          }`}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </div>

        {!loading && (
          <p className="text-sm text-[#3D4946]">
            Showing {visible.length} of {appointments.length} appointments
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
              <div className="flex justify-between">
                <span className="text-[#94A3B8] text-xs font-semibold uppercase tracking-widest">Time</span>
                <span className="text-[#0B1C30] text-sm font-medium">{selectedAppt.time}</span>
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
            {selectedAppt.status === "BOOKED" || selectedAppt.status === "ARRIVAL" ? (
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

                {selectedAppt.status === "ARRIVAL" && (
                  <button
                    onClick={handleAssignClick}
                    disabled={updatingStatus}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      showDoctorPanel
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

            {filteredDoctors.length === 0 ? (
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

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#F1F5F9] flex items-center justify-between">
            <p className="text-xs text-[#94A3B8]">{filteredDoctors.length} available</p>
            <button
              onClick={() => setShowDoctorPanel(false)}
              className="text-sm font-semibold text-[#3D4946] hover:text-[#0B1C30]"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
