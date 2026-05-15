import { useQuery } from "@tanstack/react-query";
import { fetchPatientDashboard } from "@/services/patientService";
import { fetchDoctorDashboard } from "@/services/doctorService";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Patient dashboard — cached for 1 minute.
 * Navigate away and back within 1 min → no extra API call.
 */
export function usePatientDashboard() {
  return useQuery({
    queryKey: queryKeys.patientDashboard,
    queryFn: fetchPatientDashboard,
    staleTime: 1000 * 30,      // 30 sec fresh
    gcTime: 1000 * 60 * 5,    // keep in cache 5 min after unmount
    retry: 2,
  });
}

/**
 * Doctor dashboard — cached for 1 minute.
 */
export function useDoctorDashboard() {
  return useQuery({
    queryKey: queryKeys.doctorDashboard,
    queryFn: fetchDoctorDashboard,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 2,
  });
}
