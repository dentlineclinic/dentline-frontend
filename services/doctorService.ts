import api from "@/lib/axios";


export interface Doctor {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
  specialization: string;
}
export interface CreateDoctorRequest {
  name: string;
  email: string;
  password: string;
  specialization: string;
  licenseNumber: string;
}
export interface DoctorAppointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string | null;
  doctorName: string | null;
  appointmentDate: string;
  status: string;
  createdAt: string;
}

export interface DoctorDto {
  id: string;
  name: string;
  email: string;

  role: string;
  status: string;

  mustChangePassword: boolean;
  profilePhotoUrl?: string;

  // Doctor-specific
  licenseNumber?: string;
  specialization?: string;
  qualifications?: string;
}

export interface DoctorProfileResponse {
  success: boolean;
  message: string;
  data: DoctorDto;
}

export interface DoctorAppointmentsResponse {
  success: boolean;
  message: string;
  data: {
    content: DoctorAppointment[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}
export interface CreateDoctorResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    mustChangePassword: boolean;
  };
}

export interface BasicResponse {
  success: boolean;
  message: string;
}

export interface DoctorResponse {
  success: boolean;
  message: string;
  data: {
    content: Doctor[];
    totalElements: number;
    totalPages: number;
  };
}

export const fetchDoctors = async (
  page = 0,
  size = 10,
  search = ""
): Promise<DoctorResponse> => {
  const params: any = { page, size };

  if (search.trim()) {
    params.search = search;
  }

  const response = await api.get("/users/doctors", { params });
  return response.data;
};

export const createDoctor = async (payload: CreateDoctorRequest) => {
  const response = await api.post<CreateDoctorResponse>(
    "/users/doctors",
    payload
  );
  return response.data;
};
export const changePassword = async (
  payload: {
    currentPassword: string;
    newPassword: string;
  }
): Promise<BasicResponse> => {
  const res = await api.post("/auth/change-password", payload);
  return res.data;
};

export const suspendDoctor = async (doctorId: string) => {
  const res = await api.patch(`/users/doctors/${doctorId}/suspend`);
  return res.data;
};

export const activateDoctor = async (doctorId: string) => {
  const res = await api.patch(`/users/doctors/${doctorId}/activate`);
  return res.data;
};

export interface DashboardAppointment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  status: string;
}


export interface DoctorDashboardResponse {
  success: boolean;
  message: string;
  data: {
    doctorName: string;
    profilePhotoUrl: string | null;
    today: string;
    todayAssignedAppointments: number;
    todayAppointments: DashboardAppointment[];
    completedHistories: number;
    pendingHistories: number;
    totalReviews: number;
    averageRating: number;
    ratingPercent: number;
  };
}

export const fetchDoctorDashboard = async (): Promise<DoctorDashboardResponse> => {
  const res = await api.get("/doctor/dashboard");
  return res.data;
};

export const fetchDoctorAppointments = async (
  page = 0,
  size = 10
): Promise<DoctorAppointmentsResponse> => {
  const res = await api.get("/appointments/doctor", {
    params: { page, size },
  });

  return res.data;
};

export const uploadDoctorProfilePhoto = async (
  doctorId: string,
  file: File
): Promise<DoctorProfileResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  // Do NOT set Content-Type manually — axios sets it with the correct boundary
  const res = await api.post(
    `/users/doctors/${doctorId}/profile/photo`,
    formData
  );

  return res.data;
};


export const updateObservation = async (
  historyId: string,
  observation: string
): Promise<BasicResponse> => {
  const res = await api.patch(`/patient-history/${historyId}/observation`, {
    observation,
  });

  return res.data;
};

export const markHistoryAsCompleted = async (
  historyId: string
): Promise<BasicResponse> => {
  const res = await api.patch(`/patient-history/${historyId}/complete`);
  return res.data;
};

export const uploadHistoryImage = async (
  historyId: string,
  file: File
): Promise<BasicResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    `/patient-history/${historyId}/upload/image`,
    formData
  );

  return res.data;
};

export const uploadHistoryVideo = async (
  historyId: string,
  file: File
): Promise<BasicResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    `/upload/video/${historyId}`,
    formData
  );

  return res.data;
};