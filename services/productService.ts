import api from "@/lib/axios";
import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  taxPercentage: number;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
}

export interface ProductListResponse {
  success: boolean;
  message: string;
  data: {
    content: Product[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

// ── Public endpoints ──────────────────────────────────────────────────────────

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
});

export const fetchPublicProducts = async (page = 0, size = 20): Promise<ProductListResponse> => {
  const res = await publicApi.get("/products", { params: { page, size } });
  return res.data;
};

// ── Admin endpoints ───────────────────────────────────────────────────────────

export const fetchAdminProducts = async (page = 0, size = 20): Promise<ProductListResponse> => {
  const res = await api.get("/admin/products", { params: { page, size } });
  return res.data;
};

export const createProduct = async (formData: FormData): Promise<ProductResponse> => {
  const res = await api.post("/admin/products", formData);
  return res.data;
};

export const updateProduct = async (id: string, formData: FormData): Promise<ProductResponse> => {
  const res = await api.patch(`/admin/products/${id}`, formData);
  return res.data;
};

export const activateProduct = async (id: string): Promise<ProductResponse> => {
  const res = await api.patch(`/admin/products/${id}/activate`);
  return res.data;
};

export const deactivateProduct = async (id: string): Promise<ProductResponse> => {
  const res = await api.patch(`/admin/products/${id}/deactivate`);
  return res.data;
};
