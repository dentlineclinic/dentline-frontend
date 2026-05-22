import { useMutation } from "@tanstack/react-query";
import { verifyAdminOtp } from "@/services/authService";
import { applyAuthSuccess } from "@/lib/auth";

export const useVerifyAdminOtp = () => {
  return useMutation({
    mutationFn: verifyAdminOtp,
    onSuccess: (response) => {
      applyAuthSuccess(response.data.data);
    },
  });
};
