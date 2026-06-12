// services/patientHistoryService.ts
import api from "@/lib/axios";

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
  balance: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  imageUrls: string[];
  videoUrls: string[];
}

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

  if (search) {
    params.search = search;
  }

  if (paymentStatus && paymentStatus !== "All") {
    params.paymentStatus = paymentStatus;
  }

  const response = await api.get("/patient-history/all", {
    params,
  });

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
    balance: number;
    paymentStatus: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

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
  const res = await api.patch(
    `/patient-history/${historyId}/mark-unpaid`
  );
  return res.data;
};

// fetchPayments is an alias for fetchPatientHistories — uses the correct endpoint
export const fetchPayments = async (page = 0, size = 10): Promise<PatientHistoryResponse> => {
  const response = await api.get("/patient-history/all", {
    params: { page, size },
  });
  return response.data;
};

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

export const fetchPaymentStats = async (): Promise<PaymentStatsResponse> => {
  const res = await api.get("/admin/payments/stats");
  return res.data;
};



export const fetchMyPatientHistories = async (
  page = 0,
  size = 10
): Promise<PatientHistoryResponse> => {
  const res = await api.get<PatientHistoryResponse>(
    "/patient-history/my",
    {
      params: { page, size },
    }
  );

  return res.data;
};

export interface SinglePatientHistoryResponse {
  success: boolean;
  message: string;
  data: PatientHistory;
}

export const fetchPatientHistoryById = async (
  id: string
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.get(`/patient-history/${id}`);
  return res.data;
};


export interface CreatePatientHistoryRequest {
  appointmentId: string;
  amount: number;
}

export const createPatientHistory = async (
  payload: CreatePatientHistoryRequest
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.post("/patient-history", payload);

  return res.data;
};

export interface UpdateObservationRequest {
  observation: string;
}

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
  const res = await api.patch(
    `/patient-history/${historyId}/complete`
  );

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
  const res = await api.delete(
    `/patient-history/${historyId}/image/${imageId}`
  );

  return res.data;
};


export const deleteHistoryVideo = async (
  historyId: string,
  videoId: string
): Promise<SinglePatientHistoryResponse> => {
  const res = await api.delete(
    `/patient-history/${historyId}/video/${videoId}`
  );

  return res.data;
};


export const searchPayments = async (
  name: string,
  page = 0,
  size = 10
): Promise<any> => {
  const response = await api.get("/admin/payments/search", {
    params: {
      name,
      page,
      size,
    },
  });

  return response.data;
};