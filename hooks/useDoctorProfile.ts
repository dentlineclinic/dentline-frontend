import { useQuery } from "@tanstack/react-query";
import { fetchMyDoctorProfile } from "@/services/doctorService";

/**
 * Returns the currently logged-in doctor's profile,
 * including their clinicalModule ("DENTAL" | "DERMATOLOGY").
 *
 * Cached aggressively — the profile rarely changes.
 */
export function useDoctorProfile() {
  return useQuery({
    queryKey: ["doctor", "profile", "me"],
    queryFn: fetchMyDoctorProfile,
    staleTime: 1000 * 60 * 10,   // 10 min fresh
    gcTime: 1000 * 60 * 30,      // keep 30 min after unmount
    retry: 1,
  });
}