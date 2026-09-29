import type { PilatesSessionStatus } from "@/services/pilatesService";

export const SESSION_STATUS_COLORS: Record<PilatesSessionStatus, string> = {
  SCHEDULED: "bg-[#E5EEFF] text-[#1E40AF]",
  COMPLETED: "bg-[#DCFCE7] text-[#166534]",
  CANCELLED: "bg-[#F1F5F9] text-[#64748B]",
};

export const SESSION_STATUS_DOT_COLORS: Record<PilatesSessionStatus, string> = {
  SCHEDULED: "bg-[#1E40AF]",
  COMPLETED: "bg-[#166534]",
  CANCELLED: "bg-[#64748B]",
};

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLongDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  return time?.slice(0, 5) ?? "—";
}