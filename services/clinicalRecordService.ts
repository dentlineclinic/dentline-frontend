import api from "@/lib/axios";

export type ClinicalModule = "DENTAL" | "DERMATOLOGY";

export interface UnifiedClinicalRecord {
  id: string;
  recordType: ClinicalModule;
  patientId: string;
  patientName: string;
  doctorId: string | null;
  doctorName: string | null;
  appointmentId: string | null;
  appointmentDate: string | null;
  summary: string | null;
  amount: number | null;
  discount: number | null;
  amountPaid: number | null;
  balance: number | null;
  paymentStatus: string | null;
  status: string | null;
  familyMemberId: string | null;
  familyMemberName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export const fetchMyClinicalRecords = async (
  page = 0,
  size = 100
): Promise<UnifiedClinicalRecordPage> => {
  const res = await api.get("/clinical-records/my", {
    params: { page, size },
  });
  return res.data;
};

export interface UnifiedClinicalRecordPage {
  content: UnifiedClinicalRecord[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const fetchAllClinicalRecords = async (
  page = 0,
  size = 20,
  recordType?: ClinicalModule
): Promise<UnifiedClinicalRecordPage> => {
  const params: any = { page, size };
  if (recordType) params.recordType = recordType;
  const res = await api.get("/clinical-records/all", { params });
  return res.data;
};

export const fetchClinicalRecordsByPatient = async (
  patientId: string,
  page = 0,
  size = 20
): Promise<UnifiedClinicalRecordPage> => {
  const res = await api.get(`/clinical-records/patient/${patientId}`, {
    params: { page, size },
  });
  return res.data;
};

export const fetchClinicalRecordsByDoctor = async (
  doctorId: string,
  page = 0,
  size = 20
): Promise<UnifiedClinicalRecordPage> => {
  const res = await api.get(`/clinical-records/doctor/${doctorId}`, {
    params: { page, size },
  });
  return res.data;
};