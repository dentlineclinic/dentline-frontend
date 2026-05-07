import api from "@/lib/axios";

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

export const fetchAppointments = async (
  page = 0,
  size = 10
): Promise<AppointmentResponse> => {
  const response = await api.get(
    `/appointments?page=${page}&size=${size}`
  );
  return response.data;
};

export const markAppointmentArrived = async (id: string) => {
  const response = await api.patch(`/appointments/${id}/arrive`);
  return response.data;
};

export const assignDoctorToAppointment = async (
  id: string,
  doctorId: string
) => {
  const response = await api.patch(`/appointments/${id}/assign`, {
    doctorId,
  });
  return response.data;
};