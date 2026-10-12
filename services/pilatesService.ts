import api from "@/lib/axios";

// ============================================
// TYPES
// ============================================

export type PilatesSessionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type PilatesBookingStatus =
  | "BOOKED"
  | "ATTENDED"
  | "CANCELLED"
  | "NO_SHOW";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface PilatesProgram {
  id: string;
  name: string;
  description?: string | null;
  durationWeeks?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}


// ── Calendar types ─────────────────────────────────────────────────────

export interface PilatesSessionCalendarDay {
  date: string;               // "YYYY-MM-DD"
  totalSessions: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  totalBooked: number;
  totalCapacity: number;
}

export interface PilatesSessionCalendar {
  year: number;
  month: number;
  monthName: string;
  numberOfDays: number;
  previousYear: number;
  previousMonth: number;
  nextYear: number;
  nextMonth: number;
  days: PilatesSessionCalendarDay[];
}

export interface PilatesInstructor {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  certifications?: string | null;
  status: string;
  profilePhotoUrl?: string | null;
  createdAt: string;
}

export interface PilatesClass {
  id: string;
  programId: string;
  programName?: string | null;
  instructorId: string;
  instructorName?: string | null;
  name: string;
  description?: string | null;
  dayOfWeek: number; // ISO 1-7
  startTime: string; // "HH:mm:ss"
  durationMinutes: number;
  defaultCapacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  instructorProfilePhotoUrl?: string | null; 
}

