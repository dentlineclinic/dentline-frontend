import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  // Programs
  fetchAllPrograms,
  fetchActivePrograms,
  fetchProgramById,
  createProgram,
  updateProgram,
  deactivateProgram,
  // Packages
  fetchActivePackagesPublic,
  fetchPackageByIdPublic,
  fetchAllPackages,
  fetchActivePackages,
  fetchPackageById,
  createPackage,
  updatePackage,
  deactivatePackage,
  // Instructors (catalog)
  fetchAllInstructors,
  fetchActiveInstructors,
  fetchInstructorById,
  createInstructor,
  updateInstructor,
  deactivateInstructor,
  // Instructor login accounts
  createPilatesInstructorAccount,
  fetchPilatesInstructorAccounts,
  fetchMyPilatesInstructorProfile,
  // Instructor self-service
  fetchMyInstructorClasses,
  fetchMyUpcomingSessions,
  uploadPilatesInstructorProfilePhoto,
  // Classes
  fetchAllClasses,
  fetchClassById,
  fetchClassesByProgram,
  fetchClassesByInstructor,
  fetchActiveClasses,
  createClass,
  updateClass,
  deactivateClass,
  generateClassSessions,
  // Sessions
  fetchSessionById,
  fetchUpcomingSessionsForClass,
  fetchSessionsByDateRange,
  fetchSessionsByClass,
  cancelSession,
  // Bookings
  bookSession,
  fetchMyBookings,
  fetchBookingById,
  fetchBookingsBySession,
  fetchBookingsByPatient,
  cancelBooking,
  markAttendance,
  // Subscriptions
  purchaseSubscription,
  fetchMySubscriptions,
  fetchMyActiveSubscriptions,
  fetchSubscriptionById,
  fetchSubscriptionsByPatient,
  fetchActiveSubscriptionsForPatient,
  cancelSubscription,
  initiateCheckout,
  pollCheckoutStatus,
  fetchActiveClassesPublic,
  fetchPilatesSessionCalendar,
  fetchPilatesSessionsByDate,
  // Types
  type CreatePilatesProgramRequest,
  type CreatePilatesPackageRequest,
  type CreatePilatesInstructorRequest,
  type UpdatePilatesInstructorRequest,
  type CreatePilatesClassRequest,
  type GenerateSessionsRequest,
  type BookPilatesSessionRequest,
  type MarkAttendanceRequest,
  type PurchaseSubscriptionRequest,
  type CreatePilatesInstructorAccountRequest,
  type CheckoutRequest,
} from "@/services/pilatesService";

// ═══════════════════════════════════════════════════════════════════════
// INSTRUCTOR SELF-SERVICE (my classes & sessions)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Classes taught by the logged-in instructor.
 * Backend: GET /api/pilates/instructor/classes
 */
export const useMyInstructorClasses = () =>
  useQuery({
    queryKey: ["pilates", "instructor-classes", "me"],
    queryFn: fetchMyInstructorClasses,
    staleTime: 1000 * 60, // 1 minute
  });

/**
 * Upcoming sessions for the logged-in instructor.
 * If from/to are omitted, backend defaults to today → +30 days.
 * Backend: GET /api/pilates/instructor/sessions/upcoming
 */
export const useMyUpcomingSessions = (from?: string, to?: string) =>
  useQuery({
    queryKey: [
      "pilates",
      "instructor-sessions",
      "me",
      from ?? "default",
      to ?? "default",
    ],
    queryFn: () => fetchMyUpcomingSessions(from, to),
    staleTime: 1000 * 30, // 30 seconds
  });

export const usePilatesSessionCalendar = (year: number, month: number) =>
  useQuery({
    queryKey: ["pilates", "sessions", "calendar", year, month],
    queryFn: () => fetchPilatesSessionCalendar(year, month),
    staleTime: 1000 * 30,
  });

export const usePilatesSessionsByDate = (date: string | null) =>
  useQuery({
    queryKey: ["pilates", "sessions", "by-date", date ?? ""],
    queryFn: () => fetchPilatesSessionsByDate(date!),
    enabled: !!date,
  });

