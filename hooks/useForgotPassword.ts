import { useMutation } from "@tanstack/react-query";
import {
  requestPasswordOtp,
  resetForgottenPassword,
} from "@/services/authService";

/** Step 1 — request OTP to the given email */
export const useRequestPasswordOtp = () =>
  useMutation({ mutationFn: requestPasswordOtp });

/** Step 2 — verify OTP + set new password */
export const useResetForgottenPassword = () =>
  useMutation({ mutationFn: resetForgottenPassword });
