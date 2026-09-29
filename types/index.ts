// User Types
export type UserRole =
  | "ADMIN"
  | "DOCTOR"
  | "PILATES_INSTRUCTOR"
  | "PATIENT";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: "Active" | "Inactive" | "Suspended";
}

// Appointment Types
export type AppointmentStatus =
  | "BOOKED"
  | "ARRIVAL"
  | "ASSIGN"
  | "COMPLETE"
  | "CANCEL"
  | "MISSED";

export interface Appointment {
  id: string;
  rawId: string;
  patientId: string;
  patientName: string;
  initials: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  observation: string;
}

// Patient Types
export interface Patient {
  id: string;
  shortId: string;
  fullName: string;
  initials: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalHistory: string;
  referenceCode: string;
  referencePoints: number;
  lastVisit: string;
  status: "Active" | "Inactive";
}

// Doctor Types
export interface Doctor {
  id: string;
  shortId: string;
  fullName: string;
  initials: string;
  specialty: string;
  email: string;
  patients: number;
  status: "Active" | "Suspended";
}

// Patient History Types
export type HistoryStatus = "COMPLETED" | "IN_PROGRESS" | "PENDING";
export type PaymentStatus = "PAID" | "PENDING" | "UNPAID";

export interface PatientHistory {
  id: string;
  shortId: string;
  patientId: string;
  patientName: string;
  initials: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  date: string;
  time: string;
  amount: string;
  paymentStatus: PaymentStatus;
  status: HistoryStatus;
  observation: string;
  imageUrls: string[];
  videoUrls: string[];
  createdAt: string;
  updatedAt?: string;
}

// Payment Types
export interface Payment {
  id: string;
  patientName: string;
  procedure: string;
  amount: string;
  balance: string;
  date: string;
  paymentStatus: "Paid" | "Pending" | "Unpaid";
}

// Review Types
export interface Review {
  id: string;
  patientName: string;
  doctorName: string;
  rating: number;
  comment: string;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
}

// Dashboard Stats Types
export interface DashboardStats {
  label: string;
  value: string;
  badge?: string;
  subtitle?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "PATIENT" | "DOCTOR";
}

export interface CreatePatientHistoryForm {
  appointmentId: string;
  amount: number;
}

export interface ReviewForm {
  rating: number;
  comment: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Shared UI Types
// ─────────────────────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  BOOKED: "bg-blue-50 text-blue-700",
  ARRIVED: "bg-yellow-50 text-yellow-700",
  ASSIGNED: "bg-purple-50 text-purple-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  MISSED: "bg-gray-50 text-gray-700",
};

export interface UIAppointment {
  rawId: string;
  id: string;
  patientName: string;
  patientId: string;
  familyMemberId?: string;
  familyMemberName?: string;
  doctorName: string;
  date: string;
  status: string;
  observation: string;
  initials: string;
  appointmentType: string;
}

