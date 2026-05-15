import { useQuery } from "@tanstack/react-query";
import { fetchAppointments } from "@/services/appointmentService";
import { queryKeys } from "@/lib/queryKeys";

export const useAppointments = (page: number, size: number) => {
  return useQuery({
    queryKey: queryKeys.appointments(page, size),
    queryFn: () => fetchAppointments(page, size),
    placeholderData: (prev) => prev, // keeps previous page data visible while next page loads
  });
};
