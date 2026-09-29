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
    page !== undefined
      ? ["appointments", "doctor", page]
      : ["appointments", "doctor"],

  // Patients
  patients: (page?: number, search?: string) =>
    ["patients", page, search].filter((v) => v !== undefined),
  patientHistories: (patientId: string, page?: number) =>
    ["patient-histories", patientId, page].filter((v) => v !== undefined),
  myHistories: (page?: number) =>
    page !== undefined
      ? ["patient-histories", "my", page]
      : ["patient-histories", "my"],

  // Doctors
  doctors: (page?: number, search?: string) =>
    ["doctors", page, search].filter((v) => v !== undefined),
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

  // Calendar
  appointmentCalendar: (year: number, month: number) =>
    ["appointments", "calendar", year, month] as const,
  appointmentsByDate: (date: string) =>
    ["appointments", "calendar", "day", date] as const,

  // ──────────────────────────────────────────────────────────────────
  // Dermatology
  // ──────────────────────────────────────────────────────────────────
  dermatology: {
    // List all (admin)
    all: (page?: number, size?: number) =>
      ["dermatology", "all", page, size].filter((v) => v !== undefined),

    // List by patient
    byPatient: (patientId: string, page?: number, size?: number) =>
      ["dermatology", "patient", patientId, page, size].filter(
        (v) => v !== undefined
      ),

    // List by doctor
    byDoctor: (doctorId: string, page?: number, size?: number) =>
      ["dermatology", "doctor", doctorId, page, size].filter(
        (v) => v !== undefined
      ),

    // Single record
    byId: (id: string) => ["dermatology", "record", id] as const,

    // Root key for broad invalidation
    root: ["dermatology"] as const,
  },

  // ──────────────────────────────────────────────────────────────────
  // Pilates — Programs
  // ──────────────────────────────────────────────────────────────────
  pilatesPrograms: {
    all: (page?: number, size?: number) =>
      ["pilates", "programs", page, size].filter((v) => v !== undefined),
    active: ["pilates", "programs", "active"] as const,
    byId: (id: string) => ["pilates", "programs", id] as const,
    root: ["pilates", "programs"] as const,
  },

  // ──────────────────────────────────────────────────────────────────
  // Pilates — Packages
  // ──────────────────────────────────────────────────────────────────
  pilatesPackages: {
    // Admin list
    all: (page?: number, size?: number) =>
      ["pilates", "packages", "admin", page, size].filter(
        (v) => v !== undefined
      ),
    // Admin active
    active: ["pilates", "packages", "admin", "active"] as const,
    // Public active (used by anonymous browse)
    publicActive: ["pilates", "packages", "public"] as const,
    // Public by id
    publicById: (id: string) =>
      ["pilates", "packages", "public", id] as const,
    byId: (id: string) => ["pilates", "packages", id] as const,
    root: ["pilates", "packages"] as const,
  },

  // ──────────────────────────────────────────────────────────────────
  // Pilates — Instructors
  // ──────────────────────────────────────────────────────────────────
  pilatesInstructors: {
    all: (page?: number, size?: number) =>
      ["pilates", "instructors", page, size].filter(
        (v) => v !== undefined
      ),
    active: ["pilates", "instructors", "active"] as const,
    byId: (id: string) => ["pilates", "instructors", id] as const,
    root: ["pilates", "instructors"] as const,
  },

  // ──────────────────────────────────────────────────────────────────
  // Pilates — Classes
  // ──────────────────────────────────────────────────────────────────
  pilatesClasses: {
    all: (page?: number, size?: number) =>
      ["pilates", "classes", page, size].filter((v) => v !== undefined),
    byId: (id: string) => ["pilates", "classes", id] as const,
    byProgram: (programId: string) =>
      ["pilates", "classes", "program", programId] as const,
    byInstructor: (instructorId: string) =>
      ["pilates", "classes", "instructor", instructorId] as const,
    active: ["pilates", "classes", "active"] as const,
    root: ["pilates", "classes"] as const,
  },

  // ──────────────────────────────────────────────────────────────────
  // Pilates — Sessions
  // ──────────────────────────────────────────────────────────────────
  pilatesSessions: {
    byId: (id: string) => ["pilates", "sessions", id] as const,
    upcomingForClass: (classId: string) =>
      ["pilates", "sessions", "upcoming", classId] as const,
    byClass: (classId: string) =>
      ["pilates", "sessions", "class", classId] as const,
    byDateRange: (start: string, end: string, page?: number, size?: number) =>
      ["pilates", "sessions", "range", start, end, page, size].filter(
        (v) => v !== undefined
      ),
    root: ["pilates", "sessions"] as const,
  },

  // ──────────────────────────────────────────────────────────────────
  // Pilates — Bookings
  // ──────────────────────────────────────────────────────────────────
  pilatesBookings: {
    my: (page?: number, size?: number) =>
      ["pilates", "bookings", "my", page, size].filter(
        (v) => v !== undefined
      ),
    byId: (id: string) => ["pilates", "bookings", id] as const,
    bySession: (sessionId: string) =>
      ["pilates", "bookings", "session", sessionId] as const,
    byPatient: (patientId: string, page?: number, size?: number) =>
      ["pilates", "bookings", "patient", patientId, page, size].filter(
        (v) => v !== undefined
      ),
    root: ["pilates", "bookings"] as const,
  },

  // ──────────────────────────────────────────────────────────────────
  // Pilates — Subscriptions
  // ──────────────────────────────────────────────────────────────────
  subscriptions: {
    my: (page?: number, size?: number) =>
      ["subscriptions", "my", page, size].filter((v) => v !== undefined),
    myActive: ["subscriptions", "my", "active"] as const,
    byId: (id: string) => ["subscriptions", id] as const,
    byPatient: (patientId: string, page?: number, size?: number) =>
      ["subscriptions", "patient", patientId, page, size].filter(
        (v) => v !== undefined
      ),
    activeByPatient: (patientId: string) =>
      ["subscriptions", "patient", patientId, "active"] as const,
    root: ["subscriptions"] as const,
  },
} as const;