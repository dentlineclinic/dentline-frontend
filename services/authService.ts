import api from "@/lib/axios";
import { clearAuthState } from "@/lib/auth";

export const loginUser = async (payload: {
  identifier: string;
  password: string;
  role: string;
}) => {
  const response = await api.post("/auth/login", payload);
  return response;
};
export interface BasicResponse {
  success: boolean;
  message: string;
}
export const requestRegistrationOtp = async (payload: {
  email?: string;
  phoneNumber?: string;
}) => {
  const response = await api.post(
    "/auth/register/request-otp",
    payload
  );

  return response;
};
export const verifyRegistrationOtp = async (payload: {
  email?: string;
  phoneNumber?: string;
  otp: string;
}) => {
  const response = await api.post(
    "/auth/register/verify-otp",
    payload
  );

  return response;
};

export const completeRegistration = async (payload: {
  name: string;
  email?: string;
  password: string;
  phoneNumber?: string;
  verifiedIdentifier: string;
  dateOfBirth: string;
  gender: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalHistory: string;
  hmo: string;
  hmoId: string;
  referenceCode?: string;
}) => {
  const response = await api.post("/auth/register", payload);
  return response;
};
export const requestAdminOtp = async (payload: { email: string }) => {
  const response = await api.post("/auth/otp/request", payload);
  return response;
};

export const verifyAdminOtp = async (payload: {
  email: string;
  otp: string;
}) => {
  const response = await api.post("/auth/otp/verify", payload);
  return response;
};

export const getDoctorId = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || payload?.userId || null;
  } catch {
    return null;
  }
};

export const changePassword = async (
  payload: {
    currentPassword: string;
    newPassword: string;
  }
): Promise<BasicResponse> => {
  const res = await api.post("/auth/change-password", payload);
  return res.data;
};


export const logoutUser = async (): Promise<BasicResponse> => {
  const response = await api.post("/auth/logout");
  // Clear all auth state: localStorage + cookies
  clearAuthState();
  return response.data;
};

export const requestPasswordOtp = async (payload: {
  email?: string;
  phoneNumber?: string;
}): Promise<BasicResponse> => {
  const res = await api.post("/auth/forgot-password/request-otp", payload);
  return res.data;
};

export const resetForgottenPassword = async (payload: {
  email?: string;
  phoneNumber?: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<BasicResponse> => {
  const res = await api.post("/auth/forgot-password/reset", payload);
  return res.data;
};