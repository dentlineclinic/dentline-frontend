"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 shadow-sm max-w-md w-full text-center flex flex-col gap-5">
        <div className="w-14 h-14 bg-[#FFDAD6] rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-[#93000A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0B1C30]">Something went wrong</h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            {error.message || "An unexpected error occurred."}
          </p>
        </div>
        <button
          onClick={reset}
          className="bg-[#00685C] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#008375] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
