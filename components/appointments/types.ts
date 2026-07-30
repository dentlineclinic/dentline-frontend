// Shared UI appointment type used across calendar components
import { safeSlice, safeToUpperCase, getSafeInitials, formatId } from "@/lib/safeUtils";

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
  headPatientName?: string;
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
  // Guard against null/undefined appointment object
  if (!appt) {
    console.warn('mapToUIAppointment called with null/undefined appointment');
    return {
      id: formatId('', 'APT-', 6),
      rawId: '',
      patientId: '',
      patientName: 'Unknown',
      initials: 'U',
      doctorId: null,
      doctorName: 'Unassigned',
      date: '',
      status: 'BOOKED',
      observation: '',
      appointmentType: 'INDIVIDUAL',
    };
  }

  // Use familyMemberName if available for display
  const displayName = appt.familyMemberName || appt.patientName || 'Unknown';
  
  // Safely get the ID
  const rawId = appt.id || appt.appointmentId || '';
  
  return {
    id: formatId(rawId, 'APT-', 6),
    rawId: rawId,
    patientId: appt.patientId || appt.patient?.id || '',
    patientName: displayName,
    initials: getSafeInitials(displayName),
    doctorId: appt.doctorId ?? null,
    doctorName: appt.doctorName || 'Unassigned',
    date: appt.appointmentDate || appt.date || '',
    status: appt.status || 'BOOKED',
    observation: appt.observation || 'No notes',
    appointmentType: appt.type || appt.appointmentType || 'INDIVIDUAL',
    familyMemberId: appt.familyMemberId || undefined,
    familyMemberName: appt.familyMemberName || undefined,
    headPatientName: appt.patientName || 'Unknown',
  };
}