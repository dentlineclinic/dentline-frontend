import api from "@/lib/axios";

export interface Patient {
  id: string;
  name: string;
  email: string;
  status: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalHistory?: string;
  referenceCode?: string;
  referencePoints?: number;
  lastVisit?: string;
}

export interface CreatePatientRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
}

export interface CreatePatientResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
export interface PatientDto {
  id: string; // UUID → string
  name: string;
  email: string;

  role: string;
  status: string; 

  mustChangePassword: boolean;
  profilePhotoUrl?: string;

  // Patient-specific fields
  phoneNumber?: string;
  dateOfBirth?: string; 
  gender?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;

  medicalHistory?: string;

  referenceCode?: string;
  referencePoints?: number;
}

export interface UpdatePatientProfileRequest {
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalHistory?: string;
}

export interface PatientResponse {
  success: boolean;
  data: {
    content: Patient[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
  message?: string;
}

export interface BookAppointmentRequest {
  appointmentDate: string; // ISO format
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string | null;
  doctorName: string | null;
  appointmentDate: string;
  status: string;
  createdAt: string;
}

export interface BookAppointmentResponse {
  success: boolean;
  message: string;
  data: Appointment;
}

export interface FetchAppointmentsResponse {
  success: boolean;
  message: string;
  data: {
    content: Appointment[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export const fetchMyAppointments = async (
  page = 0,
  size = 10
): Promise<FetchAppointmentsResponse> => {
  const res = await api.get("/appointments/my", {
    params: { page, size },
  });

  return res.data;
};

export const bookAppointment = async (
  payload: BookAppointmentRequest
): Promise<BookAppointmentResponse> => {
  const res = await api.post("/appointments", payload);
  return res.data;
};

export const fetchPatients = async (page = 0, size = 10, searchTerm = "") => {
  const params: any = { page, size };
  if (searchTerm.trim()) {
    params.search = searchTerm;
  }
  
  const response = await api.get<PatientResponse>("/users/patients", { params });
  return response.data;
};

export const createPatient = async (payload: CreatePatientRequest) => {
  const response = await api.post<CreatePatientResponse>(
    "/users/patients",
    payload
  );
  return response.data;
};

export const unlockPatient = async (patientId: string) => {
  const res = await api.patch(`/users/patients/${patientId}/unlock`);
  return res.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await api.post("/auth/change-password", data);
  return response.data;
};



export interface UploadPhotoResponse {
  success: boolean;
  message: string;
  data: PatientDto;
}

// ✅ Upload Profile Photo
export const uploadProfilePhoto = async (
  patientId: string,
  file: File
): Promise<UploadPhotoResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  // Do NOT set Content-Type manually — axios sets it with the correct boundary
  const response = await api.post(
    `/users/patients/${patientId}/profile/photo`,
    formData
  );

  return response.data;
};

// ✅ Patient Dashboard Types
export interface PatientHistoryDto {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string | null;
  doctorName: string | null;
  appointmentDate: string;
  diagnosis: string | null;
  treatment: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDashboardDto {
  patientName: string;
  profilePhotoUrl: string | null;
  today: string;
  completedAppointments: number;
  totalAppointments: number;
  lastAppointmentDate: string | null;
  recentHistories: PatientHistoryDto[];
}

export interface PatientDashboardResponse {
  success: boolean;
  message: string;
  data: PatientDashboardDto;
}

// ✅ Fetch Patient Dashboard
export const fetchPatientDashboard = async (): Promise<PatientDashboardResponse> => {
  const res = await api.get("/patient/dashboard");
  return res.data;
};

export const updatePatientProfile = async (
  patientId: string,
  payload: UpdatePatientProfileRequest
): Promise<{ success: boolean; message: string; data: PatientDto }> => {
  const res = await api.patch(`/users/patients/${patientId}/profile`, payload);
  return res.data;
};