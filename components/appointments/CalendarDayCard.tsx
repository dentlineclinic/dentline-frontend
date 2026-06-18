"use client";

import { CalendarDay } from "@/services/appointmentService";

interface Props {
  day: CalendarDay | null;        // null = filler day (prev/next month)
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
}

const DOT_COLORS: Record<string, string> = {
  booked:    "bg-[#1E40AF]",
  arrived:   "bg-[#0F766E]",
  assigned:  "bg-[#92400E]",
  completed: "bg-[#166534]",
  cancelled: "bg-[#475569]",
  missed:    "bg-[#93000A]",
};

export default function CalendarDayCard({ day, dayNumber, isToday, isSelected, isCurrentMonth, onClick }: Props) {
  const isEmpty = !day || day.totalAppointments === 0;

  // Build status rows for days that have appointments
  const statusRows = day ? [
    { label: "Booked",    count: day.booked,    key: "booked" },
    { label: "Arrived",   count: day.arrived,   key: "arrived" },
    { label: "Assigned",  count: day.assigned,  key: "assigned" },
    { label: "Completed", count: day.completed, key: "completed" },
    { label: "Cancelled", count: day.cancelled, key: "cancelled" },
    { label: "Missed",    count: day.missed,    key: "missed" },
  ].filter(r => r.count > 0) : [];

  return (
    <button
      onClick={onClick}
      disabled={!isCurrentMonth}
      className={`
        relative w-full text-left rounded-xl border transition-all
        ${!isCurrentMonth
          ? "bg-[#FAFAFA] border-transparent cursor-default opacity-40"
          : isSelected
          ? "bg-[#F0FDFA] border-[#00685C] shadow-sm"
          : isToday
          ? "bg-[#F0FDFA]/60 border-[#00685C]/40 hover:border-[#00685C] hover:shadow-sm"
          : "bg-white border-[#F1F5F9] hover:border-[#00685C]/30 hover:shadow-sm"
        }
        ${isCurrentMonth && !isEmpty ? "cursor-pointer" : ""}
        p-2 sm:p-3 min-h-[90px] sm:min-h-[120px] flex flex-col gap-1.5
      `}
    >
      {/* Day number */}
      <div className="flex items-center justify-between">
        <span
          className={`
            text-sm font-bold leading-none
            ${isToday ? "w-7 h-7 rounded-full bg-[#00685C] text-white flex items-center justify-center text-xs" : ""}
            ${!isToday && isCurrentMonth ? "text-[#0B1C30]" : "text-[#94A3B8]"}
          `}
        >
          {dayNumber}
        </span>
        {day && day.totalAppointments > 0 && (
          <span className="text-[11px] font-bold text-[#00685C] bg-[#F0FDFA] px-1.5 py-0.5 rounded-full leading-none">
            {day.totalAppointments}
          </span>
        )}
      </div>

      {/* Status breakdown — hidden on very small screens, visible sm+ */}
      {statusRows.length > 0 && (
        <div className="hidden sm:flex flex-col gap-1 mt-1">
          {statusRows.slice(0, 4).map(row => (
            <div key={row.key} className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLORS[row.key]}`} />
                <span className="text-xs text-[#64748B] truncate">{row.label}</span>
              </div>
              <span className="text-xs font-semibold text-[#0B1C30] flex-shrink-0">{row.count}</span>
            </div>
          ))}
          {statusRows.length > 4 && (
            <p className="text-xs text-[#94A3B8]">+{statusRows.length - 4} more</p>
          )}
        </div>
      )}

      {/* Mobile: dots */}
      {statusRows.length > 0 && (
        <div className="flex sm:hidden gap-1 flex-wrap mt-auto">
          {statusRows.map(row => (
            <span key={row.key} className={`w-2 h-2 rounded-full ${DOT_COLORS[row.key]}`} />
          ))}
        </div>
      )}
    </button>
  );
}
