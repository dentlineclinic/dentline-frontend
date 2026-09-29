"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import {
  useMySubscriptions,
  useCancelSubscription,
} from "@/hooks/usePilates";
import type { Subscription } from "@/services/pilatesService";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 10;

const STATUS_OPTIONS = ["All", "ACTIVE", "EXPIRED", "CANCELLED"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const daysUntil = (iso: string | null | undefined) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function PatientSubscriptionsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const {
    data,
    isLoading,
    error: queryError,
  } = useMySubscriptions(page, DEFAULT_PAGE_SIZE);

  const cancelSubscription = useCancelSubscription();

  const subscriptions = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const currentPage = data?.data?.number ?? 0;
  const totalElements = data?.data?.totalElements ?? subscriptions.length;

  const filteredSubscriptions =
    statusFilter === "All"
      ? subscriptions
      : subscriptions.filter((s) => s.status === statusFilter);

  const activeSubscriptions = subscriptions.filter((s) => s.status === "ACTIVE");

  const totalActiveCredits = activeSubscriptions.reduce(
    (sum, s) => sum + s.creditsRemaining,
    0
  );

  const counts = {
    All: subscriptions.length,
    ACTIVE: activeSubscriptions.length,
    EXPIRED: subscriptions.filter((s) => s.status === "EXPIRED").length,
    CANCELLED: subscriptions.filter((s) => s.status === "CANCELLED").length,
  };

  const error = queryError
    ? typeof queryError === "string"
      ? queryError
      : (queryError as Error).message || "Failed to load subscriptions."
    : null;

  const openCancelModal = (sub: Subscription) => {
    setCancelTarget(sub);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelSubscription.mutateAsync(cancelTarget.id);
      toast.success(
        `Subscription cancelled. ${cancelTarget.creditsRemaining} unused credit${
          cancelTarget.creditsRemaining === 1 ? "" : "s"
        } will no longer be usable.`
      );
      setShowCancelModal(false);
      setCancelTarget(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel subscription");
    }
  };

  const goToPreviousPage = () => {
    setPage((current) => Math.max(current - 1, 0));
  };

  const goToNextPage = () => {
    setPage((current) => Math.min(current + 1, totalPages - 1));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="My Subscriptions"
        subtitle={`${totalElements} subscription${totalElements === 1 ? "" : "s"}`}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Back + browse link */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/patient/pilates"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00685C] hover:underline"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Classes
          </Link>
        </div>

        {/* Active credits banner */}
        {activeSubscriptions.length > 0 && (
          <div className="bg-gradient-to-r from-[#00685C] to-[#008375] rounded-xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center gap-4 flex-wrap">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/70 mb-1">
                  Available Class Credits
                </p>
                <p className="text-3xl font-bold">{totalActiveCredits}</p>
                <p className="text-xs text-white/70 mt-1">
                  Across {activeSubscriptions.length} active package
                  {activeSubscriptions.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mr-2">
            Filter:
          </span>
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setStatusFilter(option)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                statusFilter === option
                  ? "bg-[#00685C] text-white"
                  : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
              }`}
            >
              {option === "All"
                ? `All (${counts.All})`
                : `${option} (${counts[option]})`}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Subscriptions list */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm"
              >
                <div className="h-5 bg-[#F1F5F9] rounded animate-pulse w-1/2 mb-3" />
                <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-2/3 mb-2" />
                <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto bg-[#F0FDFA] rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-[#0D9488]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#0B1C30] mb-1">
              {statusFilter !== "All"
                ? `No ${statusFilter.toLowerCase()} subscriptions.`
                : "You have no subscriptions yet."}
            </p>
            <p className="text-xs text-[#94A3B8]">
              Subscriptions are purchased at the clinic. Ask the front desk for
              details.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredSubscriptions.map((sub) => {
              const isActive = sub.status === "ACTIVE";
              const totalCredits = sub.creditsRemaining + sub.creditsUsed;
              const creditPercent =
                totalCredits > 0
                  ? Math.round((sub.creditsRemaining / totalCredits) * 100)
                  : 0;
              const days = daysUntil(sub.expiresAt);
              const isExpiringSoon =
                isActive && days !== null && days >= 0 && days <= 14;

              return (
                <div
                  key={sub.id}
                  className={`bg-white border rounded-xl p-5 shadow-sm ${
                    isActive ? "border-[#F1F5F9]" : "border-[#F1F5F9] opacity-70"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Package name + status */}
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <p className="text-base font-bold text-[#0B1C30]">
                          {sub.packageName ?? "Package"}
                        </p>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            sub.status === "ACTIVE"
                              ? "bg-[#DCFCE7] text-[#166534]"
                              : sub.status === "EXPIRED"
                              ? "bg-[#F1F5F9] text-[#64748B]"
                              : "bg-[#FFDAD6] text-[#93000A]"
                          }`}
                        >
                          {sub.status}
                        </span>
                        {isExpiringSoon && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E]">
                            Expires in {days} day{days === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>

                      {/* Credits progress bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-[#94A3B8]">
                            Credits used
                          </span>
                          <span className="text-xs font-semibold text-[#0B1C30]">
                            {sub.creditsUsed} / {totalCredits}
                          </span>
                        </div>
                        <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              creditPercent <= 20
                                ? "bg-[#93000A]"
                                : creditPercent <= 50
                                ? "bg-[#F59E0B]"
                                : "bg-[#0F766E]"
                            }`}
                            style={{ width: `${100 - creditPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#0F766E] font-semibold mt-2">
                          {sub.creditsRemaining} credit
                          {sub.creditsRemaining === 1 ? "" : "s"} remaining
                        </p>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-4 text-xs text-[#94A3B8] flex-wrap">
                        <span>
                          Activated: {formatDate(sub.activatedAt)}
                        </span>
                        <span>
                          Expires: {formatDate(sub.expiresAt)}
                        </span>
                      </div>
                    </div>

                    {/* Cancel button */}
                    {isActive && (
                      <button
                        onClick={() => openCancelModal(sub)}
                        className="text-xs font-semibold text-[#93000A] hover:underline self-start flex-shrink-0"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="bg-gray-100 text-[#3D4946] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-[#3D4946]">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className="bg-[#00685C] text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-[#008375] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* ── Cancel Subscription Modal ───────────────────────────────────── */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowCancelModal(false)}
              className="text-sm font-semibold text-[#3D4946] px-4 py-2 rounded-lg hover:bg-[#F8FAFC]"
            >
              Keep Subscription
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelSubscription.isPending}
              className="bg-[#93000A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#BA1A1A] disabled:opacity-50"
            >
              {cancelSubscription.isPending
                ? "Cancelling…"
                : "Cancel Subscription"}
            </button>
          </>
        }
      >
        {cancelTarget && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#FFDAD6] border border-[#FCA5A5] rounded-lg p-4">
              <p className="text-sm font-bold text-[#93000A] mb-1">
                This cannot be undone
              </p>
              <p className="text-xs text-[#3D4946]">
                Your remaining{" "}
                <strong>
                  {cancelTarget.creditsRemaining} credit
                  {cancelTarget.creditsRemaining === 1 ? "" : "s"}
                </strong>{" "}
                will no longer be usable. Refunds are not processed
                automatically — please contact the clinic for any refund
                requests.
              </p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Package</span>
                <span className="font-semibold text-[#0B1C30]">
                  {cancelTarget.packageName ?? "—"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}