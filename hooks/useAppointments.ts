import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAppointments,
  fetchMonthlyCalendar,
  fetchAppointmentsByDate,
  adminBookAppointment,
  rescheduleAppointment,
  markAppointmentArrived,  
  assignDoctorToAppointment,
  bookFamilyAppointment,
  adminBookFamilyAppointment,
    cancelAppointment,
} from "@/services/appointmentService";
import { queryKeys } from "@/lib/queryKeys";

export const useAppointments = (page: number, size: number) => {
  return useQuery({
    queryKey: queryKeys.appointments(page, size),
    queryFn: () => fetchAppointments(page, size),
    placeholderData: (prev) => prev,
  });
};

export const useAppointmentCalendar = (year: number, month: number) => {
  return useQuery({
    queryKey: queryKeys.appointmentCalendar(year, month),
    queryFn: () => fetchMonthlyCalendar(year, month),
    staleTime: 1000 * 60 * 2,
  });
};

export const useAppointmentsByDate = (date: string | null) => {
  return useQuery({
    queryKey: queryKeys.appointmentsByDate(date ?? ""),
    queryFn: () => fetchAppointmentsByDate(date!, 0, 50),
    enabled: !!date,
  });
};

export const useAdminBookAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminBookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: ["appointments", "calendar"] });
    },
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      newAppointmentDate,
    }: {
      appointmentId: string;
      newAppointmentDate: string;
    }) => rescheduleAppointment(appointmentId, { newAppointmentDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: ["appointments", "calendar"] });
    },
  });
};

// ✅ ADD THESE NEW MUTATION HOOKS:

export const useMarkArrival = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      // Use the imported service function that uses the api client
      return await markAppointmentArrived(appointmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: ["appointments", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "byDate"] });
    },
  });
};

export const useAssignDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appointmentId, doctorId }: { appointmentId: string; doctorId: string }) => {
      // Use the imported service function that uses the api client
      return await assignDoctorToAppointment(appointmentId, doctorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: ["appointments", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "byDate"] });
    },
  });
};
// In useAppointments.ts - update the useCancelAppointment hook

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelAppointment, // ← Use the imported function
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: ["appointments", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "byDate"] });
      if (data?.data?.id) {
        queryClient.invalidateQueries({ queryKey: ["appointments", data.data.id] });
      }
    },
    onError: (error: any) => {
      console.error('Cancel appointment error:', error);
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await fetch(`/api/appointments/${appointmentId}/complete`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        throw new Error('Failed to complete appointment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: ["appointments", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "byDate"] });
    },
  });
};

// ── Family Appointment Booking Hooks ─────────────────────────────────────────────

export const useBookFamilyAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookFamilyAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: ["appointments", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "byDate"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "my"] });
    },
  });
};

export const useAdminBookFamilyAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminBookFamilyAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: ["appointments", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "byDate"] });
    },
  });
};
