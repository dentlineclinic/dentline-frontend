import api from "@/lib/axios";

// ── Core types ────────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  status: string;
  reason?: string;
  patientId?: string;
  familyMemberId?: string;
  type?: "INDIVIDUAL" | "FAMILY";
}

export interface AppointmentResponse {
  data: {
    content: Appointment[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface FamilyAppointmentResult {
  id: string;
  patientId: string;
  patientName: string;
  familyMemberId?: string;
  familyMemberName?: string;
  appointmentDate: string;
  status: string;
  type: "INDIVIDUAL" | "FAMILY";
  createdAt: string;
}

// ── Family Appointment Request Types ──────────────────────────────────────────

export interface BookFamilyAppointmentRequest {
  appointmentDate: string; // YYYY-MM-DD
  includeHeadPatient: boolean;
  familyMemberIds: string[];
}

export interface AdminBookFamilyAppointmentRequest {
  headPatientId: string;
  appointmentDate: string; // YYYY-MM-DD
  includeHeadPatient: boolean;
  familyMemberIds: string[];
}

export interface BookFamilyAppointmentResponse {
  success: boolean;
  message: string;
  data: FamilyAppointmentResult[];
}

// ── Core service functions ────────────────────────────────────────────────────

export const fetchAppointments = async (
  page = 0,
  size = 10
): Promise<AppointmentResponse> => {
  const response = await api.get(`/appointments?page=${page}&size=${size}`);
  return response.data;
};

export const markAppointmentArrived = async (id: string) => {
  const response = await api.patch(`/appointments/${id}/arrive`);
  return response.data;
};

export const assignDoctorToAppointment = async (id: string, doctorId: string) => {
  const response = await api.patch(`/appointments/${id}/assign`, { doctorId });
  return response.data;
};

export const searchAppointments = async (
  name: string,
  page = 0,
  size = 10
): Promise<AppointmentResponse> => {
  const response = await api.get(
    `/appointments/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`
  );
  return response.data;
};

// ── Admin booking & reschedule ────────────────────────────────────────────────

export interface AdminBookAppointmentRequest {
  patientId: string;
  appointmentDate: string; // YYYY-MM-DD
}

export const adminBookAppointment = async (payload: AdminBookAppointmentRequest) => {
  const response = await api.post("/appointments/admin-book", payload);
  return response.data;
};

// ── Family Appointment Booking ────────────────────────────────────────────────

/**
 * Patient books a family appointment (POST /appointments/family)
 * The logged-in patient's family group is used as the source of members.
 */
export const bookFamilyAppointment = async (
  payload: BookFamilyAppointmentRequest
): Promise<BookFamilyAppointmentResponse> => {
  const response = await api.post("/appointments/family", payload);
  return response.data;
};

/**
 * Admin books a family appointment (POST /appointments/admin/family-book)
 * Admin specifies the head patient ID in the request.
 */
export const adminBookFamilyAppointment = async (
  payload: AdminBookFamilyAppointmentRequest
): Promise<BookFamilyAppointmentResponse> => {
  const response = await api.post("/appointments/admin/family-book", payload);
  return response.data;
};

export interface RescheduleAppointmentRequest {
  newAppointmentDate: string; // YYYY-MM-DD
}

export const rescheduleAppointment = async (
  appointmentId: string,
  payload: RescheduleAppointmentRequest
) => {
  const response = await api.patch(`/appointments/${appointmentId}/reschedule`, payload);
  return response.data;
};

// ── Calendar API ──────────────────────────────────────────────────────────────

export interface CalendarDay {
  date: string;
  totalAppointments: number;
  booked: number;
  arrived: number;
  assigned: number;
  completed: number;
  cancelled: number;
  missed: number;
}

export interface MonthlyCalendarData {
  year: number;
  month: number;
  monthName: string;
  numberOfDays: number;
  previousMonth: number;
  previousYear: number;
  nextMonth: number;
  nextYear: number;
  days: CalendarDay[];
}

export interface MonthlyCalendarResponse {
  success: boolean;
  message: string;
  data: MonthlyCalendarData;
}

export interface CalendarAppointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string | null;
  doctorName: string | null;
  appointmentDate: string;
  status: string;
  observation?: string;
  createdAt: string;
  familyMemberId?: string | null;
  familyMemberName?: string | null;
  appointmentType?: "INDIVIDUAL" | "FAMILY";
  patient?: {
    id: string;
    name: string;
  };
  familyMember?: {
    id: string;
    name: string;
  };
}

export interface CalendarDayResponse {
  success: boolean;
  message: string;
  data: {
    content: CalendarAppointment[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export const fetchMonthlyCalendar = async (
  year: number,
  month: number
): Promise<MonthlyCalendarResponse> => {
  const response = await api.get("/appointments/calendar", { params: { year, month } });
  return response.data;
};

export const fetchAppointmentsByDate = async (
  date: string,
  page = 0,
  size = 20
): Promise<CalendarDayResponse> => {
  const response = await api.get(`/appointments/calendar/${date}`, { params: { page, size } });
  return response.data;
};

export const cancelAppointment = async (appointmentId: string) => {
  const response = await api.patch(`/appointments/${appointmentId}/cancel`);
  return response.data;
};