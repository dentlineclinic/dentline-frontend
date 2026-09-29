import api from "@/lib/axios";
import { clearAuthState } from "@/lib/auth";

// ============================================================
// ERROR EXTRACTION
// ============================================================

/**
 * Converts an unknown thrown value (usually an axios error) into a
 * user-friendly Error whose `.message` can be rendered directly.
 *
 * Priority:
 *   1. Server's ApiResponse.message
 *   2. Server's ApiResponse.error
 *   3. Status-based fallback
 *   4. Network fallback
 */
function extractApiError(err: unknown): Error {
  // Already an Error we created downstream — pass through.
  if (err instanceof Error && !("response" in err)) {
    return err;
  }

  const anyErr = err as {
    response?: { status?: number; data?: { message?: string; error?: string } };
    message?: string;
  };

  // Network / timeout / CORS — no response object
  if (!anyErr.response) {
    return new Error(
      "Network error. Please check your connection and try again."
    );
  }

  const { status, data } = anyErr.response;

  const serverMessage =
    (data && (data.message || data.error)) || null;

  const fallbackByStatus: Record<number, string> = {
    400: "Please check the details you entered and try again.",
    401: "Invalid email or password. Please try again.",
    403: "You do not have permission to perform this action.",
    404: "We couldn't find what you were looking for.",
    409: "This action conflicts with an existing record.",
    423: "Your account is temporarily locked. Please try again later.",
    429: "Too many attempts. Please wait a moment and try again.",
    500: "Something went wrong on our end. Please try again.",
    503: "Service is temporarily unavailable. Please try again shortly.",
  };

  const fallback =
    (status && fallbackByStatus[status]) ||
    "Unable to complete the request. Please try again.";

  return new Error(serverMessage || fallback);
}

// ============================================================
// LOGIN
// ============================================================

export const loginUser = async (payload: {
  identifier: string;
  password: string;
  role: string;
}) => {
  try {
    const response = await api.post("/auth/login", payload);
    return response;
  } catch (err) {
    throw extractApiError(err);
  }
};

export const adminLogin = async (payload: {
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post("/auth/admin/login", payload);
    return response;
  } catch (err) {
    throw extractApiError(err);
  }
};

// ============================================================
// REGISTRATION
// ============================================================

export interface BasicResponse {
  success: boolean;
  message: string;
}

export const requestRegistrationOtp = async (payload: {
  email?: string;
  phoneNumber?: string;
  captchaToken: string;
}) => {
  try {
    const response = await api.post("/auth/register/request-otp", payload);
    return response;
  } catch (err) {
    throw extractApiError(err);
  }
};

export const verifyRegistrationOtp = async (payload: {
  email?: string;
  phoneNumber?: string;
  otp: string;
}) => {
  try {
    const response = await api.post("/auth/register/verify-otp", payload);
    return response;
  } catch (err) {
    throw extractApiError(err);
  }
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
  try {
    const response = await api.post("/auth/register", payload);
    return response;
  } catch (err) {
    throw extractApiError(err);
  }
};

// ============================================================
// SESSION
// ============================================================

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

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<BasicResponse> => {
  try {
    const res = await api.post("/auth/change-password", payload);
    return res.data;
  } catch (err) {
    throw extractApiError(err);
  }
};

export const logoutUser = async (): Promise<BasicResponse> => {
  try {
    // No body — the refresh token travels in the HttpOnly cookie.
    // The backend now treats the body as optional, so this will not 500.
    const response = await api.post("/auth/logout");
    clearAuthState();
    return response.data;
  } catch (err) {
    // Even if the server call fails, clear local state so the user is
    // effectively logged out on this device.
    clearAuthState();
    throw extractApiError(err);
  }
};

// ============================================================
// PASSWORD RESET
// ============================================================

export const requestPasswordOtp = async (payload: {
  email?: string;
  phoneNumber?: string;
  captchaToken: string;
}): Promise<BasicResponse> => {
  try {
    const res = await api.post("/auth/forgot-password/request-otp", payload);
    return res.data;
  } catch (err) {
    throw extractApiError(err);
  }
};

export const resetForgottenPassword = async (payload: {
  email?: string;
  phoneNumber?: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<BasicResponse> => {
  try {
    const res = await api.post("/auth/forgot-password/reset", payload);
    return res.data;
  } catch (err) {
    throw extractApiError(err);
  }
};