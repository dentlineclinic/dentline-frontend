"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLogin } from "@/hooks/useLogin";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const router = useRouter();
  
  const loginMutation = useLogin();

  // Handle redirect based on role after successful login
  useEffect(() => {
    if (loginMutation.isSuccess) {
      const role = localStorage.getItem("userRole");

      if (role === "DOCTOR") router.push("/doctor");
      else if (role === "PATIENT") router.push("/patient");
      else router.push("/");
    }
  }, [loginMutation.isSuccess, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    loginMutation.mutate({
      email,
      password,
      role: selectedRole,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#008375]/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BBD3FD]/20 rounded-full blur-[80px]" />
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-[1000px] bg-white rounded-xl shadow-xl border border-[#BDC9C5]/30 overflow-hidden flex">
          {/* Left: Branding */}
          <div className="hidden md:flex flex-col justify-between bg-[#008375] p-10 w-[500px] flex-shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 bg-white/20 rounded" />
              <span className="text-white font-semibold text-2xl tracking-tight">Dentline Clinic</span>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="text-white font-bold text-4xl leading-tight">
                Excellence in<br />Restorative Care.
              </h1>
              <p className="text-white/80 text-lg leading-relaxed">
                Welcome back to your professional portal. Access patient records, manage
                appointments, and deliver clinical excellence.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/20 border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-white text-sm font-semibold">Joined by 50+ Specialists</span>
            </div>
          </div>

          {/* Right: Form */}
          <div className="flex-1 flex flex-col justify-center px-16 py-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0B1C30]">Portal Login</h2>
              <p className="text-base text-[#485F83] mt-1">
                Please enter your credentials to proceed.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Error Message */}
              {loginMutation.isError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {loginMutation.error?.message || "Login failed. Please check your credentials."}
                </div>
              )}

              {/* Role Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Login as</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("PATIENT")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      selectedRole === "PATIENT"
                        ? "border-[#00685C] bg-[#00685C]/5 text-[#00685C]"
                        : "border-[#BDC9C5] bg-white text-[#485F83] hover:border-[#00685C]/50"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("DOCTOR")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      selectedRole === "DOCTOR"
                        ? "border-[#00685C] bg-[#00685C]/5 text-[#00685C]"
                        : "border-[#BDC9C5] bg-white text-[#485F83] hover:border-[#00685C]/50"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    Doctor
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Clinical Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dr.smith@dentline.com"
                    required
                    className="w-full bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg pl-12 pr-4 py-3 text-base text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#3D4946]">Secure Password</label>
                  <Link href="/forgot-password" className="text-sm font-semibold text-[#00685C] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg pl-12 pr-12 py-3 text-base text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#00685C]"
                    aria-label="Toggle password visibility"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-[#00685C] text-white font-semibold text-base py-4 rounded-lg shadow-sm hover:bg-[#008375] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  <>
                    Login as {selectedRole.toLowerCase()}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-10 pt-10 border-t border-[#BDC9C5]/30">
              <p className="text-base text-[#485F83] text-center">
                If you don't have an account?{" "}
                <Link href="/register" className="font-semibold text-[#00685C] hover:underline">
                  register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#BDC9C5]/20 px-6 py-8">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#485F83]">
            © 2024 Dentline Clinic. Clinical Excellence Guaranteed.
          </p>
        </div>
      </footer>
    </div>
  );
}