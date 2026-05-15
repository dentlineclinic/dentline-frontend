"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVerifyAdminOtp } from "@/hooks/useVerifyAdminOtp";
import { useRequestAdminOtp } from "@/hooks/useRequestAdminOtp";
import Image from "next/image";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function AdminVerifyOtpPage() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [email, setEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmailValue, setEditEmailValue] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const verifyMutation = useVerifyAdminOtp();
  const resendMutation = useRequestAdminOtp();

  // Guard: redirect back if no email in session
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_otp_email");
    if (!stored) {
      router.replace("/admin-login/request-otp");
    } else {
      setEmail(stored);
      setEditEmailValue(stored);
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
    // Support pasting full OTP
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) return;

    verifyMutation.mutate(
      { email, otp },
      {
        onSuccess: () => {
          sessionStorage.removeItem("admin_otp_email");
          router.push("/admin");
        },
      }
    );
  };

  const handleResend = () => {
    if (!canResend || resendMutation.isPending) return;
    resendMutation.mutate(
      { email },
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

  const handleEmailChange = () => {
    const trimmed = editEmailValue.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    sessionStorage.setItem("admin_otp_email", trimmed);
    setEmail(trimmed);
    setIsEditingEmail(false);
    // Re-request OTP for the new email
    resendMutation.mutate(
      { email: trimmed },
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

  const verifyError =
    verifyMutation.isError && verifyMutation.error instanceof Error
      ? verifyMutation.error.message
      : verifyMutation.isError
      ? "Invalid or expired code. Please try again."
      : null;

  const resendError =
    resendMutation.isError && resendMutation.error instanceof Error
      ? resendMutation.error.message
      : resendMutation.isError
      ? "Failed to send a new code. Please try again."
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#008375]/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BBD3FD]/20 rounded-full blur-[80px]" />
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-[1000px] bg-white rounded-xl shadow-xl border border-[#BDC9C5]/30 overflow-hidden flex">
          {/* Left: Branding */}
          <div className="hidden md:flex flex-col justify-between bg-[#008375] p-10 w-[420px] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 relative">
                <Image
                  src="https://res.cloudinary.com/da00pceww/image/upload/v1778523653/DENTLINE_logo_lettermark-02_d0vx2k.png"
                  alt="Dentline Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-white font-semibold text-2xl tracking-tight">
                Dentline Clinic
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h1 className="text-white font-bold text-4xl leading-tight">
                Verify<br />Your Identity.
              </h1>
              <p className="text-white/80 text-lg leading-relaxed">
                Enter the 6-digit code sent to your admin email to complete sign-in.
              </p>
            </div>

            <p className="text-white/50 text-sm">
              © 2024 Dentline Clinic. All rights reserved.
            </p>
          </div>

          {/* Right: Form */}
          <div className="flex-1 flex flex-col justify-center px-10 md:px-16 py-16">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-full bg-[#0F766E] text-white text-xs font-bold flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span className="text-xs font-semibold text-[#0F766E]">Request OTP</span>
              </div>
              <div className="flex-1 h-px bg-[#00685C]" />
              <div className="flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-full bg-[#00685C] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-semibold text-[#00685C]">Verify & Login</span>
              </div>
            </div>

            {/* Email display / edit */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0B1C30]">Enter Your Code</h2>

              {isEditingEmail ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="email"
                    value={editEmailValue}
                    onChange={(e) => setEditEmailValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailChange()}
                    autoFocus
                    className="flex-1 bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-3 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleEmailChange}
                    disabled={resendMutation.isPending}
                    className="px-3 py-2 bg-[#00685C] text-white text-sm font-semibold rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50"
                  >
                    {resendMutation.isPending ? "Sending..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEditEmailValue(email);
                    }}
                    className="px-3 py-2 bg-white border border-[#E2E8F0] text-[#485F83] text-sm font-semibold rounded-lg hover:bg-[#F8FAFC] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-base text-[#485F83] mt-2 flex items-center gap-2 flex-wrap">
                  Code sent to{" "}
                  <span className="font-semibold text-[#0B1C30]">{email}</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(true)}
                    className="text-sm text-[#00685C] font-semibold hover:underline"
                  >
                    Change
                  </button>
                </p>
              )}
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-6">
              {/* Errors */}
              {verifyError && (
                <div className="bg-[#FFDAD6] border border-[#FCA5A5] text-[#93000A] px-4 py-3 rounded-lg text-sm font-semibold">
                  {verifyError}
                </div>
              )}

              {resendError && (
                <div className="bg-[#FFDAD6] border border-[#FCA5A5] text-[#93000A] px-4 py-3 rounded-lg text-sm font-semibold">
                  {resendError}
                </div>
              )}

              {resendMutation.isSuccess && !isEditingEmail && (
                <div className="bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] px-4 py-3 rounded-lg text-sm font-semibold">
                  A new code has been sent to your email.
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
                    Verify & Sign In
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
                <span className="text-[#94A3B8] font-semibold">Resend in {countdown}s</span>
              )}
            </p>

            <div className="mt-8 pt-8 border-t border-[#BDC9C5]/30">
              <Link
                href="/admin-login/request-otp"
                className="flex items-center gap-1.5 text-sm text-[#485F83] hover:text-[#00685C] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to email entry
              </Link>
            </div>
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