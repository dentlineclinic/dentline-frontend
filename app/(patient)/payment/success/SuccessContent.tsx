"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMyActiveSubscriptions } from "@/hooks/usePilates";
import type { Subscription } from "@/services/pilatesService";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get("tx_ref");
  const status = searchParams.get("status");
  const message = searchParams.get("message");

  const hasTxRef = !!txRef && txRef.length > 0;

  const {
    data: subsData,
    isLoading: subsLoading,
    isError: subsError,
  } = useMyActiveSubscriptions();

  const subscriptions: Subscription[] = subsData?.data ?? [];
  // Most recently activated subscription (the one just purchased)
  const latestSub =
    subscriptions.find((s) => s.status === "ACTIVE") ?? subscriptions[0] ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        {hasTxRef ? (
          <>
            {/* Green checkmark */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-[#166534]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-[#0B1C30] text-center mb-2">
              Payment successful
            </h1>
            <p className="text-base text-[#485F83] text-center mb-6">
              Your Pilates credits have been activated.
            </p>

            {/* Credits purchased */}
            {subsLoading ? (
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 mb-4 shadow-sm">
                <div className="flex items-center justify-center gap-2 text-sm text-[#94A3B8]">
                  <svg
                    className="w-5 h-5 animate-spin text-[#00685C]"
                    fill="none"
                    viewBox="0 0 24 24"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Loading your credits…
                </div>
              </div>
            ) : subsError ? (
              <div className="bg-[#FFDAD6] border border-[#FCA5A5] rounded-xl p-4 mb-4">
                <p className="text-sm text-[#93000A]">
                  Couldn&apos;t load your credits, but your payment was
                  successful. Try refreshing the page.
                </p>
              </div>
            ) : latestSub ? (
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 mb-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#0B1C30]">
                    {latestSub.packageName ?? "Pilates Package"}
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534]">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">
                      Credits Purchased
                    </p>
                    <p className="text-2xl font-bold text-[#00685C]">
                      {latestSub.creditsRemaining + latestSub.creditsUsed}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">
                      Credits Remaining
                    </p>
                    <p className="text-2xl font-bold text-[#0B1C30]">
                      {latestSub.creditsRemaining}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8]">Expires On</span>
                    <span className="font-semibold text-[#0B1C30]">
                      {formatExpiry(latestSub.expiresAt)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-4 mb-4">
                <p className="text-sm text-[#94A3B8] text-center">
                  Your credits will appear shortly. If you don&apos;t see them,
                  try refreshing.
                </p>
              </div>
            )}

            {/* Transaction reference */}
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-4 mb-6">
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
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534]">
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

            {/* CTA */}
            <Link
              href="/patient/pilates/bookings"
              className="w-full flex items-center justify-center gap-2 bg-[#00685C] text-white font-semibold text-base py-3.5 rounded-lg shadow-sm hover:bg-[#008375] transition-colors"
            >
              Book a Session
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
            </Link>
          </>
        ) : (
          /* Unknown / missing tx_ref */
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-[#94A3B8]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#0B1C30] text-center mb-2">
              We couldn&apos;t find this payment
            </h1>
            <p className="text-base text-[#485F83] text-center mb-6">
              No transaction reference was found. If you completed a payment,
              please check your email for confirmation or contact support.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/patient/pilates/subscriptions"
                className="w-full flex items-center justify-center gap-2 bg-[#00685C] text-white font-semibold text-base py-3.5 rounded-lg shadow-sm hover:bg-[#008375] transition-colors"
              >
                View Subscriptions
              </Link>
              <Link
                href="/contact"
                className="w-full flex items-center justify-center text-sm font-semibold text-[#00685C] hover:underline py-2"
              >
                Contact Support
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatExpiry(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
