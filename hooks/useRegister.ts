import { useMutation } from "@tanstack/react-query";
import { completeRegistration } from "@/services/authService";

export const useRegister = () => {
  return useMutation({
    mutationFn: completeRegistration,
  });
};
