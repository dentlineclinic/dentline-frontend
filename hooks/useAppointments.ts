import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAppointments,
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

/** Change 2: Admin book appointment mutation */
export const useAdminBookAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminBookAppointment,
    onSuccess: () => {
      // Invalidate all appointment list queries so the table refreshes
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
    },
  });
};

/** Change 3: Reschedule appointment mutation */
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
    },
  });
};
