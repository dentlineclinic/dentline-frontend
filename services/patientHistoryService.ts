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
  fdiCode?: string;  // Legacy single tooth - optional now
  fdiCodes?: string[]; // New multi-tooth support
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
  hmo: string | null;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  appointmentDate: string;
  observation: string;
  amount: number | null;
  discount: number;
  amountPaid: number;
  balance: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  imageUrls: string[];
  imageIds: string[];
  videoUrls: string[];
  videoIds: string[];
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
    hmo: string | null;
    doctorId: string;
    doctorName: string;
    appointmentId: string;
    appointmentDate: string;
    observation: string;
    amount: number | null;
    discount: number;
    amountPaid: number;
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
  amount?: number | null;
  discount?: number;
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


// Add this to patientHistoryService.ts after the existing types

export interface PatientSearchResult {
  patientId: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface PatientSearchResponse {
  success: boolean;
  message: string;
  data: {
    content: PatientSearchResult[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

// Add this API function
export const searchPatientsForHistory = async (
  name: string,
  page = 0,
  size = 10
): Promise<PatientSearchResponse> => {
  const res = await api.get<PatientSearchResponse>(
    "/patient-history/patients/search",
    { params: { name, page, size } }
  );
  return res.data;
};


// ============================================
// DERMATOLOGY PAYMENT
// ============================================

export const recordDermatologyPayment = async (
  dermatologyRecordId: string,
  amountPaid: number,
  notes?: string
) => {
  const res = await api.post(
    `/dermatology/${dermatologyRecordId}/payment`,
    { amountPaid, notes }
  );
  return res.data;
};

export const markDermatologyPaymentUnpaid = async (
  dermatologyRecordId: string
) => {
  const res = await api.patch(
    `/dermatology/${dermatologyRecordId}/mark-unpaid`
  );
  return res.data;
};


// ============================================
// DERMATOLOGY RECORD CREATION
// ============================================

export interface CreateDermatologyRecordRequest {
  appointmentId: string;
  observation?: string;   // optional — doctor fills in later
  amount?: number | null;
  discount?: number;
}

export const createDermatologyRecord = async (
  payload: CreateDermatologyRecordRequest
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.post("/dermatology", payload);
  return res.data;
};

// ============================================
// DERMATOLOGY RECORD MANAGEMENT (doctor-side)
// ============================================

export interface DermatologySkinCondition {
  id: string;
  dermatologyRecordId: string;
  conditionName: string;
  affectedArea: string | null;
  severity: "MILD" | "MODERATE" | "SEVERE";
  diagnosis: string | null;
  treatment: string | null;
  createdAt: string;
}

export interface DermatologyImage {
  id: string;
  dermatologyRecordId: string;
  imageUrl: string;
  uploadedAt: string;
}

export interface DermatologyRecordDetail {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentType: "INDIVIDUAL" | "FAMILY";
  familyMemberId?: string;
  familyMemberName?: string;
  observation: string | null;
  amount: number | null;
  discount: number;
  amountPaid: number;
  balance: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  skinConditions: DermatologySkinCondition[];
  images: DermatologyImage[];
}

export interface SingleDermatologyRecordResponse {
  success: boolean;
  message: string;
  data: DermatologyRecordDetail;
}

export interface AddSkinConditionRequest {
  dermatologyRecordId: string;
  conditionName: string;
  affectedArea?: string;
  severity?: "MILD" | "MODERATE" | "SEVERE";
  diagnosis?: string;
  treatment?: string;
}

export interface UpdateSkinConditionRequest {
  conditionName: string;
  affectedArea?: string;
  severity?: "MILD" | "MODERATE" | "SEVERE";
  diagnosis?: string;
  treatment?: string;
}

export const fetchDermatologyRecordById = async (
  id: string
): Promise<SingleDermatologyRecordResponse> => {
  const res = await api.get(`/dermatology/${id}`);
  return res.data;
};

export const updateDermatologyObservation = async (
  recordId: string,
  observation: string
): Promise<SingleDermatologyRecordResponse> => {
  const res = await api.patch(`/dermatology/${recordId}/observation`, { observation });
  return res.data;
};

export const addSkinCondition = async (
  recordId: string,
  payload: Omit<AddSkinConditionRequest, "dermatologyRecordId">
): Promise<SingleDermatologyRecordResponse> => {
  const res = await api.post(`/dermatology/${recordId}/conditions`, {
    dermatologyRecordId: recordId,
    ...payload,
  });
  return res.data;
};

export const updateSkinCondition = async (
  recordId: string,
  conditionId: string,
  payload: UpdateSkinConditionRequest
): Promise<SingleDermatologyRecordResponse> => {
  const res = await api.patch(
    `/dermatology/${recordId}/conditions/${conditionId}`,
    payload
  );
  return res.data;
};

export const deleteSkinCondition = async (
  recordId: string,
  conditionId: string
): Promise<SingleDermatologyRecordResponse> => {
  const res = await api.delete(`/dermatology/${recordId}/conditions/${conditionId}`);
  return res.data;
};

export const uploadDermatologyImage = async (
  recordId: string,
  file: File
): Promise<SingleDermatologyRecordResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    `/dermatology/${recordId}/upload/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const deleteDermatologyImage = async (
  recordId: string,
  imageId: string
): Promise<SingleDermatologyRecordResponse> => {
  const res = await api.delete(`/dermatology/${recordId}/image/${imageId}`);
  return res.data;
};

export const completeDermatologyRecord = async (
  recordId: string
): Promise<SingleDermatologyRecordResponse> => {
  const res = await api.patch(`/dermatology/${recordId}/complete`);
  return res.data;
};