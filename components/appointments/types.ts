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
  appointmentType?: "INDIVIDUAL" | "FAMILY";
  familyMemberId?: string;
  familyMemberName?: string;
  headPatientName?: string; // Add this to store the head patient name
}

export const STATUS_COLORS: Record<string, string> = {
  BOOKED:    "bg-[#E5EEFF] text-[#1E40AF]",
  ARRIVED:   "bg-[#F0FDFA] text-[#0F766E]",
  ASSIGNED:  "bg-[#FEF3C7] text-[#92400E]",
  COMPLETED: "bg-[#DCFCE7] text-[#166534]",
  CANCELLED: "bg-[#F1F5F9] text-[#475569]",
  MISSED:    "bg-[#FFDAD6] text-[#93000A]",
};

// ✅ Safe slice helper
const safeSlice = (str: string | undefined | null, length: number = 6): string => {
  if (!str) return '';
  return str.slice(0, length);
};

export function mapToUIAppointment(appt: any): UIAppointment {
  // Guard against null/undefined appointment object
  if (!appt) {
    return {
      id: "",
      rawId: "",
      patientId: "",
      patientName: "Unknown",
      initials: "U",
      doctorId: null,
      doctorName: "Unassigned",
      date: "",
      status: "BOOKED",
      observation: "",
      appointmentType: "INDIVIDUAL",
    };
  }

  // ✅ FIX: Use familyMemberName if available for display
  const displayName = appt.familyMemberName || appt.patientName || "Unknown";
  
  // ✅ FIX: Safely get the ID for the display ID
  const rawId = appt.id || appt.appointmentId || '';
  const shortId = rawId ? safeSlice(rawId, 6) : '';
  
  return {
    id: shortId ? `APT-${shortId.toUpperCase()}` : `APT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    rawId: rawId,
    patientId: appt.patientId ?? "",
    patientName: displayName,
    initials: (displayName)
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
    appointmentType: appt.type ?? appt.appointmentType ?? "INDIVIDUAL",
    familyMemberId: appt.familyMemberId,
    familyMemberName: appt.familyMemberName,
    headPatientName: appt.patientName || "Unknown",
  };
}