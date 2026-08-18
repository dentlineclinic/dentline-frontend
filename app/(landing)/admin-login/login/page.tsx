"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAdminLogin } from "@/hooks/useAdminLogin";

export default function AdminLoginPage() {
  const router = useRouter();
  const mutation = useAdminLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (mutation.isSuccess) {
      router.push("/admin");
    }
  }, [mutation.isSuccess, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email: email.trim(), password });
  };

  const errorMessage =
    mutation.isError && mutation.error instanceof Error
      ? mutation.error.message
      : mutation.isError
      ? "Invalid credentials. Please try again."
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
              <span className="text-white font-semibold text-2xl tracking-tight">Dentline Clinic</span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-white font-bold text-4xl leading-tight">
                Admin<br />Portal Access.
              </h1>
              <p className="text-white/80 text-lg leading-relaxed">
                Secure access for authorised administrators only. Sign in with your admin credentials.
              </p>
            </div>

            <p className="text-white/50 text-sm">© 2024 Dentline Clinic. All rights reserved.</p>
          </div>

          {/* Right: Form */}
          <div className="flex-1 flex flex-col justify-center px-10 md:px-16 py-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0B1C30]">Admin Login</h2>
              <p className="text-base text-[#485F83] mt-1">
                Sign in with your admin email and password.
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
                  Admin Email <span className="text-[#93000A]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@dentline.com"
                    required
                    autoFocus
                    className="w-full bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg pl-12 pr-4 py-3 text-base text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Password <span className="text-[#93000A]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg pl-12 pr-12 py-3 text-base text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#00685C]"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
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
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in as Admin
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-[#BDC9C5]/30">
              <p className="text-base text-[#485F83] text-center">
                Not an admin?{" "}
                <Link href="/login" className="font-semibold text-[#00685C] hover:underline">
                  Go to portal login
                </Link>
              </p>
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