// ═══════════════════════════════════════════════════════════════════════
// PROGRAMS
// ═══════════════════════════════════════════════════════════════════════

export const useAllPrograms = (page = 0, size = 10) =>
  useQuery({
    queryKey: queryKeys.pilatesPrograms.all(page, size),
    queryFn: () => fetchAllPrograms(page, size),
    placeholderData: (prev) => prev,
  });

export const useActivePrograms = () =>
  useQuery({
    queryKey: queryKeys.pilatesPrograms.active,
    queryFn: fetchActivePrograms,
    staleTime: 1000 * 60,
  });

export const useProgramById = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesPrograms.byId(id ?? ""),
    queryFn: () => fetchProgramById(id!),
    enabled: !!id,
  });

export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePilatesProgramRequest) => createProgram(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pilatesPrograms.root });
    },
  });
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreatePilatesProgramRequest;
    }) => updateProgram(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pilatesPrograms.root });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesPrograms.byId(variables.id),
      });
    },
  });
};

export const useDeactivateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pilatesPrograms.root });
    },
  });
};

// ═══════════════════════════════════════════════════════════════════════
// PACKAGES
// ═══════════════════════════════════════════════════════════════════════

export const usePublicActivePackages = () =>
  useQuery({
    queryKey: queryKeys.pilatesPackages.publicActive,
    queryFn: fetchActivePackagesPublic,
    staleTime: 1000 * 60 * 5,
  });

export const usePublicPackageById = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesPackages.publicById(id ?? ""),
    queryFn: () => fetchPackageByIdPublic(id!),
    enabled: !!id,
  });

export const useAllPackages = (page = 0, size = 10) =>
  useQuery({
    queryKey: queryKeys.pilatesPackages.all(page, size),
    queryFn: () => fetchAllPackages(page, size),
    placeholderData: (prev) => prev,
  });

export const useActivePackages = () =>
  useQuery({
    queryKey: queryKeys.pilatesPackages.active,
    queryFn: fetchActivePackages,
    staleTime: 1000 * 60,
  });

export const usePackageById = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesPackages.byId(id ?? ""),
    queryFn: () => fetchPackageById(id!),
    enabled: !!id,
  });

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePilatesPackageRequest) => createPackage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pilatesPackages.root });
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreatePilatesPackageRequest;
    }) => updatePackage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pilatesPackages.root });
    },
  });
};

export const useDeactivatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivatePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pilatesPackages.root });
    },
  });
};

// ═══════════════════════════════════════════════════════════════════════
// INSTRUCTORS (CATALOG)
// ═══════════════════════════════════════════════════════════════════════

export const useActiveInstructors = () =>
  useQuery({
    queryKey: queryKeys.pilatesInstructors.active,
    queryFn: fetchActiveInstructors,
    staleTime: 1000 * 60,
  });

export const useAllInstructors = (page = 0, size = 10) =>
  useQuery({
    queryKey: queryKeys.pilatesInstructors.all(page, size),
    queryFn: () => fetchAllInstructors(page, size),
    placeholderData: (prev) => prev,
  });

export const useInstructorById = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesInstructors.byId(id ?? ""),
    queryFn: () => fetchInstructorById(id!),
    enabled: !!id,
  });

export const useCreateInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePilatesInstructorRequest) =>
      createInstructor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesInstructors.root,
      });
    },
  });
};

export const useUpdateInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePilatesInstructorRequest;
    }) => updateInstructor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesInstructors.root,
      });
    },
  });
};

export const useDeactivateInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateInstructor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesInstructors.root,
      });
    },
  });
};

// ═══════════════════════════════════════════════════════════════════════
// INSTRUCTOR LOGIN ACCOUNTS
// ═══════════════════════════════════════════════════════════════════════

const INSTRUCTOR_ACCOUNTS_KEY = ["pilates", "instructor-accounts"] as const;

export const useCreatePilatesInstructorAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePilatesInstructorAccountRequest) =>
      createPilatesInstructorAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTRUCTOR_ACCOUNTS_KEY });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesInstructors.root,
      });
    },
  });
};

