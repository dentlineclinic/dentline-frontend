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
  fdiCode?: string;
  fdiCodes?: string[];
  toothType: "PERMANENT" | "PRIMARY";
  diagnosis: string;
  treatment: string;
}

// ============================================
// ✅ NEW: CLINIC LOCATION & DENTAL PROCEDURE TYPES
// ============================================

export type ClinicLocation = "IKEJA" | "GBAGADA";

export type DentalProcedure =
  | "S_AND_P"
  | "CURETTAGE"
  | "FILLING"
  | "X_RAY"
  | "EXTRACTION"
  | "TEETH_WHITENING"
  | "RCT"
  | "METALLIC_BRACES"
  | "IMPLANT"
  | "CROWN"
  | "BRIDGE";

// Human-readable labels for the UI
export const CLINIC_LOCATION_LABELS: Record<ClinicLocation, string> = {
  IKEJA: "Ikeja",
  GBAGADA: "Gbagada",
};

export const DENTAL_PROCEDURE_LABELS: Record<DentalProcedure, string> = {
  S_AND_P: "S&P",
  CURETTAGE: "Curettage",
  FILLING: "Filling",
  X_RAY: "X-ray",
  EXTRACTION: "Extraction",
  TEETH_WHITENING: "Teeth Whitening",
  RCT: "RCT",
  METALLIC_BRACES: "Metallic Braces",
  IMPLANT: "Implant",
  CROWN: "Crown",
  BRIDGE: "Bridge",
};

// Ordered list for rendering checkboxes / selects
export const DENTAL_PROCEDURE_OPTIONS: DentalProcedure[] = [
  "S_AND_P",
  "CURETTAGE",
  "FILLING",
  "X_RAY",
  "EXTRACTION",
  "TEETH_WHITENING",
  "RCT",
  "METALLIC_BRACES",
  "IMPLANT",
  "CROWN",
  "BRIDGE",
];

export const CLINIC_LOCATION_OPTIONS: ClinicLocation[] = ["IKEJA", "GBAGADA"];

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

  // ✅ NEW
  location?: ClinicLocation | null;
  procedures?: DentalProcedure[];
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

// ✅ UPDATED: location required, procedures required (at least 1)
export interface CreatePatientHistoryRequest {
  appointmentId: string;
  amount?: number | null;
  discount?: number;
  location: ClinicLocation;
  procedures: DentalProcedure[];
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
  const params: any = { page, size };

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
    { headers: { "Content-Type": "multipart/form-data" } }
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
    { headers: { "Content-Type": "multipart/form-data" } }
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

// ============================================
// PATIENT SEARCH
// ============================================

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