import { useMutation } from "@tanstack/react-query";
import { adminLogin } from "@/services/authService";
import { applyAuthSuccess } from "@/lib/auth";

export const useAdminLogin = () => {
  return useMutation({
    mutationFn: adminLogin,
    onSuccess: (response) => {
      applyAuthSuccess(response.data.data);
    },
  });
};