export const usePilatesInstructorAccounts = (
  page = 0,
  size = 10,
  search?: string
) =>
  useQuery({
    queryKey: [...INSTRUCTOR_ACCOUNTS_KEY, page, size, search],
    queryFn: () => fetchPilatesInstructorAccounts(page, size, search),
    placeholderData: (prev) => prev,
  });

export const useMyPilatesInstructorProfile = () =>
  useQuery({
    queryKey: [...INSTRUCTOR_ACCOUNTS_KEY, "me"],
    queryFn: fetchMyPilatesInstructorProfile,
  });

// ═══════════════════════════════════════════════════════════════════════
// CLASSES
// ═══════════════════════════════════════════════════════════════════════

export const useAllClasses = (page = 0, size = 10) =>
  useQuery({
    queryKey: queryKeys.pilatesClasses.all(page, size),
    queryFn: () => fetchAllClasses(page, size),
    placeholderData: (prev) => prev,
  });

export const useClassById = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesClasses.byId(id ?? ""),
    queryFn: () => fetchClassById(id!),
    enabled: !!id,
  });

export const useClassesByProgram = (programId: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesClasses.byProgram(programId ?? ""),
    queryFn: () => fetchClassesByProgram(programId!),
    enabled: !!programId,
  });

export const useClassesByInstructor = (instructorId: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesClasses.byInstructor(instructorId ?? ""),
    queryFn: () => fetchClassesByInstructor(instructorId!),
    enabled: !!instructorId,
  });

export const useActiveClasses = () =>
  useQuery({
    queryKey: queryKeys.pilatesClasses.active,
    queryFn: fetchActiveClasses,
    staleTime: 1000 * 60,
  });

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePilatesClassRequest) => createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pilatesClasses.root });
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreatePilatesClassRequest;
    }) => updateClass(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pilatesClasses.root });
    },
  });
};

export const useDeactivateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pilatesClasses.root });
    },
  });
};

export const useGenerateClassSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      classId,
      payload,
    }: {
      classId: string;
      payload: GenerateSessionsRequest;
    }) => generateClassSessions(classId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesSessions.root,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesSessions.upcomingForClass(variables.classId),
      });
    },
  });
};

// ═══════════════════════════════════════════════════════════════════════
// SESSIONS
// ═══════════════════════════════════════════════════════════════════════

export const useSessionById = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesSessions.byId(id ?? ""),
    queryFn: () => fetchSessionById(id!),
    enabled: !!id,
  });

export const useUpcomingSessionsForClass = (classId: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesSessions.upcomingForClass(classId ?? ""),
    queryFn: () => fetchUpcomingSessionsForClass(classId!),
    enabled: !!classId,
    staleTime: 1000 * 30,
  });

export const useSessionsByClass = (classId: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesSessions.byClass(classId ?? ""),
    queryFn: () => fetchSessionsByClass(classId!),
    enabled: !!classId,
  });

export const useSessionsByDateRange = (
  start: string | null,
  end: string | null,
  page = 0,
  size = 20
) =>
  useQuery({
    queryKey: queryKeys.pilatesSessions.byDateRange(
      start ?? "",
      end ?? "",
      page,
      size
    ),
    queryFn: () => fetchSessionsByDateRange(start!, end!, page, size),
    enabled: !!start && !!end,
    placeholderData: (prev) => prev,
  });

export const useCancelSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesSessions.root,
      });
    },
  });
};

// ═══════════════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════════════

export const useMyBookings = (page = 0, size = 10) =>
  useQuery({
    queryKey: queryKeys.pilatesBookings.my(page, size),
    queryFn: () => fetchMyBookings(page, size),
    placeholderData: (prev) => prev,
  });

export const useBookingById = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesBookings.byId(id ?? ""),
    queryFn: () => fetchBookingById(id!),
    enabled: !!id,
  });

export const useBookingsBySession = (sessionId: string | null) =>
  useQuery({
    queryKey: queryKeys.pilatesBookings.bySession(sessionId ?? ""),
    queryFn: () => fetchBookingsBySession(sessionId!),
    enabled: !!sessionId,
  });

