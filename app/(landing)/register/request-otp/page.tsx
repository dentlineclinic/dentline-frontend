"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequestOtp } from "@/hooks/useRequestOtp";
import { isValidEmail, isValidPhone } from "@/lib/utils";

export default function RequestOtpPage() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const mutation = useRequestOtp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedIdentifier = identifier.trim();
    const isEmail = trimmedIdentifier.includes("@");

    if (!trimmedIdentifier) {
      setError("Please enter your email or phone number.");
      return;
    }

    if (isEmail && !isValidEmail(trimmedIdentifier)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isEmail && !isValidPhone(trimmedIdentifier)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setError("");

    mutation.mutate(
      isEmail
        ? { email: trimmedIdentifier }
        : { phoneNumber: trimmedIdentifier },
      {
        onSuccess: () => {
          sessionStorage.setItem("reg_identifier", trimmedIdentifier);
          router.push("/register/verify-otp");
        },
      }
    );
  };

  const errorMessage = error || (mutation.isError && mutation.error instanceof Error
    ? mutation.error.message
    : mutation.isError
      ? "Something went wrong. Please try again."
      : null);

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
              <span className="w-7 h-7 rounded-full bg-[#00685C] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-semibold text-[#00685C]">Email</span>
            </div>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-[#E2E8F0] text-[#94A3B8] text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-semibold text-[#94A3B8]">Verify</span>
            </div>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-[#E2E8F0] text-[#94A3B8] text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-semibold text-[#94A3B8]">Details</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-[#0D9488] font-bold text-xl">
              Dentline Clinic
            </Link>
            <h2 className="text-3xl font-bold text-[#0B1C30] mt-4">Create Your Account</h2>
            <p className="text-base text-[#485F83] mt-1">
              Enter your email address or phone number to get started. We&apos;ll send you a verification code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Error */}
            {errorMessage && (
              <div className="bg-[#FFDAD6] border border-[#FCA5A5] text-[#93000A] px-4 py-3 rounded-lg text-sm font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">
                Email or Phone Number <span className="text-[#93000A]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="john.doe@example.com or +2348012345678"
                  required
                  autoFocus
                  className="w-full bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg pl-12 pr-4 py-3 text-base text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-[#00685C] text-white font-semibold text-base py-4 rounded-lg shadow-sm hover:bg-[#008375] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
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
                  Sending code...
                </>
              ) : (
                <>
                  Send Verification Code
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

          <p className="text-base text-[#485F83] text-center mt-8">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#00685C] hover:underline">
              Sign in
            </Link>
          </p>
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
