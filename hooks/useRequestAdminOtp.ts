import { useMutation } from "@tanstack/react-query";
import { requestAdminOtp } from "@/services/authService";

export const useRequestAdminOtp = () => {
  return useMutation({
    mutationFn: requestAdminOtp,
  });
};
