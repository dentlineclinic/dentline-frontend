import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminDashboardAppointment {
  id: string;
  patientName: string;
  doctorName: string | null;
  appointmentDate: string;
  status: string;
  observation?: string;
  reason?: string;
}

export interface AdminDashboardData {
  today: string;
  totalPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  satisfactionRatePercent: number;
  latestAppointments: AdminDashboardAppointment[];
}

export interface AdminDashboardResponse {
  success: boolean;
  message: string;
  data: AdminDashboardData;
}

export interface AdminPaymentSummaryData {
  totalAmount: number;
  totalBalance: number;
  totalPatientHistories: number;
}

export interface AdminPaymentSummaryResponse {
  success: boolean;
  message: string;
  data: AdminPaymentSummaryData;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const fetchAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};

export const fetchAdminPaymentSummary = async (): Promise<AdminPaymentSummaryResponse> => {
  const res = await api.get("/admin/dashboard/payments");
  return res.data;
};

export const addReferencePoints = async (
  patientId: string,
  points: number,
  reason?: string
) => {
  const params = new URLSearchParams({
    patientId,
    points: points.toString(),
  });

  if (reason) params.append("reason", reason);

  const res = await api.post(`/admin/reference-points/add?${params.toString()}`);
  return res.data;
};


export const removeReferencePoints = async (payload: {
  patientId: string;
  pointsToRemove: number;
  reason?: string;
}) => {
  const res = await api.post(`/admin/reference-points/remove`, payload);
  return res.data;
};

