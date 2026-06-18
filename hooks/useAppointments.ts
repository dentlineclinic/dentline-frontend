import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAppointments,
  fetchMonthlyCalendar,
  fetchAppointmentsByDate,
  adminBookAppointment,
  rescheduleAppointment,
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
    staleTime: 1000 * 60 * 2, // 2 min — calendar changes infrequently
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
      // also bust any cached calendar data
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
