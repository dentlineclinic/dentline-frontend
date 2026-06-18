"use client";

import { useState, useEffect, useRef } from "react";
import { useAppointmentCalendar } from "@/hooks/useAppointments";
import { searchAppointments } from "@/services/appointmentService";
import { mapToUIAppointment, UIAppointment, STATUS_COLORS } from "./types";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import AppointmentDayDrawer from "./AppointmentDayDrawer";
import AppointmentManagementDrawer from "./AppointmentManagementDrawer";

function formatDateLabel(dateStr: string): string {
  // dateStr: "YYYY-MM-DD"
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
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

  const { data, isLoading, isError, refetch } = useAppointmentCalendar(year, month);
  const calendarData = data?.data;

  // ── Navigate using backend-provided prev/next values ──────────────────────
  const handleNavigate = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setSelectedDate(null);
    setSelectedAppt(null);
  };

  // ── Search ────────────────────────────────────────────────────────────────
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

  // Close dropdown on outside click
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

  // ── Day click ─────────────────────────────────────────────────────────────
  const handleSelectDate = (date: string) => {
    setSelectedAppt(null);
    setSelectedDate(prev => prev === date ? null : date);
  };

  const handleSelectAppointment = (appt: UIAppointment) => {
    setSelectedAppt(appt);
  };

  const handleCloseManagement = () => {
    setSelectedAppt(null);
  };

  const handleCloseDayDrawer = () => {
    setSelectedDate(null);
    setSelectedAppt(null);
  };

  const handleRefresh = () => {
    refetch();
    // Also invalidate the day drawer data
    if (selectedDate) {
      // useAppointmentsByDate will re-fetch automatically on next mount/focus
    }
  };

  // Overlay shown when any panel is open
  const anyPanelOpen = !!selectedDate || !!selectedAppt;

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar: title + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0B1C30]">Appointments</h1>

        {/* Search with floating dropdown */}
        <div ref={searchRef} className="relative w-full sm:w-72">
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
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 animate-spin text-[#0D9488]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            )}
          </div>

          {/* Search results dropdown */}
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
      </div>

      {/* Calendar */}
      {isError && (
        <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
          Failed to load calendar. Please try again.
        </div>
      )}

      {isLoading || !calendarData ? (
        // Loading skeleton
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

      {/* Overlay */}
      {anyPanelOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-30"
          onClick={() => { setSelectedDate(null); setSelectedAppt(null); }}
        />
      )}

      {/* Day drawer — shows appointments for selected day */}
      {selectedDate && !selectedAppt && (
        <AppointmentDayDrawer
          date={selectedDate}
          dateLabel={formatDateLabel(selectedDate)}
          onClose={handleCloseDayDrawer}
          onSelectAppointment={handleSelectAppointment}
          onRefresh={handleRefresh}
        />
      )}

      {/* Management drawer — shows when an appointment is selected */}
      {selectedAppt && (
        <AppointmentManagementDrawer
          appointment={selectedAppt}
          onClose={handleCloseManagement}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
