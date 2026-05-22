// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  
  // Admin
  ADMIN_DASHBOARD: "/api/admin/dashboard",
  ADMIN_APPOINTMENTS: "/api/admin/appointments",
  ADMIN_PATIENTS: "/api/admin/patients",
  ADMIN_DOCTORS: "/api/admin/doctors",
  ADMIN_PATIENT_HISTORIES: "/api/admin/patient-histories",
  ADMIN_PAYMENTS: "/api/admin/payments",
  ADMIN_REVIEWS: "/api/admin/reviews",
  
  // Patient History
  PATIENT_HISTORY: "/api/patient-history",
  PATIENT_HISTORY_BY_ID: (id: string) => `/api/patient-history/${id}`,
  PATIENT_HISTORY_BY_PATIENT: (patientId: string) => `/api/patient-history/patient/${patientId}`,
  PATIENT_HISTORY_COMPLETE: (id: string) => `/api/patient-history/${id}/complete`,
  PATIENT_HISTORY_OBSERVATION: (id: string) => `/api/patient-history/${id}/observation`,
  PATIENT_HISTORY_UPLOAD_IMAGE: (id: string) => `/api/patient-history/${id}/upload/image`,
  PATIENT_HISTORY_UPLOAD_VIDEO: (id: string) => `/api/patient-history/${id}/upload/video`,
  
  // Users
  DOCTOR_ACTIVATE: (id: string) => `/api/users/doctors/${id}/activate`,
  DOCTOR_SUSPEND: (id: string) => `/api/users/doctors/${id}/suspend`,
  PATIENT_UNLOCK: (id: string) => `/api/users/patients/${id}/unlock`,
  
  // Reference Points
  REFERENCE_POINTS_BY_PATIENT: (patientId: string) => `/api/admin/reference-points/${patientId}`,
  REFERENCE_POINTS_ADD: "/api/admin/reference-points/add",
  REFERENCE_POINTS_REMOVE: "/api/admin/reference-points/remove",
} as const;

// Status Options
export const APPOINTMENT_STATUSES = [
  "BOOKED",
  "ARRIVAL",
  "ASSIGN",
  "COMPLETE",
  "CANCEL",
  "MISSED",
] as const;

export const PAYMENT_STATUSES = ["PAID", "PENDING", "UNPAID"] as const;

export const HISTORY_STATUSES = ["COMPLETED", "IN_PROGRESS", "PENDING"] as const;

export const USER_STATUSES = ["Active", "Inactive", "Suspended"] as const;

// User Roles
export const USER_ROLES = {
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  PATIENT: "PATIENT",
} as const;

// Local Storage Keys — use these everywhere instead of raw strings
export const STORAGE_KEYS = {
  TOKEN: "token",
  REFRESH_TOKEN: "refreshToken",
  USER_ID: "userId",
  USER_NAME: "userName",
  USER_EMAIL: "userEmail",
  USER_ROLE: "userRole",
  PROFILE_PHOTO_URL: "profilePhotoUrl",
  TOKEN_TYPE: "tokenType",
  MUST_CHANGE_PASSWORD: "mustChangePassword",
} as const;

// Auth cookie names
export const COOKIE_KEYS = {
  TOKEN: "token",
  ROLE: "role",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: "MMM DD, YYYY",
  LONG: "MMMM DD, YYYY",
  TIME: "HH:mm A",
  DATETIME: "MMM DD, YYYY HH:mm A",
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_MIN_LENGTH: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm"],
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_PHONE: "Please enter a valid phone number",
  INVALID_PASSWORD: "Password must be at least 8 characters with uppercase, lowercase, and number",
  PASSWORD_MISMATCH: "Passwords do not match",
  NETWORK_ERROR: "Network error occurred. Please try again.",
  UNAUTHORIZED: "You are not authorized to perform this action",
  SESSION_EXPIRED: "Your session has expired. Please login again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  REGISTER_SUCCESS: "Registration successful",
  UPDATE_SUCCESS: "Updated successfully",
  DELETE_SUCCESS: "Deleted successfully",
  CREATE_SUCCESS: "Created successfully",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  
  // Admin Routes
  ADMIN_DASHBOARD: "/admin",
  ADMIN_APPOINTMENTS: "/admin/appointments",
  ADMIN_PATIENTS: "/admin/patients",
  ADMIN_DOCTORS: "/admin/doctors",
  ADMIN_DOCTORS_CREATE: "/admin/doctors/create",
  ADMIN_PATIENT_HISTORIES: "/admin/patient-histories",
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_REVIEWS: "/admin/reviews",
  ADMIN_NOTIFICATIONS: "/admin/notifications",
  ADMIN_SETTINGS: "/admin/settings",
  
  // Doctor Routes
  DOCTOR_DASHBOARD: "/doctor",
  DOCTOR_PATIENTS: "/doctor/patients",
  DOCTOR_APPOINTMENTS: "/doctor/appointments",
  DOCTOR_REVIEWS: "/doctor/reviews",
  DOCTOR_SETTINGS: "/doctor/settings",
  DOCTOR_RECORD: (historyId: string) => `/doctor/record/${historyId}`,
  
  // Patient Routes
  PATIENT_DASHBOARD: "/patient",
  PATIENT_BOOK: "/patient/book",
  PATIENT_APPOINTMENTS: "/patient/appointments",
  PATIENT_HISTORY: "/patient/history",
  PATIENT_PROFILE: "/patient/profile",
} as const;

// ─── Shared STATUS_COLORS ────────────────────────────────────────────────────
// Single source of truth — import this instead of redefining per-page.

export const STATUS_COLORS: Record<string, string> = {
  // Appointment statuses
  BOOKED:      "bg-[#E5EEFF] text-[#1E40AF]",
  ARRIVAL:     "bg-[#F0FDFA] text-[#0F766E]",
  ARRIVED:     "bg-[#F0FDFA] text-[#0F766E]",
  ASSIGN:      "bg-[#FEF3C7] text-[#92400E]",
  ASSIGNED:    "bg-[#FEF3C7] text-[#92400E]",
  COMPLETE:    "bg-[#DCFCE7] text-[#166534]",
  COMPLETED:   "bg-[#DCFCE7] text-[#166534]",
  CANCEL:      "bg-[#F1F5F9] text-[#475569]",
  CANCELLED:   "bg-[#F1F5F9] text-[#475569]",
  MISSED:      "bg-[#FFDAD6] text-[#93000A]",
  // History statuses
  IN_PROGRESS: "bg-[#FEF3C7] text-[#92400E]",
  PENDING:     "bg-[#FEF3C7] text-[#92400E]",
};

export const PAYMENT_COLORS: Record<string, string> = {
  PAID:    "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  UNPAID:  "bg-[#FFDAD6] text-[#93000A]",
};
