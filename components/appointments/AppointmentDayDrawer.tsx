"use client";

import { useAppointmentsByDate } from "@/hooks/useAppointments";
import { mapToUIAppointment, STATUS_COLORS, UIAppointment } from "./types";

interface Props {
  date: string;               // "YYYY-MM-DD"
  dateLabel: string;          // human-readable label e.g. "Monday, June 17"
  onClose: () => void;
  onSelectAppointment: (appt: UIAppointment) => void;
  onRefresh: () => void;
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin text-[#0D9488]" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function AppointmentDayDrawer({ date, dateLabel, onClose, onSelectAppointment }: Props) {
  const { data, isLoading, isError } = useAppointmentsByDate(date);

  const appointments = (data?.data?.content ?? []).map(mapToUIAppointment);

  return (
    <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
        <div>
          <h2 className="text-base font-bold text-[#0B1C30]">{dateLabel}</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {isLoading ? "Loading…" : `${appointments.length} appointment${appointments.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={onClose} className="text-[#94A3B8] hover:text-[#475569]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-4 animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-[#F1F5F9] rounded w-32 mb-2" />
                <div className="h-3 bg-[#F1F5F9] rounded w-20" />
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#93000A]">Failed to load appointments.</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-[#F0FDFA] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-[#94A3B8]">No appointments on this day.</p>
          </div>
        ) : (
          appointments.map(appt => (
            <button
              key={appt.rawId}
              onClick={() => onSelectAppointment(appt)}
              className="w-full text-left bg-white border border-[#F1F5F9] rounded-xl p-4 hover:border-[#00685C]/30 hover:shadow-sm transition-all flex items-start gap-3 group"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0 mt-0.5">
                {appt.initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#0B1C30] truncate">{appt.patientName}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[appt.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                    {appt.status}
                  </span>
                </div>
                <p className="text-xs text-[#3D4946] mt-0.5">{appt.doctorName}</p>
                {appt.observation && appt.observation !== "No notes" && (
                  <p className="text-xs text-[#94A3B8] mt-1 truncate">{appt.observation}</p>
                )}
              </div>

              <svg className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0D9488] flex-shrink-0 mt-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
