"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import {
  useAppointmentCalendar,
  useAdminBookAppointment,
  useRescheduleAppointment,
} from "@/hooks/useAppointments";
import { searchAppointments } from "@/services/appointmentService";
import { fetchPatients } from "@/services/patientService";
import { mapToUIAppointment, UIAppointment, STATUS_COLORS } from "./types";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import AppointmentDayDrawer from "./AppointmentDayDrawer";
import AppointmentManagementDrawer from "./AppointmentManagementDrawer";

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

// ── Small reusable spinner ────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function AppointmentCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-based

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<UIAppointment | null>(null);

  // Search
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UIAppointment[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Book Appointment modal ────────────────────────────────────────────────
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookPatientSearch, setBookPatientSearch] = useState("");
  const [bookPatients, setBookPatients] = useState<{ id: string; name: string }[]>([]);
  const [loadingBookPatients, setLoadingBookPatients] = useState(false);
  const [bookPatientId, setBookPatientId] = useState("");
  const [bookPatientName, setBookPatientName] = useState("");
  const [bookDate, setBookDate] = useState("");

  // ── Reschedule modal ──────────────────────────────────────────────────────
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState<UIAppointment | null>(null);
  const [newDate, setNewDate] = useState("");

  const { data, isLoading, isError, refetch } = useAppointmentCalendar(year, month);
  const calendarData = data?.data;

  const bookMutation = useAdminBookAppointment();
  const rescheduleMutation = useRescheduleAppointment();

  // ── Navigate ──────────────────────────────────────────────────────────────
  const handleNavigate = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setSelectedDate(null);
    setSelectedAppt(null);
  };

  // ── Search appointments ───────────────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); setShowSearchDropdown(false); return; }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchAppointments(search, 0, 10);
        const mapped = (res.data?.content ?? []).map(mapToUIAppointment);
        setSearchResults(mapped);
        setShowSearchDropdown(true);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectSearchResult = (appt: UIAppointment) => {
    setSearch("");
    setShowSearchDropdown(false);
    setSelectedAppt(appt);
  };

  // ── Calendar interaction ──────────────────────────────────────────────────
  const handleSelectDate = (date: string) => {
    setSelectedAppt(null);
    setSelectedDate(prev => prev === date ? null : date);
  };

  const handleCloseManagement = () => setSelectedAppt(null);
  const handleCloseDayDrawer = () => { setSelectedDate(null); setSelectedAppt(null); };

  const handleRefresh = () => {
    refetch();
  };

  // ── Book appointment ──────────────────────────────────────────────────────
  const loadBookPatients = useCallback(async (term: string) => {
    setLoadingBookPatients(true);
    try {
      const res = await fetchPatients(0, 20, term);
      setBookPatients((res.data?.content ?? []).map((p: any) => ({ id: p.id, name: p.name })));
    } catch { /* silent */ }
    finally { setLoadingBookPatients(false); }
  }, []);

  useEffect(() => {
    if (!showBookModal) return;
    const t = setTimeout(() => loadBookPatients(bookPatientSearch), 300);
    return () => clearTimeout(t);
  }, [showBookModal, bookPatientSearch, loadBookPatients]);

  const openBookModal = () => {
    setBookPatientId("");
    setBookPatientName("");
    setBookPatientSearch("");
    setBookPatients([]);
    setBookDate("");
    setShowBookModal(true);
  };

  const handleBookSubmit = async () => {
    if (!bookPatientId || !bookDate) {
      toast.error("Please select a patient and a date.");
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

  // ── Reschedule ────────────────────────────────────────────────────────────
  const openRescheduleModal = (appt: UIAppointment) => {
    setRescheduleAppt(appt);
    setNewDate("");
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!newDate || !rescheduleAppt) {
      toast.error("Please select a new date.");
      return;
    }
    try {
      await rescheduleMutation.mutateAsync({
        appointmentId: rescheduleAppt.rawId,
        newAppointmentDate: newDate,
      });
      toast.success("Appointment rescheduled.");
      setShowRescheduleModal(false);
      // If day drawer is open for the old date, refresh it
      handleRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reschedule.");
    }
  };

  const anyPanelOpen = !!selectedDate || !!selectedAppt;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Top bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0B1C30]">Appointments</h1>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div ref={searchRef} className="relative w-full sm:w-64">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search appointments…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg pl-9 pr-4 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] shadow-sm"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0D9488]">
                  <Spinner />
                </div>
              )}
            </div>

            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-[70] max-h-72 overflow-y-auto">
                {searchResults.map(appt => (
                  <button
                    key={appt.rawId}
                    onClick={() => handleSelectSearchResult(appt)}
                    className="w-full text-left px-4 py-3 hover:bg-[#F0FDFA] transition-colors flex items-center gap-3 border-b border-[#F9FAFB] last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
                      {appt.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0B1C30] truncate">{appt.patientName}</p>
                      <p className="text-xs text-[#3D4946]">{appt.date}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[appt.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                      {appt.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Book Appointment button */}
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

      {/* ── Error ── */}
      {isError && (
        <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
          Failed to load calendar. Please try again.
        </div>
      )}

      {/* ── Calendar ── */}
      {isLoading || !calendarData ? (
        <div className="bg-white border border-[#F1F5F9] rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#F1F5F9]">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="py-3 text-center text-xs font-bold text-[#94A3B8] tracking-widest uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="border-b border-r border-[#F9FAFB] p-2 sm:p-3 min-h-[90px] sm:min-h-[120px]">
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
          <CalendarHeader calendarData={calendarData} onNavigate={handleNavigate} />
          <CalendarGrid
            calendarData={calendarData}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </div>
      )}

      {/* ── Overlay ── */}
      {anyPanelOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-30"
          onClick={() => { setSelectedDate(null); setSelectedAppt(null); }}
        />
      )}

      {/* ── Day drawer ── */}
      {selectedDate && !selectedAppt && (
        <AppointmentDayDrawer
          date={selectedDate}
          dateLabel={formatDateLabel(selectedDate)}
          onClose={handleCloseDayDrawer}
          onSelectAppointment={(appt) => setSelectedAppt(appt)}
          onRefresh={handleRefresh}
          onReschedule={openRescheduleModal}
        />
      )}

      {/* ── Management drawer ── */}
      {selectedAppt && (
        <AppointmentManagementDrawer
          appointment={selectedAppt}
          onClose={handleCloseManagement}
          onRefresh={handleRefresh}
        />
      )}

      {/* ── Book Appointment Modal ── */}
      {showBookModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]" onClick={() => setShowBookModal(false)} />
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
                <h2 className="text-base font-bold text-[#0B1C30]">Book Appointment</h2>
                <button onClick={() => setShowBookModal(false)} className="text-[#94A3B8] hover:text-[#475569]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-5">
                {/* Patient search */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#3D4946]">Patient</label>
                  <input
                    type="search"
                    placeholder="Search by patient name…"
                    value={bookPatientSearch}
                    onChange={e => { setBookPatientSearch(e.target.value); setBookPatientId(""); setBookPatientName(""); }}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  />
                  {loadingBookPatients && (
                    <p className="text-xs text-[#94A3B8]">Searching…</p>
                  )}
                  {!loadingBookPatients && bookPatients.length > 0 && (
                    <div className="border border-[#E2E8F0] rounded-lg overflow-hidden max-h-44 overflow-y-auto">
                      {bookPatients.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setBookPatientId(p.id); setBookPatientName(p.name); setBookPatientSearch(p.name); setBookPatients([]); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F0FDFA] transition-colors border-b border-[#F1F5F9] last:border-0 ${bookPatientId === p.id ? "bg-[#F0FDFA] font-semibold text-[#00685C]" : "text-[#0B1C30]"}`}
                        >
                          {p.name}
                          <span className="text-xs text-[#94A3B8] ml-2">{p.id.slice(0, 8)}…</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {bookPatientId && (
                    <p className="text-xs text-[#00685C] font-semibold">✓ {bookPatientName} selected</p>
                  )}
                </div>

                {/* Date picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#3D4946]">Appointment Date</label>
                  <input
                    type="date"
                    value={bookDate}
                    min={today}
                    onChange={e => setBookDate(e.target.value)}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  />
                </div>
              </div>

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
                  {bookMutation.isPending && <Spinner />}
                  {bookMutation.isPending ? "Booking…" : "Book Appointment"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Reschedule Modal ── */}
      {showRescheduleModal && rescheduleAppt && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]" onClick={() => setShowRescheduleModal(false)} />
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
                <div>
                  <h2 className="text-base font-bold text-[#0B1C30]">Reschedule Appointment</h2>
                  <p className="text-xs text-[#94A3B8] mt-0.5 truncate max-w-[220px]">
                    {rescheduleAppt.patientName} — {rescheduleAppt.date}
                  </p>
                </div>
                <button onClick={() => setShowRescheduleModal(false)} className="text-[#94A3B8] hover:text-[#475569]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#3D4946]">New Appointment Date</label>
                  <input
                    type="date"
                    value={newDate}
                    min={today}
                    onChange={e => setNewDate(e.target.value)}
                    autoFocus
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  />
                </div>
              </div>

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
                  {rescheduleMutation.isPending && <Spinner />}
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
