// services/patientHistoryService.ts
import api from "@/lib/axios";

// ============================================
// TOOTH OBSERVATION TYPES (FDI)
// ============================================

export interface ToothObservation {
  id: string;
  fdiCode: string;
  toothType: "PERMANENT" | "PRIMARY";
  toothLabel: string;
  diagnosis: string;
  treatment: string;
  createdAt: string;
}

export interface AddToothObservationRequest {
  fdiCode: string;
  toothType: "PERMANENT" | "PRIMARY";
  diagnosis: string;
  treatment: string;
}

// ============================================
// PATIENT HISTORY TYPES
// ============================================

export interface PatientHistory {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  appointmentDate: string;
  observation: string;
  amount: number;
  discount: number;
  amountPaid: number;  // ✅ NEW
  balance: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  imageUrls: string[];
  videoUrls: string[];
  familyMemberId?: string;
  familyMemberName?: string;
  appointmentType?: "INDIVIDUAL" | "FAMILY";
  toothObservations?: ToothObservation[];
}

export interface PatientHistoryResponse {
  success: boolean;
  message: string;
  data: {
    content: PatientHistory[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface SinglePatientHistoryResponse {
  success: boolean;
  message: string;
  data: PatientHistory;
}

export interface RecordPaymentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    appointmentId: string;
    appointmentDate: string;
    observation: string;
    amount: number;
    discount: number;
    amountPaid: number;  // ✅ NEW
    balance: number;
    paymentStatus: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PaymentStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalRecords: number;
    totalBilled: number;
    totalRevenue: number;
    totalOutstanding: number;
    paidCount: number;
    pendingCount: number;
    unpaidCount: number;
    completedCount: number;
    completedRatePercent: number;
  };
}

export interface CreatePatientHistoryRequest {
  appointmentId: string;
  amount: number;
  discount: number;
}

export interface UpdateObservationRequest {
  observation: string;
}

// ============================================
// API FUNCTIONS
// ============================================

export const fetchPatientHistories = async (
  page = 0,
  size = 10,
  search?: string,
  paymentStatus?: string
): Promise<PatientHistoryResponse> => {
  const params: any = {
    page,
    size,
  };

  if (paymentStatus && paymentStatus !== "All") {
    params.paymentStatus = paymentStatus;
  }

  let endpoint = "/patient-history/all";
  
  if (search && search.trim()) {
    endpoint = "/patient-history/search";
    params.name = search.trim();
  }

  const response = await api.get(endpoint, { params });
  return response.data;
};

export const fetchPatientHistoriesById = async (
  patientId: string,
  page = 0,
  size = 10
): Promise<PatientHistoryResponse> => {
  const res = await api.get<PatientHistoryResponse>(
    `/patient-history/patient/${patientId}`,
    { params: { page, size } }
  );
  return res.data;
};

export const fetchIndividualHistoriesById = async (
  patientId: string,
  page = 0,
  size = 10
): Promise<PatientHistoryResponse> => {
  const res = await api.get<PatientHistoryResponse>(
    `/patient-history/patient/${patientId}/individual`,
    { params: { page, size } }
  );
  return res.data;
};

export const fetchFamilyHistoriesById = async (
  patientId: string,
  page = 0,
  size = 10
): Promise<PatientHistoryResponse> => {
  const res = await api.get<PatientHistoryResponse>(
    `/patient-history/patient/${patientId}/family`,
    { params: { page, size } }
  );
  return res.data;
};

export const fetchMyPatientHistories = async (
  page = 0,
  size = 10
): Promise<PatientHistoryResponse> => {
  const res = await api.get<PatientHistoryResponse>(
    "/patient-history/my",
    { params: { page, size } }
  );
  return res.data;
};

export const fetchPatientHistoryById = async (
  id: string
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.get(`/patient-history/${id}`);
  return res.data;
};

export const fetchPayments = async (page = 0, size = 10): Promise<PatientHistoryResponse> => {
  const response = await api.get("/patient-history/all", {
    params: { page, size },
  });
  return response.data;
};

export const fetchPaymentStats = async (): Promise<PaymentStatsResponse> => {
  const res = await api.get("/admin/payments/stats");
  return res.data;
};

export const searchPayments = async (
  name: string,
  page = 0,
  size = 10
): Promise<any> => {
  const response = await api.get("/admin/payments/search", {
    params: { name, page, size },
  });
  return response.data;
};

export const createPatientHistory = async (
  payload: CreatePatientHistoryRequest
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.post("/patient-history", payload);
  return res.data;
};

export const updateObservation = async (
  historyId: string,
  payload: UpdateObservationRequest
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.patch(
    `/patient-history/${historyId}/observation`,
    payload
  );
  return res.data;
};

export const completePatientHistory = async (
  historyId: string
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.patch(`/patient-history/${historyId}/complete`);
  return res.data;
};

export const recordPayment = async (
  historyId: string,
  amount: number
): Promise<RecordPaymentResponse> => {
  const res = await api.post(
    `/patient-history/${historyId}/payment`,
    { amount }
  );
  return res.data;
};

export const markPaymentUnpaid = async (historyId: string): Promise<RecordPaymentResponse> => {
  const res = await api.patch(`/patient-history/${historyId}/mark-unpaid`);
  return res.data;
};

export const uploadHistoryImage = async (
  historyId: string,
  file: File
): Promise<SinglePatientHistoryResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    `/patient-history/${historyId}/upload/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

export const uploadHistoryVideo = async (
  historyId: string,
  file: File
): Promise<SinglePatientHistoryResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    `/patient-history/${historyId}/upload/video`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

export const deleteHistoryImage = async (
  historyId: string,
  imageId: string
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.delete(`/patient-history/${historyId}/image/${imageId}`);
  return res.data;
};

export const deleteHistoryVideo = async (
  historyId: string,
  videoId: string
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.delete(`/patient-history/${historyId}/video/${videoId}`);
  return res.data;
};

// ============================================
// FDI TOOTH OBSERVATION API FUNCTIONS
// ============================================

export const addToothObservation = async (
  historyId: string,
  request: AddToothObservationRequest
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.post(
    `/patient-history/${historyId}/tooth-observation`,
    request
  );
  return res.data;
};

export const deleteToothObservation = async (
  historyId: string,
  toothObservationId: string
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.delete(
    `/patient-history/${historyId}/tooth-observation/${toothObservationId}`
  );
  return res.data;
};