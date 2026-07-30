// hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/services/authService";
import { applyAuthSuccess } from "@/lib/auth";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      applyAuthSuccess(response.data.data);
    },
    // Return the user data so it's available in the component
    select: (response) => response.data.data,
  });
};