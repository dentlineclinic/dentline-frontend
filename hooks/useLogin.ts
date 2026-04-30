import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/services/authService";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      const data = response.data.data;
      const role = data.role.replace("ROLE_", "");

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userRole", role);

      document.cookie = `token=${data.accessToken}; path=/; samesite=strict; max-age=86400`;
      document.cookie = `role=${role}; path=/; samesite=strict; max-age=86400`;
    },
  });
};