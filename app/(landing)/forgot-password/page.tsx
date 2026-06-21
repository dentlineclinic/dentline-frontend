"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useRequestPasswordOtp,
  useResetForgottenPassword,
} from "@/hooks/useForgotPassword";
import { isValidEmail, isValidPhone } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────
const RESEND_COOLDOWN = 60; // seconds

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
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
  );
}

// ─── Password visibility toggle button ───────────────────────────────────────
function EyeToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#00685C] transition-colors"
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1 state
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState("");

  // Step 2 state
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");

  // Success state
  const [succeeded, setSucceeded] = useState(false);

  // Resend cooldown
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const otpRef = useRef<HTMLInputElement>(null);

  const requestOtpMutation = useRequestPasswordOtp();
  const resetMutation = useResetForgottenPassword();

  // ── Resend timer ────────────────────────────────────────────────────────────
  const startResendTimer = useCallback(() => {
    setResendTimer(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // Auto-focus OTP field when entering step 2
  useEffect(() => {
    if (step === 2) setTimeout(() => otpRef.current?.focus(), 50);
  }, [step]);

  // Redirect to login after success
  useEffect(() => {
    if (!succeeded) return;
    const t = setTimeout(() => router.push("/login"), 3000);
    return () => clearTimeout(t);
  }, [succeeded, router]);

  // ── Step 1 submit ───────────────────────────────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentifierError("");

    const trimmedIdentifier = identifier.trim();
    const isEmail = trimmedIdentifier.includes("@");

    if (!trimmedIdentifier) {
      setIdentifierError("Please enter your email or phone number.");
      return;
    }

    if (isEmail && !isValidEmail(trimmedIdentifier)) {
      setIdentifierError("Please enter a valid email address.");
      return;
    }

    if (!isEmail && !isValidPhone(trimmedIdentifier)) {
      setIdentifierError("Please enter a valid phone number.");
      return;
    }

    try {
      const res = await requestOtpMutation.mutateAsync(
        isEmail ? { email: trimmedIdentifier } : { phoneNumber: trimmedIdentifier }
      );
      if (res.success) {
        setStep(2);
        startResendTimer();
      } else {
        setIdentifierError(res.message || "Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setIdentifierError(
        msg === "User not found"
          ? "No account found with that email or phone number."
          : msg || "Unable to send OTP. Please try again."
      );
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0 || requestOtpMutation.isPending) return;
    setFormError("");
    try {
      const isEmail = identifier.includes("@");
      const res = await requestOtpMutation.mutateAsync(
        isEmail ? { email: identifier.trim() } : { phoneNumber: identifier.trim() }
      );
      if (res.success) {
        startResendTimer();
      } else {
        setFormError(res.message || "Failed to resend OTP.");
      }
    } catch {
      setFormError("Failed to resend OTP. Please try again.");
    }
  };

  // ── Step 2 submit ───────────────────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      setFormError("OTP is required.");
      return;
    }
    if (!/^\d{6}$/.test(trimmedOtp)) {
      setFormError("OTP must be exactly 6 digits.");
      return;
    }
    if (!newPassword) {
      setFormError("New password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      const isEmail = identifier.includes("@");
      const res = await resetMutation.mutateAsync({
        ...(isEmail ? { email: identifier.trim() } : { phoneNumber: identifier.trim() }),
        otp: trimmedOtp,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setSucceeded(true);
      } else {
        setFormError(res.message || "Password reset failed. Please try again.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "";
      if (msg.toLowerCase().includes("otp") || msg.toLowerCase().includes("invalid")) {
        setFormError("Invalid or expired OTP. Please request a new one.");
      } else if (msg.toLowerCase().includes("locked") || msg.toLowerCase().includes("account")) {
        setFormError("Your account is locked. Please contact support.");
      } else {
        setFormError(msg || "Something went wrong. Please try again.");
      }
    }
  };

  // ── Shared input classes ────────────────────────────────────────────────────
  const inputBase =
    "w-full bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-base text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex flex-col">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#008375]/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BBD3FD]/20 rounded-full blur-[80px]" />
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-[1000px] bg-white rounded-xl shadow-xl border border-[#BDC9C5]/30 overflow-hidden flex">

          {/* ── Left branding panel ── */}
          <div className="hidden md:flex flex-col justify-between bg-[#008375] p-10 w-[420px] flex-shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 relative">
                <Image
                  src="https://res.cloudinary.com/da00pceww/image/upload/v1778523653/DENTLINE_logo_lettermark-02_d0vx2k.png"
                  alt="Dentline Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-white font-semibold text-2xl tracking-tight">Dentline Clinic</span>
            </div>

            <div className="flex flex-col gap-4">
              {/* Step indicator */}
              <div className="flex flex-col gap-3">
                {[
                  { n: 1, label: "Enter your contact", sub: "We'll send a one-time code" },
                  { n: 2, label: "Reset your password", sub: "Enter the OTP and new password" },
                ].map(({ n, label, sub }) => (
                  <div key={n} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 transition-colors ${
                        step >= n
                          ? "bg-white text-[#00685C]"
                          : "bg-white/20 text-white/60"
                      }`}
                    >
                      {step > n ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        n
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${step >= n ? "text-white" : "text-white/50"}`}>
                        {label}
                      </p>
                      <p className={`text-xs mt-0.5 ${step >= n ? "text-white/70" : "text-white/30"}`}>
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h1 className="text-white font-bold text-3xl leading-tight">
                  Recover your<br />account access.
                </h1>
                <p className="text-white/80 text-base leading-relaxed mt-2">
                  Follow the steps to securely reset your password and regain access to your portal.
                </p>
              </div>
            </div>

            <p className="text-white/50 text-xs">
              Remember your password?{" "}
              <Link href="/login" className="text-white font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* ── Right form panel ── */}
          <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">

            {/* ── SUCCESS STATE ── */}
            {succeeded ? (
              <div className="flex flex-col items-center text-center gap-5">
                <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0B1C30]">Password Reset!</h2>
                  <p className="text-[#485F83] mt-2 text-sm leading-relaxed">
                    Your password has been updated successfully.<br />
                    Redirecting you to login…
                  </p>
                </div>
                <Link
                  href="/login"
                  className="bg-[#00685C] text-white font-semibold text-sm px-8 py-3 rounded-lg hover:bg-[#008375] transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            ) : step === 1 ? (

              /* ── STEP 1: Request OTP ── */
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-[#0B1C30]">Forgot Password</h2>
                  <p className="text-base text-[#485F83] mt-1">
                    Enter your registered email or phone number and we&apos;ll send you a one-time code.
                  </p>
                </div>

                <form onSubmit={handleRequestOtp} className="flex flex-col gap-6" noValidate>
                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="fp-email" className="text-sm font-semibold text-[#3D4946]">
                      Registered Email or Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden="true">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        id="fp-email"
                        type="text"
                        autoComplete="username"
                        value={identifier}
                        onChange={(e) => { setIdentifier(e.target.value); setIdentifierError(""); }}
                        placeholder="you@example.com or +2348012345678"
                        className={`${inputBase} pl-12 ${identifierError ? "border-[#93000A] focus:border-[#93000A] focus:ring-[#93000A]" : ""}`}
                        aria-describedby={identifierError ? "fp-email-error" : undefined}
                        aria-invalid={!!identifierError}
                      />
                    </div>
                    {identifierError && (
                      <p id="fp-email-error" className="text-xs text-[#93000A] font-medium mt-0.5">
                        {identifierError}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={requestOtpMutation.isPending}
                    className="w-full bg-[#00685C] text-white font-semibold text-base py-4 rounded-lg shadow-sm hover:bg-[#008375] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requestOtpMutation.isPending ? (
                      <><Spinner /> Sending OTP…</>
                    ) : (
                      <>
                        Send OTP
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-10 pt-10 border-t border-[#BDC9C5]/30">
                  <p className="text-base text-[#485F83] text-center">
                    Remember your password?{" "}
                    <Link href="/login" className="font-semibold text-[#00685C] hover:underline">
                      Back to login
                    </Link>
                  </p>
                </div>
              </>

            ) : (

              /* ── STEP 2: Reset password ── */
              <>
                <div className="mb-8">
                  {/* Back to step 1 */}
                  <button
                    type="button"
                    onClick={() => { setStep(1); setFormError(""); setOtp(""); setNewPassword(""); setConfirmPassword(""); }}
                    className="flex items-center gap-1.5 text-sm text-[#485F83] hover:text-[#00685C] transition-colors mb-4"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Change contact details
                  </button>

                  <h2 className="text-3xl font-bold text-[#0B1C30]">Reset Password</h2>
                  <p className="text-base text-[#485F83] mt-1">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-semibold text-[#0B1C30]">{identifier}</span>
                  </p>
                </div>

                <form onSubmit={handleReset} className="flex flex-col gap-5" noValidate>
                  {/* Global error */}
                  {formError && (
                    <div
                      role="alert"
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                    >
                      {formError}
                    </div>
                  )}

                  {/* OTP */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="fp-otp" className="text-sm font-semibold text-[#3D4946]">
                        One-Time Code
                      </label>
                      {/* Resend */}
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendTimer > 0 || requestOtpMutation.isPending}
                        className="text-xs font-semibold text-[#00685C] hover:underline disabled:text-[#94A3B8] disabled:no-underline disabled:cursor-not-allowed transition-colors"
                      >
                        {requestOtpMutation.isPending
                          ? "Sending…"
                          : resendTimer > 0
                          ? `Resend in ${resendTimer}s`
                          : "Resend OTP"}
                      </button>
                    </div>
                    <input
                      id="fp-otp"
                      ref={otpRef}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtp(v);
                        setFormError("");
                      }}
                      placeholder="123456"
                      className={`${inputBase} tracking-[0.4em] text-center font-bold text-lg`}
                    />
                    <p className="text-xs text-[#94A3B8]">Enter the 6-digit code from your email or phone.</p>
                  </div>

                  {/* New password */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="fp-new-pw" className="text-sm font-semibold text-[#3D4946]">
                      New Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden="true">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        id="fp-new-pw"
                        type={showNew ? "text" : "password"}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setFormError(""); }}
                        placeholder="••••••••"
                        className={`${inputBase} pl-12 pr-12`}
                      />
                      <EyeToggle visible={showNew} onToggle={() => setShowNew((v) => !v)} />
                    </div>
                    <p className="text-xs text-[#94A3B8]">Minimum 8 characters.</p>
                  </div>

                  {/* Confirm password */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="fp-confirm-pw" className="text-sm font-semibold text-[#3D4946]">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden="true">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        id="fp-confirm-pw"
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setFormError(""); }}
                        placeholder="••••••••"
                        className={`${inputBase} pl-12 pr-12`}
                      />
                      <EyeToggle visible={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
                    </div>
                    {/* Live match indicator */}
                    {confirmPassword.length > 0 && (
                      <p className={`text-xs font-medium mt-0.5 ${newPassword === confirmPassword ? "text-[#166534]" : "text-[#93000A]"}`}>
                        {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={resetMutation.isPending}
                    className="w-full bg-[#00685C] text-white font-semibold text-base py-4 rounded-lg shadow-sm hover:bg-[#008375] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                  >
                    {resetMutation.isPending ? (
                      <><Spinner /> Resetting Password…</>
                    ) : (
                      <>
                        Reset Password
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-[#BDC9C5]/30">
                  <p className="text-base text-[#485F83] text-center">
                    Remember your password?{" "}
                    <Link href="/login" className="font-semibold text-[#00685C] hover:underline">
                      Back to login
                    </Link>
                  </p>
                </div>
              </>
            )}
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
