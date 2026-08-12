import api from "@/lib/axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BroadcastRecipient {
  id: string;
  email: string;
  name: string | null;
  optOut: boolean;
  createdAt: string;
}

export interface BroadcastHistoryDto {
  id: string;
  subject: string;
  body: string;
  recipientCount: number;
  createdBy: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ── Recipients ────────────────────────────────────────────────────────────────

export const addBroadcastRecipient = async (payload: {
  email: string;
  name?: string;
}): Promise<{ success: boolean; message: string; data: BroadcastRecipient }> => {
  const res = await api.post("/admin/broadcasts/recipients", payload);
  return res.data;
};

export const getBroadcastRecipients = async (
  page = 0,
  size = 10
): Promise<{ success: boolean; message: string; data: PageResponse<BroadcastRecipient> }> => {
  const res = await api.get("/admin/broadcasts/recipients", { params: { page, size } });
  return res.data;
};

// ── Send broadcast ────────────────────────────────────────────────────────────

export const sendBroadcast = async (payload: {
  subject: string;
  body: string;
}): Promise<{ success: boolean; message: string; data: BroadcastHistoryDto }> => {
  const res = await api.post("/admin/broadcasts", payload);
  return res.data;
};

// ── History ───────────────────────────────────────────────────────────────────

export const getBroadcastHistory = async (
  page = 0,
  size = 10
): Promise<{ success: boolean; message: string; data: PageResponse<BroadcastHistoryDto> }> => {
  const res = await api.get("/admin/broadcasts/history", { params: { page, size } });
  return res.data;
};
