import { useMutation } from "@tanstack/react-query";
import { requestRegistrationOtp } from "@/services/authService";

export const useRequestOtp = () => {
  return useMutation({
    mutationFn: requestRegistrationOtp,
  });
};
