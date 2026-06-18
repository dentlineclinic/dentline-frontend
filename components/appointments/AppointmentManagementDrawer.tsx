"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchDoctors } from "@/services/doctorService";
import api from "@/lib/axios";
import { UIAppointment, STATUS_COLORS } from "./types";

interface Doctor {
  id: string;
  fullName: string;
  initials: string;
  specialty: string;
  patients: number;
}

interface Props {
  appointment: UIAppointment;
  onClose: () => void;
  onRefresh: () => void;
}

export default function AppointmentManagementDrawer({ appointment, onClose, onRefresh }: Props) {
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [showDoctorPanel, setShowDoctorPanel] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [doctorPage, setDoctorPage] = useState(0);
  const [totalDoctorPages, setTotalDoctorPages] = useState(0);

  const loadDoctors = useCallback(async (pageNum = 0, pageSize = 10, term = "") => {
    setLoadingDoctors(true);
    try {
      const res = await fetchDoctors(pageNum, pageSize, term);
      if (res.success && res.data) {
        setDoctors(
          res.data.content.map((d: any) => ({
            id: d.id,
            fullName: d.name,
            initials: d.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase(),
            specialty: d.specialization,
            patients: 0,
          }))
        );
        setTotalDoctorPages(res.data.totalPages);
      }
    } catch { /* silent */ }
    finally { setLoadingDoctors(false); }
  }, []);

  useEffect(() => {
    if (showDoctorPanel) {
      setDoctorPage(0);
      setDoctorSearch("");
      loadDoctors(0, 10, "");
    }
  }, [showDoctorPanel, loadDoctors]);

  useEffect(() => {
    if (!showDoctorPanel) return;
    const t = setTimeout(() => { loadDoctors(0, 10, doctorSearch); setDoctorPage(0); }, 300);
    return () => clearTimeout(t);
  }, [doctorSearch, showDoctorPanel, loadDoctors]);

  const filteredDoctors = doctors.filter(d =>
    d.fullName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialty.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const markArrival = async () => {
    setUpdatingStatus(true);
    setStatusError(null);
    try {
      const res = await api.patch(`/appointments/${appointment.rawId}/arrive`);
      if (res.data.success) { onRefresh(); onClose(); }
      else setStatusError(res.data.message || "Failed to update status");
    } catch (err: any) {
      setStatusError(err.response?.data?.message || "Failed to update status");
    } finally { setUpdatingStatus(false); }
  };

  const assignDoctor = async (doctor: Doctor) => {
    setAssigning(true);
    setAssignError(null);
    try {
      const res = await api.patch(`/appointments/${appointment.rawId}/assign`, { doctorId: doctor.id });
      if (res.data.success) { onRefresh(); onClose(); }
      else setAssignError(res.data.message || "Failed to assign doctor");
    } catch (err: any) {
      setAssignError(err.response?.data?.message || "Failed to assign doctor");
    } finally { setAssigning(false); }
  };

  const canManage = appointment.status === "BOOKED" || appointment.status === "ARRIVED";

  return (
    <>
      {/* ── Panel 1: Appointment detail ── */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-96 lg:w-80 bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
          <h2 className="text-base font-bold text-[#0B1C30]">Appointment</h2>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#475569]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Patient */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#CCFBF1] flex items-center justify-center text-sm font-bold text-[#0F766E] flex-shrink-0">
              {appointment.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0B1C30]">{appointment.patientName}</p>
              <p className="text-xs text-[#3D4946]">{appointment.id}</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-3">
            {[
              { label: "Doctor", value: appointment.doctorName },
              { label: "Date",   value: appointment.date },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-[#94A3B8] text-xs font-semibold uppercase tracking-widest">{label}</span>
                <span className="text-[#0B1C30] text-sm font-medium text-right max-w-[200px]">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8] text-xs font-semibold uppercase tracking-widest">Status</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[appointment.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                {appointment.status}
              </span>
            </div>
          </div>

          {/* Observation */}
          <div className="bg-[#F8FAFC] rounded-lg p-4">
            <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-2">Observation</p>
            <p className="text-sm text-[#485F83] leading-relaxed">{appointment.observation || "No notes."}</p>
          </div>

          {statusError && (
            <div className="bg-[#FFDAD6] text-[#93000A] text-xs font-semibold px-3 py-2 rounded-lg">{statusError}</div>
          )}

          {/* Actions */}
          {canManage ? (
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Change Status</p>

              {appointment.status === "BOOKED" && (
                <button
                  onClick={markArrival}
                  disabled={updatingStatus}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#0B1C30] hover:bg-[#F0FDFA] hover:border-[#0F766E] hover:text-[#0F766E] transition-all disabled:opacity-50"
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

              {appointment.status === "ARRIVED" && (
                <button
                  onClick={() => { setDoctorSearch(""); setAssignError(null); setShowDoctorPanel(true); }}
                  disabled={assigning}
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
                Status is <strong>{appointment.status}</strong> — no further actions available.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#F1F5F9]">
          <button onClick={onClose} className="w-full py-2.5 text-sm font-semibold text-[#3D4946] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors">
            Close
          </button>
        </div>
      </div>

      {/* ── Panel 2: Doctor picker ── */}
      {showDoctorPanel && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-96 lg:w-80 bg-white shadow-2xl z-[60] flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-base font-bold text-[#0B1C30]">Select Doctor</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">for {appointment.patientName}</p>
            </div>
            <button onClick={() => setShowDoctorPanel(false)} className="text-[#94A3B8] hover:text-[#475569]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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

          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
            {assignError && (
              <div className="bg-[#FFDAD6] text-[#93000A] text-xs font-semibold px-3 py-2 rounded-lg mb-2">{assignError}</div>
            )}
            {loadingDoctors ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#F1F5F9] rounded w-32 animate-pulse mb-2" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-24 animate-pulse" />
                  </div>
                </div>
              ))
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
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
                  </div>
                  <svg className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0D9488] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))
            )}
          </div>

          <div className="px-6 py-4 border-t border-[#F1F5F9] flex items-center justify-between">
            <p className="text-xs text-[#94A3B8]">{loadingDoctors ? "Loading..." : `${filteredDoctors.length} available`}</p>
            <div className="flex gap-2">
              <button onClick={() => { setDoctorPage(p => p - 1); loadDoctors(doctorPage - 1, 10, doctorSearch); }} disabled={doctorPage === 0 || loadingDoctors} className="text-sm font-semibold text-[#3D4946] hover:text-[#0B1C30] disabled:opacity-50">Previous</button>
              <span className="text-xs text-[#94A3B8]">{doctorPage + 1} / {totalDoctorPages || 1}</span>
              <button onClick={() => { setDoctorPage(p => p + 1); loadDoctors(doctorPage + 1, 10, doctorSearch); }} disabled={doctorPage >= totalDoctorPages - 1 || loadingDoctors} className="text-sm font-semibold text-[#3D4946] hover:text-[#0B1C30] disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
