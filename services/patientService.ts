import api from "@/lib/axios";

type Patient = {
  id: string;
  shortId: string;
  fullName: string;
  initials: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalHistory: string;
  referenceCode: string;
  referencePoints: number;
  lastVisit: string;
  status: string;
  hmo: string;
  hmoId: string;
};

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
  patientId: string;      // Patient ID (from your backend)
  userId: string | null;  // User ID (from your backend)
  hasAccount: boolean;
  name: string;
  email: string;
  phoneNumber: string;
  lastVerificationType?: "EMAIL" | "PHONE";
  role: string;
  status: string;
  mustChangePassword: boolean;
  profilePhotoUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalHistory?: string;
  referenceCode?: string;
  referencePoints?: number;
  hmo: string;
  hmoId: string;
}

export interface UpdatePatientProfileRequest {
  email?: string; 
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalHistory?: string;
  hmo?: string;
  hmoId?: string;
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
  appointmentDate: string;
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

// DEPRECATED: Use fetchMyPatientProfile() instead
export const fetchPatientProfile = async (
  patientId: string
): Promise<{ success: boolean; data: PatientDto }> => {
  const res = await api.get(`/users/patients/${patientId}/profile`);
  return res.data;
};

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

export const cancelAppointment = async (appointmentId: string) => {
  const res = await api.patch(`/appointments/${appointmentId}/cancel`);
  return res.data;
};

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

export const fetchMyPatientProfile = async (): Promise<{ success: boolean; data: PatientDto }> => {
  const res = await api.get("/users/patients/me/profile");
  return res.data;
};

export const fetchPatients = async (
  page = 0,
  size = 10,
  searchTerm = ""
) => {
  try {
    if (searchTerm.trim()) {
      const response = await api.get<PatientResponse>(
        "/users/patients/search",
        {
          params: {
            name: searchTerm,
            page,
            size
          }
        }
      );

      return {
        success: response.data.success ?? true,
        data: {
          content: response.data?.data?.content || [],
          totalElements: response.data?.data?.totalElements || 0,
          totalPages: response.data?.data?.totalPages || 0,
          size: response.data?.data?.size || size,
          number: response.data?.data?.number || page,
        },
        message: response.data?.message || "Patients retrieved"
      };
    }

    const response = await api.get<PatientResponse>(
      "/users/patients",
      {
        params: {
          page,
          size
        }
      }
    );

    return {
      success: response.data.success ?? true,
      data: {
        content: response.data?.data?.content || [],
        totalElements: response.data?.data?.totalElements || 0,
        totalPages: response.data?.data?.totalPages || 0,
        size: response.data?.data?.size || size,
        number: response.data?.data?.number || page,
      },
      message: response.data?.message || "Patients retrieved"
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      success: false,
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: size,
        number: page,
      },
      message: "Failed to fetch patients"
    };
  }
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

// IMPORTANT: This endpoint expects userId (User ID), not patientId
export const uploadProfilePhoto = async (
  userId: string,
  file: File
): Promise<UploadPhotoResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/users/patients/user/${userId}/profile/photo`,
    formData
  );

  return response.data;
};

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
  nextAppointmentDate: string | null;
  referenceCode: string | null;
  referencePoints: number;
  recentHistories: PatientHistoryDto[];
}

export interface PatientDashboardResponse {
  success: boolean;
  message: string;
  data: PatientDashboardDto;
}

export const fetchPatientDashboard = async (): Promise<PatientDashboardResponse> => {
  const res = await api.get("/patient/dashboard");
  return res.data;
};

// IMPORTANT: This endpoint expects userId (User ID), not patientId
export const updatePatientProfile = async (
  userId: string,
  payload: UpdatePatientProfileRequest
): Promise<{ success: boolean; message: string; data: PatientDto }> => {
  const res = await api.patch(`/users/patients/user/${userId}/profile`, payload);
  return res.data;
};