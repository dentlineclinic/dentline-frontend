"use client";

import { MonthlyCalendarData } from "@/services/appointmentService";

interface Props {
  calendarData: MonthlyCalendarData;
  onNavigate: (year: number, month: number) => void;
}

export default function CalendarHeader({ calendarData, onNavigate }: Props) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-[#0B1C30]">
        {calendarData.monthName} {calendarData.year}
      </h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate(calendarData.previousYear, calendarData.previousMonth)}
          className="w-9 h-9 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-[#3D4946] hover:bg-[#F0FDFA] hover:border-[#00685C] transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Jump to today */}
        <button
          onClick={() => {
            const now = new Date();
            onNavigate(now.getFullYear(), now.getMonth() + 1);
          }}
          className="px-3 h-9 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#3D4946] hover:bg-[#F0FDFA] hover:border-[#00685C] transition-colors"
        >
          Today
        </button>

        <button
          onClick={() => onNavigate(calendarData.nextYear, calendarData.nextMonth)}
          className="w-9 h-9 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-[#3D4946] hover:bg-[#F0FDFA] hover:border-[#00685C] transition-colors"
          aria-label="Next month"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
