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
  flyerImageUrl?: string | null;
  imagePosition?: string | null;
  imageWidth?: number | null;
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

/**
 * Send a broadcast email with optional flyer image
 * 
 * @param formData - FormData containing:
 *   - subject: string (required)
 *   - body: string (required)
 *   - flyerImage: File (optional) - image file upload
 *   - flyerImageUrl: string (optional) - image URL
 *   - imagePosition: string (optional) - 'top' | 'middle' | 'bottom' (default: 'middle')
 *   - imageWidth: number (optional) - 1-100 (default: 80)
 */
export const sendBroadcast = async (
  formData: FormData
): Promise<{ success: boolean; message: string; data: BroadcastHistoryDto }> => {
  const res = await api.post("/admin/broadcasts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// ── CSV Import ────────────────────────────────────────────────────────────────

export interface ImportRecipientsResponse {
  fileName: string;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  failedEmails: string[];
  duplicateEmails: string[];
  message: string;
}

export const importRecipientsFromCsv = async (
  file: File
): Promise<{ success: boolean; message: string; data: ImportRecipientsResponse }> => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/admin/broadcasts/import", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getBroadcastHistory = async (
  page = 0,
  size = 10
): Promise<{ success: boolean; message: string; data: PageResponse<BroadcastHistoryDto> }> => {
  const res = await api.get("/admin/broadcasts/history", { params: { page, size } });
  return res.data;
};