export function getInitials(name: string): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function mapToUIAppointment(apiAppt: any): UIAppointment {
  const displayName =
    apiAppt.familyMemberName || apiAppt.patientName || "Unknown Patient";

  return {
    rawId: apiAppt.id,
    id: apiAppt.id?.slice(0, 8) || "",
    patientName: displayName,
    patientId: apiAppt.patientId,
    familyMemberId: apiAppt.familyMemberId,
    familyMemberName: apiAppt.familyMemberName,
    doctorName: apiAppt.doctorName || "Not assigned",
    date: formatDate(apiAppt.appointmentDate),
    status: apiAppt.status || "UNKNOWN",
    observation: apiAppt.observation || "No notes",
    initials: getInitials(displayName),
    appointmentType: apiAppt.appointmentType || "INDIVIDUAL",
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Dermatology Types
// ─────────────────────────────────────────────────────────────────────────

export type DermatologyRecordStatus = "PENDING" | "COMPLETED";
export type SkinConditionSeverity = "MILD" | "MODERATE" | "SEVERE";
export type AppointmentType = "INDIVIDUAL" | "FAMILY";

export interface SkinConditionDto {
  id: string;
  dermatologyRecordId: string;
  conditionName: string;
  affectedArea?: string;
  severity: SkinConditionSeverity;
  diagnosis?: string;
  treatment?: string;
  createdAt: string;
}

export interface DermatologyImageDto {
  id: string;
  dermatologyRecordId: string;
  imageUrl: string;
  uploadedAt: string;
}

export interface DermatologyRecordDto {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentType?: AppointmentType;
  familyMemberId?: string;
  familyMemberName?: string;
  generalNotes?: string;
  amount?: number;
  discount?: number;
  amountPaid?: number;
  balance?: number;
  paymentStatus: PaymentStatus;
  status: DermatologyRecordStatus;
  createdAt: string;
  updatedAt?: string;
  skinConditions: SkinConditionDto[];
  images: DermatologyImageDto[];
}

// ── UI-shape for the dermatology list view ─────────────────────────────

export interface UIDermatologyRecord {
  rawId: string;
  id: string;
  patientId: string;
  patientName: string;
  initials: string;
  doctorId: string;
  doctorName: string;
  date: string;
  status: DermatologyRecordStatus;
  paymentStatus: PaymentStatus;
  balance: number;
  conditionCount: number;
  imageCount: number;
}

export function mapToUIDermatologyRecord(
  api: DermatologyRecordDto
): UIDermatologyRecord {
  const displayName = api.familyMemberName || api.patientName || "Unknown Patient";
  return {
    rawId: api.id,
    id: api.id?.slice(0, 8) || "",
    patientId: api.patientId,
    patientName: displayName,
    initials: getInitials(displayName),
    doctorId: api.doctorId,
    doctorName: api.doctorName || "Not assigned",
    date: api.appointmentDate?.slice(0, 10) || "",
    status: api.status,
    paymentStatus: api.paymentStatus,
    balance: api.balance ?? 0,
    conditionCount: api.skinConditions?.length ?? 0,
    imageCount: api.images?.length ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Pilates Types
// ─────────────────────────────────────────────────────────────────────────

export type PilatesSessionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type PilatesBookingStatus =
  | "BOOKED"
  | "ATTENDED"
  | "CANCELLED"
  | "NO_SHOW";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface PilatesProgramDto {
  id: string;
  name: string;
  description?: string;
  durationWeeks?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PilatesInstructorDto {
  id: string;
  name: string;
  email: string;
  bio?: string;
  certifications?: string;
  status: string;
  profilePhotoUrl?: string;
  createdAt: string;
}

export interface PilatesClassDto {
  id: string;
  programId: string;
  programName?: string;
  instructorId: string;
  instructorName?: string;
  name: string;
  description?: string;
  dayOfWeek: number; // ISO 1-7 (1 = Monday, 7 = Sunday)
  startTime: string; // "HH:mm:ss"
  durationMinutes: number;
  defaultCapacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PilatesSessionDto {
  id: string;
  classId: string;
  className?: string;
  sessionDate: string; // ISO date "YYYY-MM-DD"
  startTime: string; // "HH:mm:ss"
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  status: PilatesSessionStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PilatesBookingDto {
  id: string;
  sessionId: string;
  sessionName?: string;
  patientId: string;
  patientName?: string;
  subscriptionId?: string;
  status: PilatesBookingStatus;
  bookedAt: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AttendanceDto {
  id: string;
  bookingId: string;
  sessionId: string;
  patientId: string;
  patientName?: string;
  attended: boolean;
  markedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface PilatesPackageDto {
  id: string;
  name: string;
  description?: string;
  creditCount: number;
  price: number;
  validityDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SubscriptionDto {
  id: string;
  patientId: string;
  patientName?: string;
  packageId: string;
  packageName?: string;
  creditsRemaining: number;
  creditsUsed: number;
  status: SubscriptionStatus;
  activatedAt: string;
  expiresAt: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ── UI-shape for pilates lists ─────────────────────────────────────────

export interface UIPilatesSession {
  rawId: string;
  id: string;
  classId: string;
  className: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  booked: number;
  available: number;
  status: PilatesSessionStatus;
}

export function mapToUIPilatesSession(
  api: PilatesSessionDto
): UIPilatesSession {
  return {
    rawId: api.id,
    id: api.id?.slice(0, 8) || "",
    classId: api.classId,
    className: api.className || "Unnamed Class",
    date: api.sessionDate,
    time: api.startTime?.slice(0, 5) || "",
    duration: api.durationMinutes,
    capacity: api.capacity,
    booked: api.bookedCount,
    available: Math.max(0, api.capacity - api.bookedCount),
    status: api.status,
  };
}

export interface UIPilatesBooking {
  rawId: string;
  id: string;
  sessionId: string;
  sessionName: string;
  patientId: string;
  patientName: string;
  initials: string;
  status: PilatesBookingStatus;
  bookedAt: string;
}

export function mapToUIPilatesBooking(
  api: PilatesBookingDto
): UIPilatesBooking {
  return {
    rawId: api.id,
    id: api.id?.slice(0, 8) || "",
    sessionId: api.sessionId,
    sessionName: api.sessionName || "Session",
    patientId: api.patientId,
    patientName: api.patientName || "Unknown Patient",
    initials: getInitials(api.patientName || ""),
    status: api.status,
    bookedAt: api.bookedAt,
  };
}

export interface UISubscription {
  rawId: string;
  id: string;
  packageId: string;
  packageName: string;
  creditsRemaining: number;
  creditsUsed: number;
  totalCredits: number;
  status: SubscriptionStatus;
  activatedAt: string;
  expiresAt: string;
}

export function mapToUISubscription(api: SubscriptionDto): UISubscription {
  return {
    rawId: api.id,
    id: api.id?.slice(0, 8) || "",
    packageId: api.packageId,
    packageName: api.packageName || "Package",
    creditsRemaining: api.creditsRemaining,
    creditsUsed: api.creditsUsed,
    totalCredits: api.creditsRemaining + api.creditsUsed,
    status: api.status,
    activatedAt: api.activatedAt,
    expiresAt: api.expiresAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Request Payloads (for services and forms)
// ─────────────────────────────────────────────────────────────────────────

export interface CreateDermatologyRecordRequest {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  generalNotes?: string;
  amount?: number;
  discount?: number;
}

export interface UpdateDermatologyObservationRequest {
  generalNotes?: string;
  amount?: number;
  discount?: number;
  amountPaid?: number;
  paymentStatus?: PaymentStatus;
  status?: DermatologyRecordStatus;
}

export interface AddSkinConditionRequest {
  conditionName: string;
  affectedArea?: string;
  severity?: SkinConditionSeverity;
  diagnosis?: string;
  treatment?: string;
}

export interface UpdateSkinConditionRequest {
  conditionName: string;
  affectedArea?: string;
  severity?: SkinConditionSeverity;
  diagnosis?: string;
  treatment?: string;
}

export interface RecordDermatologyPaymentRequest {
  amountPaid: number;
  notes?: string;
}

export interface CreatePilatesProgramRequest {
  name: string;
  description?: string;
  durationWeeks?: number;
  isActive: boolean;
}

export interface CreatePilatesPackageRequest {
  name: string;
  description?: string;
  creditCount: number;
  price: number;
  validityDays: number;
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

export interface GenerateSessionsRequest {
  classId: string;
  startDate: string;
  endDate: string;
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

// ─────────────────────────────────────────────────────────────────────────
// Pagination wrapper (matches Spring Page<T> shape)
// ─────────────────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}