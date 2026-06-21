import { useMutation } from "@tanstack/react-query";
import {
  requestPasswordOtp,
  resetForgottenPassword,
} from "@/services/authService";

export const useRequestPasswordOtp = () =>
  useMutation({
    mutationFn: requestPasswordOtp,
    retry: false,
  });

export const useResetForgottenPassword = () =>
  useMutation({
    mutationFn: resetForgottenPassword,
    retry: false,
  });