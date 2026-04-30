import { useMutation } from "@tanstack/react-query";
import { verifyAdminOtp } from "@/services/authService";

export const useVerifyAdminOtp = () => {
  return useMutation({
    mutationFn: verifyAdminOtp,
    onSuccess: (response) => {
      const data = response.data.data;
      const role = data.role.replace("ROLE_", "");

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userRole", role);
      localStorage.setItem("tokenType", data.tokenType ?? "Bearer");
      localStorage.setItem(
        "mustChangePassword",
        String(data.mustChangePassword ?? false)
      );

      document.cookie = `token=${data.accessToken}; path=/; samesite=strict; max-age=86400`;
      document.cookie = `role=${role}; path=/; samesite=strict; max-age=86400`;
    },
  });
};
