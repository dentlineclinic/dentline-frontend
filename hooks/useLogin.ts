import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/services/authService";
import { decodeJwtPayload } from "@/lib/jwt";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      const data = response.data.data;
      const role = data.role.replace("ROLE_", "");

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userRole", role);

      // Decode JWT to get user info not included in response body
      const payload = decodeJwtPayload(data.accessToken);
      console.log("JWT PAYLOAD:", payload); // remove after confirming claim names
      const name  = (payload?.name  as string) || (payload?.fullName as string) || "";
      const email = (payload?.email as string) || (payload?.sub   as string) || "";
      const userId = (payload?.id as string) || (payload?.userId as string) || (payload?.sub as string) || "";

      if (name)   localStorage.setItem("userName",  name);
      if (email)  localStorage.setItem("userEmail", email);
      if (userId) localStorage.setItem("userId",    userId);

      document.cookie = `token=${data.accessToken}; path=/; samesite=strict; max-age=86400`;
      document.cookie = `role=${role}; path=/; samesite=strict; max-age=86400`;

      window.dispatchEvent(new Event("user-auth-updated"));
    },
  });
};