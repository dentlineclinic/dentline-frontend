"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function FailedContent() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get("tx_ref");
  const status = searchParams.get("status");
  const message = searchParams.get("message");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        {/* Warning icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#FEF3C7] flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[#92400E]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01M5.07 19h13.86a1.5 1.5 0 001.43-2.01l-6.93-14a1.5 1.5 0 00-2.86 0L3.64 17.99A1.5 1.5 0 005.07 19z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#0B1C30] text-center mb-2">
          Payment was not completed
        </h1>
        <p className="text-base text-[#485F83] text-center mb-6">
          Your transaction didn&apos;t go through. No charges were made to your
          account.
        </p>

        {/* Transaction details */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-4 mb-4">
          <div className="flex flex-col gap-3 text-sm">
            {txRef && (
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Transaction Ref</span>
                <span className="font-semibold text-[#0B1C30] font-mono text-xs">
                  {txRef}
                </span>
              </div>
            )}
            {status && (
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Status</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFDAD6] text-[#93000A]">
                  {status}
                </span>
              </div>
            )}
            {message && (
              <div className="flex flex-col gap-1 pt-2 border-t border-[#F1F5F9]">
                <span className="text-[#94A3B8]">Message</span>
                <span className="text-[#3D4946] text-sm">{message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Charged-but-failed notice */}
        <div className="bg-[#FFDAD6] border border-[#FCA5A5] rounded-xl p-4 mb-6">
          <p className="text-sm text-[#93000A]">
            If you were charged but the payment failed, please contact us at{" "}
            <a href="tel:09155588050" className="font-bold underline">
              09155588050
            </a>{" "}
            or{" "}
            <a
              href="mailto:info@dentlineclinic.com"
              className="font-bold underline"
            >
              info@dentlineclinic.com
            </a>
            .
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/patient/pilates/subscriptions"
          className="w-full flex items-center justify-center gap-2 bg-[#00685C] text-white font-semibold text-base py-3.5 rounded-lg shadow-sm hover:bg-[#008375] transition-colors"
        >
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Again
        </Link>
      </div>
    </div>
  );
}
