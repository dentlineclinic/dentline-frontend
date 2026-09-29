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
  PATIENT_HISTORY_BY_PATIENT: (patientId: string) =>
    `/api/patient-history/patient/${patientId}`,
  PATIENT_HISTORY_COMPLETE: (id: string) =>
    `/api/patient-history/${id}/complete`,
  PATIENT_HISTORY_OBSERVATION: (id: string) =>
    `/api/patient-history/${id}/observation`,
  PATIENT_HISTORY_UPLOAD_IMAGE: (id: string) =>
    `/api/patient-history/${id}/upload/image`,
  PATIENT_HISTORY_UPLOAD_VIDEO: (id: string) =>
    `/api/patient-history/${id}/upload/video`,

  // Users
  DOCTOR_ACTIVATE: (id: string) => `/api/users/doctors/${id}/activate`,
  DOCTOR_SUSPEND: (id: string) => `/api/users/doctors/${id}/suspend`,
  PATIENT_UNLOCK: (id: string) => `/api/users/patients/${id}/unlock`,

  // Reference Points
  REFERENCE_POINTS_BY_PATIENT: (patientId: string) =>
    `/api/admin/reference-points/${patientId}`,
  REFERENCE_POINTS_ADD: "/api/admin/reference-points/add",
  REFERENCE_POINTS_REMOVE: "/api/admin/reference-points/remove",

  // ── Dermatology ──────────────────────────────────────────────────────
  DERMATOLOGY: "/api/dermatology",
  DERMATOLOGY_BY_ID: (id: string) => `/api/dermatology/${id}`,
  DERMATOLOGY_ALL: "/api/dermatology/all",
  DERMATOLOGY_BY_PATIENT: (patientId: string) =>
    `/api/dermatology/patient/${patientId}`,
  DERMATOLOGY_BY_DOCTOR: (doctorId: string) =>
    `/api/dermatology/doctor/${doctorId}`,
  DERMATOLOGY_OBSERVATION: (id: string) =>
    `/api/dermatology/${id}/observation`,
  DERMATOLOGY_COMPLETE: (id: string) => `/api/dermatology/${id}/complete`,
  DERMATOLOGY_PAYMENT: (id: string) => `/api/dermatology/${id}/payment`,
  DERMATOLOGY_CONDITIONS: (recordId: string) =>
    `/api/dermatology/${recordId}/conditions`,
  DERMATOLOGY_CONDITION: (recordId: string, conditionId: string) =>
    `/api/dermatology/${recordId}/conditions/${conditionId}`,
  DERMATOLOGY_UPLOAD_IMAGE: (recordId: string) =>
    `/api/dermatology/${recordId}/upload/image`,
  DERMATOLOGY_IMAGE: (recordId: string, imageId: string) =>
    `/api/dermatology/${recordId}/image/${imageId}`,

  // ── Pilates — Admin Programs ─────────────────────────────────────────
  ADMIN_PILATES_PROGRAMS: "/api/admin/pilates/programs",
  ADMIN_PILATES_PROGRAM: (id: string) => `/api/admin/pilates/programs/${id}`,
  ADMIN_PILATES_PROGRAMS_ACTIVE: "/api/admin/pilates/programs/active",
  ADMIN_PILATES_PROGRAM_DEACTIVATE: (id: string) =>
    `/api/admin/pilates/programs/${id}/deactivate`,

  // ── Pilates — Admin Classes ──────────────────────────────────────────
  ADMIN_PILATES_CLASSES: "/api/admin/pilates/classes",
  ADMIN_PILATES_CLASS: (id: string) => `/api/admin/pilates/classes/${id}`,
  ADMIN_PILATES_CLASSES_BY_PROGRAM: (programId: string) =>
    `/api/admin/pilates/classes/program/${programId}`,
  ADMIN_PILATES_CLASSES_BY_INSTRUCTOR: (instructorId: string) =>
    `/api/admin/pilates/classes/instructor/${instructorId}`,
  ADMIN_PILATES_CLASSES_ACTIVE: "/api/admin/pilates/classes/active",
  ADMIN_PILATES_CLASS_DEACTIVATE: (id: string) =>
    `/api/admin/pilates/classes/${id}/deactivate`,
  ADMIN_PILATES_CLASS_GENERATE_SESSIONS: (classId: string) =>
    `/api/admin/pilates/classes/${classId}/sessions/generate`,

  // ── Pilates — Admin Sessions ─────────────────────────────────────────
  ADMIN_PILATES_SESSIONS: "/api/admin/pilates/sessions",
  ADMIN_PILATES_SESSION: (id: string) => `/api/admin/pilates/sessions/${id}`,
  ADMIN_PILATES_SESSIONS_DATE_RANGE: "/api/admin/pilates/sessions/date-range",
  ADMIN_PILATES_SESSION_CANCEL: (id: string) =>
    `/api/admin/pilates/sessions/${id}/cancel`,

  // ── Pilates — Admin Instructors ──────────────────────────────────────
  ADMIN_PILATES_INSTRUCTORS: "/api/admin/pilates/instructors",
  ADMIN_PILATES_INSTRUCTOR: (id: string) =>
    `/api/admin/pilates/instructors/${id}`,
  ADMIN_PILATES_INSTRUCTORS_ACTIVE: "/api/admin/pilates/instructors/active",
  ADMIN_PILATES_INSTRUCTOR_DEACTIVATE: (id: string) =>
    `/api/admin/pilates/instructors/${id}/deactivate`,

  // ── Pilates — Admin Packages ─────────────────────────────────────────
  ADMIN_PILATES_PACKAGES: "/api/admin/pilates/packages",
  ADMIN_PILATES_PACKAGE: (id: string) => `/api/admin/pilates/packages/${id}`,
  ADMIN_PILATES_PACKAGES_ACTIVE: "/api/admin/pilates/packages/active",
  ADMIN_PILATES_PACKAGE_DEACTIVATE: (id: string) =>
    `/api/admin/pilates/packages/${id}/deactivate`,

  // ── Pilates — Public ─────────────────────────────────────────────────
  PUBLIC_PILATES_PACKAGES: "/api/pilates/packages",
  PUBLIC_PILATES_PACKAGE: (id: string) => `/api/pilates/packages/${id}`,
  PUBLIC_PILATES_SESSION: (id: string) => `/api/pilates/sessions/${id}`,
  PUBLIC_PILATES_SESSIONS_UPCOMING: (classId: string) =>
    `/api/pilates/sessions/upcoming/${classId}`,

  // ── Pilates — Bookings ───────────────────────────────────────────────
  PILATES_BOOKINGS: "/api/pilates/bookings",
  PILATES_BOOKING: (id: string) => `/api/pilates/bookings/${id}`,
  PILATES_BOOKINGS_MY: "/api/pilates/bookings/my",
  PILATES_BOOKINGS_BY_PATIENT: (patientId: string) =>
    `/api/pilates/bookings/patient/${patientId}`,
  PILATES_BOOKINGS_BY_SESSION: (sessionId: string) =>
    `/api/pilates/bookings/session/${sessionId}`,
  PILATES_BOOKING_CANCEL: (id: string) =>
    `/api/pilates/bookings/${id}/cancel`,
  PILATES_ATTENDANCE: (bookingId: string) =>
    `/api/pilates/bookings/${bookingId}/attendance`,

  // ── Pilates — Subscriptions ──────────────────────────────────────────
  PILATES_SUBSCRIPTIONS: "/api/pilates/subscriptions",
  PILATES_SUBSCRIPTION: (id: string) => `/api/pilates/subscriptions/${id}`,
  PILATES_SUBSCRIPTIONS_MY: "/api/pilates/subscriptions/my",
  PILATES_SUBSCRIPTIONS_MY_ACTIVE: "/api/pilates/subscriptions/my/active",
  PILATES_SUBSCRIPTIONS_BY_PATIENT: (patientId: string) =>
    `/api/pilates/subscriptions/patient/${patientId}`,
  PILATES_SUBSCRIPTIONS_BY_PATIENT_ACTIVE: (patientId: string) =>
    `/api/pilates/subscriptions/patient/${patientId}/active`,
  PILATES_SUBSCRIPTION_CANCEL: (id: string) =>
    `/api/pilates/subscriptions/${id}/cancel`,
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
  DERMATOLOGIST: "DERMATOLOGIST",
  PILATES_INSTRUCTOR: "PILATES_INSTRUCTOR",
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
  INVALID_PASSWORD:
    "Password must be at least 8 characters with uppercase, lowercase, and number",
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

  // Dermatologist Routes
  DERMATOLOGIST_DASHBOARD: "/dermatologist",
  DERMATOLOGIST_RECORDS: "/dermatologist/records",
  DERMATOLOGIST_RECORD: (id: string) => `/dermatologist/records/${id}`,
  DERMATOLOGIST_APPOINTMENTS: "/dermatologist/appointments",

  // Pilates Instructor Routes
  INSTRUCTOR_DASHBOARD: "/instructor",
  INSTRUCTOR_CLASSES: "/instructor/classes",
  INSTRUCTOR_ATTENDANCE: "/instructor/attendance",
  INSTRUCTOR_SESSION: (id: string) => `/instructor/sessions/${id}`,

  // Admin Dermatology Routes
  ADMIN_DERMATOLOGY: "/admin/dermatology",
  ADMIN_DERMATOLOGY_RECORD: (id: string) => `/admin/dermatology/${id}`,

  // Admin Pilates Routes
  ADMIN_PILATES_PROGRAMS: "/admin/pilates/programs",
  ADMIN_PILATES_CLASSES: "/admin/pilates/classes",
  ADMIN_PILATES_SESSIONS: "/admin/pilates/sessions",
  ADMIN_PILATES_INSTRUCTORS: "/admin/pilates/instructors",
  ADMIN_PILATES_PACKAGES: "/admin/pilates/packages",
  ADMIN_PILATES_SUBSCRIPTIONS: "/admin/pilates/subscriptions",

  // Patient Routes
  PATIENT_DASHBOARD: "/patient",
  PATIENT_BOOK: "/patient/book",
  PATIENT_APPOINTMENTS: "/patient/appointments",
  PATIENT_HISTORY: "/patient/history",
  PATIENT_PROFILE: "/patient/profile",

  // Patient Pilates Routes
  PATIENT_PILATES: "/patient/pilates",
  PATIENT_PILATES_BOOK: (classId: string) =>
    `/patient/pilates/book/${classId}`,
  PATIENT_PILATES_BOOKINGS: "/patient/pilates/bookings",
  PATIENT_PILATES_SUBSCRIPTIONS: "/patient/pilates/subscriptions",
  PATIENT_DERMATOLOGY: "/patient/dermatology",
} as const;

