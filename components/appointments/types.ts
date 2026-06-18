// Shared UI appointment type used across calendar components
export interface UIAppointment {
  id: string;       // short display ID e.g. "APT-ABC123"
  rawId: string;    // full UUID
  patientId: string;
  patientName: string;
  initials: string;
  doctorId: string | null;
  doctorName: string;
  date: string;     // formatted date string
  status: string;
  observation: string;
}

export const STATUS_COLORS: Record<string, string> = {
  BOOKED:    "bg-[#E5EEFF] text-[#1E40AF]",
  ARRIVED:   "bg-[#F0FDFA] text-[#0F766E]",
  ASSIGNED:  "bg-[#FEF3C7] text-[#92400E]",
  COMPLETED: "bg-[#DCFCE7] text-[#166534]",
  CANCELLED: "bg-[#F1F5F9] text-[#475569]",
  MISSED:    "bg-[#FFDAD6] text-[#93000A]",
};

export function mapToUIAppointment(appt: any): UIAppointment {
  return {
    id: `APT-${appt.id.slice(0, 6).toUpperCase()}`,
    rawId: appt.id,
    patientId: appt.patientId ?? "",
    patientName: appt.patientName ?? "Unknown",
    initials: (appt.patientName ?? "?")
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase(),
    doctorId: appt.doctorId ?? null,
    doctorName: appt.doctorName || "Unassigned",
    date: appt.appointmentDate ?? "",
    status: appt.status ?? "BOOKED",
    observation: appt.observation ?? "No notes",
  };
}
