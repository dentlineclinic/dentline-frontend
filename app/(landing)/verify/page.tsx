import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Verify Account" };

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex items-center justify-center px-6">
      <div className="w-full max-w-[480px] bg-white rounded-xl shadow-xl border border-[#BDC9C5]/30 p-10 text-center">
        <div className="w-16 h-16 bg-[#F0FDFA] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-[#0B1C30] mb-2">Verify Your Account</h2>
        <p className="text-base text-[#485F83] mb-8">
          We sent a 6-digit verification code to your email. Enter it below to activate your
          Dentline account.
        </p>

        <form className="flex flex-col gap-6">
          <div className="flex gap-3 justify-center">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                className="w-12 h-14 text-center text-xl font-bold bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-[#00685C] text-white font-semibold text-base py-4 rounded-lg shadow-sm hover:bg-[#008375] transition-colors"
          >
            Verify Account
          </button>
        </form>

        <p className="text-sm text-[#485F83] mt-6">
          Didn&apos;t receive the code?{" "}
          <button className="text-[#00685C] font-semibold hover:underline">Resend Code</button>
        </p>

        <Link href="/login" className="block text-sm text-[#485F83] mt-4 hover:text-[#00685C]">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
