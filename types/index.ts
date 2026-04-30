// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  status: "Active" | "Inactive" | "Suspended";
}

// Appointment Types
export type AppointmentStatus = "BOOKED" | "ARRIVAL" | "ASSIGN" | "COMPLETE" | "CANCEL" | "MISSED";

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
