import api from "@/lib/axios";

// ── Core types ────────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  status: string;
  reason?: string;
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
