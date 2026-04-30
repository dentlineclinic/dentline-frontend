import api from "@/lib/axios";

export const loginUser = async (payload: {
  email: string;
  password: string;
  role: string;
}) => {
  const response = await api.post("/auth/login", payload);
  return response;
};

export const requestRegistrationOtp = async (payload: { email: string }) => {
  const response = await api.post("/auth/register/request-otp", payload);
  return response;
};

export const verifyRegistrationOtp = async (payload: {
  email: string;
  otp: string;
}) => {
  const response = await api.post("/auth/register/verify-otp", payload);
  return response;
};

export const completeRegistration = async (payload: {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalHistory: string;
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