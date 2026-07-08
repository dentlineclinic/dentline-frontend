import api from "@/lib/axios";
import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  taxAmount: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  receiptUrl: string | null;
  items: OrderItem[];
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  paymentStatus: "PENDING" | "APPROVED" | "REJECTED";
  shippingStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  createdAt: string;
}

export interface OrderListResponse {
  success: boolean;
  message: string;
  data: {
    content: Order[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

// ── Public ────────────────────────────────────────────────────────────────────

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
});

export const createOrder = async (formData: FormData): Promise<OrderResponse> => {
  const res = await publicApi.post("/orders", formData);
  return res.data;
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const fetchAdminOrders = async (page = 0, size = 20): Promise<OrderListResponse> => {
  const res = await api.get("/admin/orders", { params: { page, size } });
  return res.data;
};

export const updatePaymentStatus = async (
  id: string,
  paymentStatus: "APPROVED" | "REJECTED"
): Promise<OrderResponse> => {
  const res = await api.patch(`/admin/orders/${id}/payment`, null, { params: { paymentStatus } });
  return res.data;
};

export const updateShippingStatus = async (
  id: string,
  shippingStatus: "PROCESSING" | "SHIPPED" | "DELIVERED"
): Promise<OrderResponse> => {
  const res = await api.patch(`/admin/orders/${id}/shipping`, null, { params: { shippingStatus } });
  return res.data;
};
