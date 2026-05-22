import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/services/authService";
import { applyAuthSuccess } from "@/lib/auth";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      applyAuthSuccess(response.data.data);
    },
  });
};
