"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVerifyOtp } from "@/hooks/useVerifyOtp";
import { useRequestOtp } from "@/hooks/useRequestOtp";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyOtpPage() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [identifier, setIdentifier] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const verifyMutation = useVerifyOtp();
  const resendMutation = useRequestOtp();

  // Guard: redirect back if no identifier in session
  useEffect(() => {
    const stored = sessionStorage.getItem("reg_identifier");
    if (!stored) {
      router.replace("/register/request-otp");
    } else {
      setIdentifier(stored);
    }
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Allow pasting full OTP
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
      const next = Array(OTP_LENGTH).fill("");
      pasted.split("").forEach((ch, i) => {
        next[i] = ch;
      });
      setDigits(next);
      focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
      return;
    }

    const digit = value.replace(/\D/g, "");
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) return;

    const isEmail = identifier.includes("@");

    verifyMutation.mutate(
      isEmail
        ? { email: identifier, otp }
        : { phoneNumber: identifier, otp },
      {
        onSuccess: () => {
          sessionStorage.setItem("reg_otp_verified", "true");
          router.push("/register/complete");
        },
      }
    );
  };

  const handleResend = () => {
    if (!canResend || resendMutation.isPending) return;
    const isEmail = identifier.includes("@");

    resendMutation.mutate(
      isEmail
        ? { email: identifier }
        : { phoneNumber: identifier },
      {
        onSuccess: () => {
          setDigits(Array(OTP_LENGTH).fill(""));
          setCountdown(RESEND_COOLDOWN);
          setCanResend(false);
          focusInput(0);
        },
      }
    );
  };

  const otp = digits.join("");
  const isComplete = otp.length === OTP_LENGTH;

  const errorMessage =
    verifyMutation.isError && verifyMutation.error instanceof Error
      ? verifyMutation.error.message
      : verifyMutation.isError
        ? "Invalid or expired code. Please try again."
        : null;

  const resendError =
    resendMutation.isError && resendMutation.error instanceof Error
      ? resendMutation.error.message
      : resendMutation.isError
        ? "Failed to resend code. Please try again."
        : null;

  const isEmail = identifier.includes("@");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#008375]/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BBD3FD]/20 rounded-full blur-[80px]" />
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-[480px] bg-white rounded-xl shadow-xl border border-[#BDC9C5]/30 p-10">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-[#0F766E] text-white text-xs font-bold flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-[#0F766E]">Contact</span>
            </div>
            <div className="flex-1 h-px bg-[#00685C]" />
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-[#00685C] text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-semibold text-[#00685C]">Verify</span>
            </div>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-[#E2E8F0] text-[#94A3B8] text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-semibold text-[#94A3B8]">Details</span>
            </div>
          </div>

          {/* Icon - dynamic based on identifier type */}
          <div className="w-16 h-16 bg-[#F0FDFA] rounded-full flex items-center justify-center mb-6">
            {isEmail ? (
              <svg className="w-8 h-8 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 0l8 5 8-5M5 19l5-5m10 0l-5-5"
                />
              </svg>
            )}
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0B1C30]">Verify Your Account</h2>
            <p className="text-base text-[#485F83] mt-2">
              We sent a 6-digit verification code to{" "}
              {identifier && (
                <span className="font-semibold text-[#0B1C30]">{identifier}</span>
              )}
              . Enter it below to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Error */}
            {errorMessage && (
              <div className="bg-[#FFDAD6] border border-[#FCA5A5] text-[#93000A] px-4 py-3 rounded-lg text-sm font-semibold">
                {errorMessage}
              </div>
            )}

            {resendError && (
              <div className="bg-[#FFDAD6] border border-[#FCA5A5] text-[#93000A] px-4 py-3 rounded-lg text-sm font-semibold">
                {resendError}
              </div>
            )}

            {resendMutation.isSuccess && (
              <div className="bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] px-4 py-3 rounded-lg text-sm font-semibold">
                A new verification code has been sent.
              </div>
            )}

            {/* OTP inputs */}
            <div className="flex gap-3 justify-center">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={OTP_LENGTH}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  className={`w-12 h-14 text-center text-xl font-bold bg-[#EFF4FF] border rounded-lg outline-none transition-colors ${
                    verifyMutation.isError
                      ? "border-[#93000A] focus:border-[#BA1A1A]"
                      : digit
                        ? "border-[#00685C] bg-[#F0FDFA]"
                        : "border-[#BDC9C5] focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C]"
                  }`}
                />
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isComplete || verifyMutation.isPending}
              className="w-full bg-[#00685C] text-white font-semibold text-base py-4 rounded-lg shadow-sm hover:bg-[#008375] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyMutation.isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  Verify Code
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Resend */}
          <p className="text-sm text-[#485F83] text-center mt-6">
            Didn&apos;t receive the code?{" "}
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="text-[#00685C] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendMutation.isPending ? "Sending..." : "Resend Code"}
              </button>
            ) : (
              <span className="text-[#94A3B8] font-semibold">
                Resend in {countdown}s
              </span>
            )}
          </p>

          <div className="mt-6 pt-6 border-t border-[#BDC9C5]/30">
            <Link
              href="/register/request-otp"
              className="flex items-center gap-1.5 text-sm text-[#485F83] hover:text-[#00685C] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Change email or phone number
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#BDC9C5]/20 px-6 py-8">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-sm text-[#485F83] text-center">
            © 2024 Dentline Clinic. Clinical Excellence Guaranteed.
          </p>
        </div>
      </footer>
    </div>
  );
}