export const useBookingsByPatient = (
  patientId: string | null,
  page = 0,
  size = 10
) =>
  useQuery({
    queryKey: queryKeys.pilatesBookings.byPatient(patientId ?? "", page, size),
    queryFn: () => fetchBookingsByPatient(patientId!, page, size),
    enabled: !!patientId,
    placeholderData: (prev) => prev,
  });

export const useBookSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookPilatesSessionRequest) => bookSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesBookings.root,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesSessions.root,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.root,
      });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesBookings.root,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesSessions.root,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.root,
      });
    },
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: MarkAttendanceRequest;
    }) => markAttendance(bookingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pilatesBookings.root,
      });
    },
  });
};

// ═══════════════════════════════════════════════════════════════════════
// SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════════════

export const useMySubscriptions = (page = 0, size = 10) =>
  useQuery({
    queryKey: queryKeys.subscriptions.my(page, size),
    queryFn: () => fetchMySubscriptions(page, size),
    placeholderData: (prev) => prev,
  });

export const useMyActiveSubscriptions = () =>
  useQuery({
    queryKey: queryKeys.subscriptions.myActive,
    queryFn: fetchMyActiveSubscriptions,
    staleTime: 1000 * 30,
  });

export const useSubscriptionById = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.subscriptions.byId(id ?? ""),
    queryFn: () => fetchSubscriptionById(id!),
    enabled: !!id,
  });

export const useSubscriptionsByPatient = (
  patientId: string | null,
  page = 0,
  size = 10
) =>
  useQuery({
    queryKey: queryKeys.subscriptions.byPatient(patientId ?? "", page, size),
    queryFn: () => fetchSubscriptionsByPatient(patientId!, page, size),
    enabled: !!patientId,
    placeholderData: (prev) => prev,
  });

export const useActiveSubscriptionsForPatient = (patientId: string | null) =>
  useQuery({
    queryKey: queryKeys.subscriptions.activeByPatient(patientId ?? ""),
    queryFn: () => fetchActiveSubscriptionsForPatient(patientId!),
    enabled: !!patientId,
    staleTime: 1000 * 30,
  });

export const usePurchaseSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseSubscriptionRequest) =>
      purchaseSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.root,
      });
    },
  });
};

export const useInitiateCheckout = () =>
  useMutation({
    mutationFn: (payload: CheckoutRequest) => initiateCheckout(payload),
  });

export const usePollCheckoutStatus = (txRef: string | null) =>
  useQuery({
    queryKey: ["subscriptions", "checkout", txRef ?? ""],
    queryFn: () => pollCheckoutStatus(txRef!),
    enabled: !!txRef,
    // Poll every 3 seconds while status is PENDING
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return !status || status === "PENDING" ? 3000 : false;
    },
    staleTime: 0,
  });

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.root,
      });
    },
  });
};

// ═══════════════════════════════════════════════════════════════════════
// PUBLIC CLASSES (patient view)
// ═══════════════════════════════════════════════════════════════════════

export const useActiveClassesPublic = () =>
  useQuery({
    queryKey: ["pilates", "classes", "active", "public"],
    queryFn: fetchActiveClassesPublic,
    staleTime: 1000 * 60,
  });

// ═══════════════════════════════════════════════════════════════════════
// INSTRUCTOR PROFILE PHOTO UPLOAD
// ═══════════════════════════════════════════════════════════════════════

export const useUploadPilatesInstructorPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadPilatesInstructorProfilePhoto(id, file),
    onSuccess: (response) => {
      // ── Sync to localStorage so TopBar picks up the new photo ──────────
      const newPhotoUrl = response?.data?.profilePhotoUrl;
      if (newPhotoUrl) {
        localStorage.setItem("profilePhotoUrl", newPhotoUrl);
        window.dispatchEvent(new Event("user-auth-updated"));
      }

      // ── Refresh cached queries ─────────────────────────────────────────
      queryClient.invalidateQueries({
        queryKey: [...INSTRUCTOR_ACCOUNTS_KEY, "me"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pilates", "classes", "active", "public"],
      });
    },
  });
};