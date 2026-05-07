import api from "@/lib/axios";

// ✅ Single source of truth for Notification type
export type Notification = {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  type: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export interface NotificationPageResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface NotificationApiResponse {
  success: boolean;
  message?: string;
  data: NotificationPageResponse;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
  message?: string;
}

export interface SimpleResponse {
  success: boolean;
  message?: string;
}

export const getNotifications = async (page = 0, size = 10): Promise<NotificationApiResponse> => {
  const response = await api.get("/notifications", {
    params: { page, size }
  });
  return response.data;
};

export const getUnreadNotifications = async (page = 0, size = 10): Promise<NotificationApiResponse> => {
  const response = await api.get("/notifications/unread", {
    params: { page, size }
  });
  return response.data;
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await api.get("/notifications/unread/count");
  return response.data;
};

export const markNotificationAsRead = async (id: string): Promise<SimpleResponse> => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<SimpleResponse> => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};