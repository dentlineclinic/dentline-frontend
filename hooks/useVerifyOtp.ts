import { useMutation } from "@tanstack/react-query";
import { verifyRegistrationOtp } from "@/services/authService";

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: verifyRegistrationOtp,
  });
};