// ─── Shared STATUS_COLORS ────────────────────────────────────────────────────
// Single source of truth — import this instead of redefining per-page.

export const STATUS_COLORS: Record<string, string> = {
  // Appointment statuses
  BOOKED: "bg-[#E5EEFF] text-[#1E40AF]",
  ARRIVAL: "bg-[#F0FDFA] text-[#0F766E]",
  ARRIVED: "bg-[#F0FDFA] text-[#0F766E]",
  ASSIGN: "bg-[#FEF3C7] text-[#92400E]",
  ASSIGNED: "bg-[#FEF3C7] text-[#92400E]",
  COMPLETE: "bg-[#DCFCE7] text-[#166534]",
  COMPLETED: "bg-[#DCFCE7] text-[#166534]",
  CANCEL: "bg-[#F1F5F9] text-[#475569]",
  CANCELLED: "bg-[#F1F5F9] text-[#475569]",
  MISSED: "bg-[#FFDAD6] text-[#93000A]",
  // History statuses
  IN_PROGRESS: "bg-[#FEF3C7] text-[#92400E]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",

  // Dermatology record status
  MILD: "bg-[#DCFCE7] text-[#166534]",
  MODERATE: "bg-[#FEF3C7] text-[#92400E]",
  SEVERE: "bg-[#FFDAD6] text-[#93000A]",

  // Pilates session status
  SCHEDULED: "bg-[#E5EEFF] text-[#1E40AF]",

  // Pilates booking status
  ATTENDED: "bg-[#DCFCE7] text-[#166534]",
  NO_SHOW: "bg-[#FFDAD6] text-[#93000A]",

  // Subscription status
  ACTIVE: "bg-[#DCFCE7] text-[#166534]",
  EXPIRED: "bg-[#F1F5F9] text-[#475569]",
};

export const PAYMENT_COLORS: Record<string, string> = {
  PAID: "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  UNPAID: "bg-[#FFDAD6] text-[#93000A]",
};