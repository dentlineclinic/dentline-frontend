import { useQuery } from "@tanstack/react-query";
import { fetchAppointments } from "@/services/appointmentService";

export const useAppointments = (page: number, size: number) => {
  return useQuery({
    queryKey: ["appointments", page, size],
    queryFn: () => fetchAppointments(page, size),
  });
};