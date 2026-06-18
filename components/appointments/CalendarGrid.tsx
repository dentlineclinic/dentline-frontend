"use client";

import { CalendarDay, MonthlyCalendarData } from "@/services/appointmentService";
import CalendarDayCard from "./CalendarDayCard";

interface Props {
  calendarData: MonthlyCalendarData;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({ calendarData, selectedDate, onSelectDate }: Props) {
  const today = new Date().toISOString().split("T")[0];

  // Build a lookup from date string → CalendarDay
  const dayMap: Record<string, CalendarDay> = {};
  for (const d of calendarData.days) {
    dayMap[d.date] = d;
  }

  // Determine the weekday (0=Sun) of the 1st of the month
  // We derive it from the first day entry if available, otherwise construct it
  const firstDate = `${calendarData.year}-${String(calendarData.month).padStart(2, "0")}-01`;
  const firstDow = new Date(firstDate + "T00:00:00").getDay(); // 0-6

  // Build grid cells: leading empty + current month days
  const totalCells = firstDow + calendarData.numberOfDays;
  const rows = Math.ceil(totalCells / 7);

  const cells: Array<{ date: string | null; dayNum: number | null; isCurrentMonth: boolean }> = [];

  // Leading filler
  for (let i = 0; i < firstDow; i++) {
    cells.push({ date: null, dayNum: null, isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= calendarData.numberOfDays; d++) {
    const dateStr = `${calendarData.year}-${String(calendarData.month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: dateStr, dayNum: d, isCurrentMonth: true });
  }
  // Trailing filler to complete grid
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, dayNum: null, isCurrentMonth: false });
  }

  return (
    <div className="bg-white border border-[#F1F5F9] rounded-2xl shadow-sm overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-[#F1F5F9]">
        {WEEK_DAYS.map(d => (
          <div key={d} className="py-3 text-center text-xs font-bold text-[#94A3B8] tracking-widest uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((cell, idx) => (
          <div key={idx} className="border-b border-r border-[#F9FAFB] last:border-r-0">
            <CalendarDayCard
              day={cell.date ? dayMap[cell.date] ?? null : null}
              dayNumber={cell.dayNum ?? (idx + 1)}
              isToday={cell.date === today}
              isSelected={cell.date === selectedDate}
              isCurrentMonth={cell.isCurrentMonth}
              onClick={() => {
                if (cell.date && cell.isCurrentMonth) onSelectDate(cell.date);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