export interface PilatesSession {
  id: string;
  classId: string;
  className?: string | null;
  sessionDate: string; // ISO date
  startTime: string;
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  status: PilatesSessionStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PilatesBooking {
  id: string;
  sessionId: string;
  sessionName?: string | null;
  patientId: string;
  patientName?: string | null;
  subscriptionId?: string | null;
  status: PilatesBookingStatus;
  bookedAt: string;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Attendance {
  id: string;
  bookingId: string;
  sessionId: string;
  patientId: string;
  patientName?: string | null;
  attended: boolean;
  markedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface PilatesPackage {
  id: string;
  name: string;
  description?: string | null;
  creditCount: number;
  price: number;
  validityDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Subscription {
  id: string;
  patientId: string;
  patientName?: string | null;
  packageId: string;
  packageName?: string | null;
  creditsRemaining: number;
  creditsUsed: number;
  status: SubscriptionStatus;
  activatedAt: string;
  expiresAt: string;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

// ── Response wrappers ──────────────────────────────────────────────────

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  success: boolean;
  message: string;
  data: {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface ListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

// ── Request payloads ───────────────────────────────────────────────────

export interface CreatePilatesProgramRequest {
  name: string;
  description?: string;
  durationWeeks?: number;
  isActive: boolean;
}

export interface CreatePilatesInstructorRequest {
  name: string;
  email: string;
  password: string;
  bio?: string;
  certifications?: string;
}

export interface UpdatePilatesInstructorRequest {
  name?: string;
  bio?: string;
  certifications?: string;
}

export interface CreatePilatesClassRequest {
  programId: string;
  instructorId: string;
  name: string;
  description?: string;
  dayOfWeek: number;
  startTime: string;
  durationMinutes?: number;
  defaultCapacity?: number;
  isActive?: boolean;
}

export interface CreatePilatesPackageRequest {
  name: string;
  description?: string;
  creditCount: number;
  price: number;
  validityDays: number;
  isActive: boolean;
}

export interface GenerateSessionsRequest {
  classId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface BookPilatesSessionRequest {
  sessionId: string;
  patientId: string;
  subscriptionId?: string;
}

export interface MarkAttendanceRequest {
  attended: boolean;
  notes?: string;
}

export interface PurchaseSubscriptionRequest {
  patientId: string;
  packageId: string;
}

// ============================================
// PROGRAMS (admin)
// ============================================

export const createProgram = async (
  payload: CreatePilatesProgramRequest
): Promise<SingleResponse<PilatesProgram>> => {
  const res = await api.post("/admin/pilates/programs", payload);
  return res.data;
};

export const fetchAllPrograms = async (
  page = 0,
  size = 10
): Promise<PagedResponse<PilatesProgram>> => {
  const res = await api.get("/admin/pilates/programs", {
    params: { page, size },
  });
  return res.data;
};

export const fetchActivePrograms = async (): Promise<
  ListResponse<PilatesProgram>
> => {
  const res = await api.get("/admin/pilates/programs/active");
  return res.data;
};

export const fetchProgramById = async (
  id: string
): Promise<SingleResponse<PilatesProgram>> => {
  const res = await api.get(`/admin/pilates/programs/${id}`);
  return res.data;
};

export const updateProgram = async (
  id: string,
  payload: CreatePilatesProgramRequest
): Promise<SingleResponse<PilatesProgram>> => {
  const res = await api.patch(`/admin/pilates/programs/${id}`, payload);
  return res.data;
};

export const deactivateProgram = async (id: string) => {
  const res = await api.patch(`/admin/pilates/programs/${id}/deactivate`);
  return res.data;
};

// ============================================
// PACKAGES (admin + public)
// ============================================

// ── Public ─────────────────────────────────────────────────────────────

export const fetchActivePackagesPublic = async (): Promise<
  ListResponse<PilatesPackage>
> => {
  const res = await api.get("/pilates/packages");
  return res.data;
};

export const fetchPackageByIdPublic = async (
  id: string
): Promise<SingleResponse<PilatesPackage>> => {
  const res = await api.get(`/pilates/packages/${id}`);
  return res.data;
};

// ── Admin ──────────────────────────────────────────────────────────────

export const createPackage = async (
  payload: CreatePilatesPackageRequest
): Promise<SingleResponse<PilatesPackage>> => {
  const res = await api.post("/admin/pilates/packages", payload);
  return res.data;
};

export const fetchAllPackages = async (
  page = 0,
  size = 10
): Promise<PagedResponse<PilatesPackage>> => {
  const res = await api.get("/admin/pilates/packages", {
    params: { page, size },
  });
  return res.data;
};

export const fetchActivePackages = async (): Promise<
  ListResponse<PilatesPackage>
> => {
  const res = await api.get("/admin/pilates/packages/active");
  return res.data;
};

export const fetchPackageById = async (
  id: string
): Promise<SingleResponse<PilatesPackage>> => {
  const res = await api.get(`/admin/pilates/packages/${id}`);
  return res.data;
};

export const updatePackage = async (
  id: string,
  payload: CreatePilatesPackageRequest
): Promise<SingleResponse<PilatesPackage>> => {
  const res = await api.patch(`/admin/pilates/packages/${id}`, payload);
  return res.data;
};

export const deactivatePackage = async (id: string) => {
  const res = await api.patch(`/admin/pilates/packages/${id}/deactivate`);
  return res.data;
};

// ============================================
// INSTRUCTORS (admin)
// ============================================

export const createInstructor = async (
  payload: CreatePilatesInstructorRequest
): Promise<SingleResponse<PilatesInstructor>> => {
  const res = await api.post("/admin/pilates/instructors", payload);
  return res.data;
};

export const fetchAllInstructors = async (
  page = 0,
  size = 10
): Promise<PagedResponse<PilatesInstructor>> => {
  const res = await api.get("/admin/pilates/instructors", {
    params: { page, size },
  });
  return res.data;
};

export const fetchActiveInstructors = async (): Promise<
  ListResponse<PilatesInstructor>
> => {
  const res = await api.get("/admin/pilates/instructors/active");
  return res.data;
};

export const fetchInstructorById = async (
  id: string
): Promise<SingleResponse<PilatesInstructor>> => {
  const res = await api.get(`/admin/pilates/instructors/${id}`);
  return res.data;
};

export const updateInstructor = async (
  id: string,
  payload: UpdatePilatesInstructorRequest
): Promise<SingleResponse<PilatesInstructor>> => {
  const res = await api.patch(`/admin/pilates/instructors/${id}`, payload);
  return res.data;
};

export const deactivateInstructor = async (id: string) => {
  const res = await api.patch(`/admin/pilates/instructors/${id}/deactivate`);
  return res.data;
};

// ============================================
// CLASSES (admin)
// ============================================

export const createClass = async (
  payload: CreatePilatesClassRequest
): Promise<SingleResponse<PilatesClass>> => {
  const res = await api.post("/admin/pilates/classes", payload);
  return res.data;
};

export const fetchAllClasses = async (
  page = 0,
  size = 10
): Promise<PagedResponse<PilatesClass>> => {
  const res = await api.get("/admin/pilates/classes", {
    params: { page, size },
  });
  return res.data;
};

export const fetchClassById = async (
  id: string
): Promise<SingleResponse<PilatesClass>> => {
  const res = await api.get(`/admin/pilates/classes/${id}`);
  return res.data;
};

export const fetchClassesByProgram = async (
  programId: string
): Promise<ListResponse<PilatesClass>> => {
  const res = await api.get(
    `/admin/pilates/classes/program/${programId}`
  );
  return res.data;
};

export const fetchClassesByInstructor = async (
  instructorId: string
): Promise<ListResponse<PilatesClass>> => {
  const res = await api.get(
    `/admin/pilates/classes/instructor/${instructorId}`
  );
  return res.data;
};

export const fetchActiveClasses = async (): Promise<
  ListResponse<PilatesClass>
> => {
  const res = await api.get("/admin/pilates/classes/active");
  return res.data;
};

export const updateClass = async (
  id: string,
  payload: CreatePilatesClassRequest
): Promise<SingleResponse<PilatesClass>> => {
  const res = await api.patch(`/admin/pilates/classes/${id}`, payload);
  return res.data;
};

export const deactivateClass = async (id: string) => {
  const res = await api.patch(`/admin/pilates/classes/${id}/deactivate`);
  return res.data;
};

export const generateClassSessions = async (
  classId: string,
  payload: GenerateSessionsRequest
): Promise<ListResponse<PilatesSession>> => {
  const res = await api.post(
    `/admin/pilates/classes/${classId}/sessions/generate`,
    payload
  );
  return res.data;
};

// ============================================
// SESSIONS
// ============================================

export const fetchSessionById = async (
  id: string
): Promise<SingleResponse<PilatesSession>> => {
  const res = await api.get(`/pilates/sessions/${id}`);
  return res.data;
};

export const fetchUpcomingSessionsForClass = async (
  classId: string
): Promise<ListResponse<PilatesSession>> => {
  const res = await api.get(`/pilates/sessions/upcoming/${classId}`);
  return res.data;
};

export const fetchSessionsByDateRange = async (
  start: string,
  end: string,
  page = 0,
  size = 20
): Promise<PagedResponse<PilatesSession>> => {
  const res = await api.get("/admin/pilates/sessions/date-range", {
    params: { start, end, page, size },
  });
  return res.data;
};

export const fetchSessionsByClass = async (
  classId: string
): Promise<ListResponse<PilatesSession>> => {
  const res = await api.get(`/admin/pilates/sessions/class/${classId}`);
  return res.data;
};

export const cancelSession = async (
  id: string
): Promise<SingleResponse<PilatesSession>> => {
  const res = await api.patch(`/admin/pilates/sessions/${id}/cancel`);
  return res.data;
};

// ============================================
// BOOKINGS
// ============================================

export const bookSession = async (
  payload: BookPilatesSessionRequest
): Promise<SingleResponse<PilatesBooking>> => {
  const res = await api.post("/pilates/bookings", payload);
  return res.data;
};

export const fetchMyBookings = async (
  page = 0,
  size = 10
): Promise<PagedResponse<PilatesBooking>> => {
  const res = await api.get("/pilates/bookings/my", {
    params: { page, size },
  });
  return res.data;
};

export const fetchBookingById = async (
  id: string
): Promise<SingleResponse<PilatesBooking>> => {
  const res = await api.get(`/pilates/bookings/${id}`);
  return res.data;
};

export const fetchBookingsBySession = async (
  sessionId: string
): Promise<ListResponse<PilatesBooking>> => {
  const res = await api.get(
    `/pilates/bookings/session/${sessionId}`
  );
  return res.data;
};

export const fetchBookingsByPatient = async (
  patientId: string,
  page = 0,
  size = 10
): Promise<PagedResponse<PilatesBooking>> => {
  const res = await api.get(`/pilates/bookings/patient/${patientId}`, {
    params: { page, size },
  });
  return res.data;
};

export const cancelBooking = async (
  id: string
): Promise<SingleResponse<PilatesBooking>> => {
  const res = await api.patch(`/pilates/bookings/${id}/cancel`);
  return res.data;
};

export const markAttendance = async (
  bookingId: string,
  payload: MarkAttendanceRequest
): Promise<SingleResponse<Attendance>> => {
  const res = await api.patch(
    `/pilates/bookings/${bookingId}/attendance`,
    payload
  );
  return res.data;
};

// ============================================
// SUBSCRIPTIONS
// ============================================

// ── Admin-only manual grant ─────────────────────────────────────────────
export const purchaseSubscription = async (
  payload: PurchaseSubscriptionRequest
): Promise<SingleResponse<Subscription>> => {
  const res = await api.post("/pilates/subscriptions", payload);
  return res.data;
};

// ── Patient checkout (Flutterwave) ──────────────────────────────────────

export interface CheckoutRequest {
  packageId: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  txRef: string;
}

export interface CheckoutStatusResponse {
  status: "PENDING" | "SUCCESSFUL" | "FAILED" | "CANCELLED";
  packageName: string | null;
  credits: number | null;
  subscriptionId: string | null;
}

/**
 * Initiates Flutterwave checkout for a package.
 * Backend: POST /api/pilates/subscriptions/checkout
 * Response: { checkoutUrl, txRef } (no envelope wrapper)
 */
export const initiateCheckout = async (
  payload: CheckoutRequest
): Promise<CheckoutResponse> => {
  const res = await api.post("/pilates/subscriptions/checkout", payload);
  return res.data;
};

/**
 * Polls payment status after returning from Flutterwave.
 * Backend: GET /api/pilates/subscriptions/checkout/:txRef
 * Response: { status, packageName, credits, subscriptionId } (no envelope wrapper)
 */
export const pollCheckoutStatus = async (
  txRef: string
): Promise<CheckoutStatusResponse> => {
  const res = await api.get(`/pilates/subscriptions/checkout/${txRef}`);
  return res.data;
};

export const fetchMySubscriptions = async (
  page = 0,
  size = 10
): Promise<PagedResponse<Subscription>> => {
  const res = await api.get("/pilates/subscriptions/my", {
    params: { page, size },
  });
  return res.data;
};

export const fetchMyActiveSubscriptions = async (): Promise<
  ListResponse<Subscription>
> => {
  const res = await api.get("/pilates/subscriptions/my/active");
  return res.data;
};

export const fetchSubscriptionById = async (
  id: string
): Promise<SingleResponse<Subscription>> => {
  const res = await api.get(`/pilates/subscriptions/${id}`);
  return res.data;
};

export const fetchSubscriptionsByPatient = async (
  patientId: string,
  page = 0,
  size = 10
): Promise<PagedResponse<Subscription>> => {
  const res = await api.get(
    `/pilates/subscriptions/patient/${patientId}`,
    {
      params: { page, size },
    }
  );
  return res.data;
};

export const fetchActiveSubscriptionsForPatient = async (
  patientId: string
): Promise<ListResponse<Subscription>> => {
  const res = await api.get(
    `/pilates/subscriptions/patient/${patientId}/active`
  );
  return res.data;
};

export const cancelSubscription = async (
  id: string
): Promise<SingleResponse<Subscription>> => {
  const res = await api.patch(`/pilates/subscriptions/${id}/cancel`);
  return res.data;
};

// ============================================
// INSTRUCTOR LOGIN ACCOUNTS (admin)
// ============================================

/** Payload for creating a Pilates instructor login account. */
export interface CreatePilatesInstructorAccountRequest {
  name: string;
  email: string;
  password: string;
  bio?: string;
  certifications?: string;
}

/** Response shape — same as PilatesInstructor. */
export const createPilatesInstructorAccount = async (
  payload: CreatePilatesInstructorAccountRequest
): Promise<SingleResponse<PilatesInstructor>> => {
  const res = await api.post("/users/pilates-instructors", payload);
  return res.data;
};

export const fetchPilatesInstructorAccounts = async (
  page = 0,
  size = 10,
  search?: string
): Promise<PagedResponse<PilatesInstructor>> => {
  const res = await api.get("/users/pilates-instructors", {
    params: { page, size, search },
  });
  return res.data;
};

export const fetchMyPilatesInstructorProfile = async (): Promise<
  SingleResponse<PilatesInstructor>
> => {
  const res = await api.get("/users/pilates-instructors/me");
  return res.data;
};

export const fetchMyInstructorClasses = async (): Promise<
  ListResponse<PilatesClass>
> => {
  const res = await api.get("/pilates/instructor/classes");
  return res.data;
};

/**
 * Returns the upcoming sessions for the logged-in instructor.
 *
 * @param from — optional start date (YYYY-MM-DD). Defaults to today on the backend.
 * @param to   — optional end date   (YYYY-MM-DD). Defaults to from + 30 days on the backend.
 *
 * Backend: GET /api/pilates/instructor/sessions/upcoming?from=...&to=...
 */
export const fetchMyUpcomingSessions = async (
  from?: string,
  to?: string
): Promise<ListResponse<PilatesSession>> => {
  const res = await api.get("/pilates/instructor/sessions/upcoming", {
    params: { from, to },
  });
  return res.data;
};

// ============================================
// SESSIONS — CALENDAR
// ============================================

export const fetchPilatesSessionCalendar = async (
  year: number,
  month: number
): Promise<SingleResponse<PilatesSessionCalendar>> => {
  const res = await api.get("/admin/pilates/sessions/calendar", {
    params: { year, month },
  });
  return res.data;
};

export const fetchPilatesSessionsByDate = async (
  date: string
): Promise<ListResponse<PilatesSession>> => {
  const res = await api.get("/admin/pilates/sessions/by-date", {
    params: { date },
  });
  return res.data;
};

// ── Upload instructor profile photo ─────────────────────────────────────

export const uploadPilatesInstructorProfilePhoto = async (
  instructorId: string,
  file: File
): Promise<SingleResponse<PilatesInstructor>> => {
  const formData = new FormData();
  formData.append("file", file);

  // Do NOT set Content-Type manually — axios sets it with the correct boundary
  const res = await api.post(
    `/users/pilates-instructors/${instructorId}/profile/photo`,
    formData
  );

  return res.data;
};

// ============================================
// CLASSES (public — any authenticated user)
// ============================================

export const fetchActiveClassesPublic = async (): Promise<
  ListResponse<PilatesClass>
> => {
  const res = await api.get("/pilates/classes/active");
  return res.data;
};