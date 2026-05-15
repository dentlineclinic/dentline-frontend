/**
 * Centralized React Query key factory.
 * Using arrays ensures proper cache invalidation and avoids key collisions.
 */
export const queryKeys = {
  // Auth
  profile: ["profile"] as const,

  // Appointments
  appointments: (page?: number, size?: number) =>
    page !== undefined ? ["appointments", page, size] : ["appointments"],
  myAppointments: (page?: number) =>
    page !== undefined ? ["appointments", "my", page] : ["appointments", "my"],
  doctorAppointments: (page?: number) =>
    page !== undefined ? ["appointments", "doctor", page] : ["appointments", "doctor"],

  // Patients
  patients: (page?: number, search?: string) =>
    ["patients", page, search].filter(v => v !== undefined),
  patientHistories: (patientId: string, page?: number) =>
    ["patient-histories", patientId, page].filter(v => v !== undefined),
  myHistories: (page?: number) =>
    page !== undefined ? ["patient-histories", "my", page] : ["patient-histories", "my"],

  // Doctors
  doctors: (page?: number, search?: string) =>
    ["doctors", page, search].filter(v => v !== undefined),
  doctorDashboard: ["doctor", "dashboard"] as const,

  // Admin
  adminDashboard: ["admin", "dashboard"] as const,
  patientDashboard: ["patient", "dashboard"] as const,
  payments: (page?: number) =>
    page !== undefined ? ["payments", page] : ["payments"],
  reviews: (page?: number) =>
    page !== undefined ? ["reviews", page] : ["reviews"],
  notifications: (page?: number) =>
    page !== undefined ? ["notifications", page] : ["notifications"],
} as const;
