import { useMutation } from "@tanstack/react-query";
import { verifyAdminOtp } from "@/services/authService";
import { decodeJwtPayload } from "@/lib/jwt";

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
      localStorage.setItem("mustChangePassword", String(data.mustChangePassword ?? false));

      const payload = decodeJwtPayload(data.accessToken);
      const name  = (payload?.name  as string) || (payload?.fullName as string) || "";
      const email = (payload?.email as string) || (payload?.sub   as string) || "";

      if (name)  localStorage.setItem("userName",  name);
      if (email) localStorage.setItem("userEmail", email);

      document.cookie = `token=${data.accessToken}; path=/; samesite=strict; max-age=86400`;
      document.cookie = `role=${role}; path=/; samesite=strict; max-age=86400`;

      window.dispatchEvent(new Event("user-auth-updated"));
    },
  });
};
