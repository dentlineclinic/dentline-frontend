"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import {
  usePublicActivePackages,
  useMySubscriptions,
  useInitiateCheckout,
  usePollCheckoutStatus,
  useCancelSubscription,
} from "@/hooks/usePilates";
import type { Subscription, PilatesPackage } from "@/services/pilatesService";

export const dynamic = "force-dynamic";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    amount
  );

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-[#DCFCE7] text-[#166534]",
  EXPIRED: "bg-[#F1F5F9] text-[#64748B]",
  CANCELLED: "bg-[#FFDAD6] text-[#93000A]",
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PatientSubscriptionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // txRef is set in the URL after Flutterwave redirects back
  const txRefFromUrl = searchParams.get("tx_ref") ?? searchParams.get("txRef");
  const [activeTxRef, setActiveTxRef] = useState<string | null>(txRefFromUrl);
  const [page, setPage] = useState(0);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data: packagesData, isLoading: loadingPackages } =
    usePublicActivePackages();
  const packages: PilatesPackage[] = packagesData?.data ?? [];

  const {
    data: subsData,
    isLoading: loadingSubs,
    refetch: refetchSubs,
  } = useMySubscriptions(page, 10);
  const subscriptions: Subscription[] = subsData?.data?.content ?? [];
  const totalPages = subsData?.data?.totalPages ?? 1;
  const currentPage = subsData?.data?.number ?? 0;

  const initiateCheckout = useInitiateCheckout();
  const cancelSubscription = useCancelSubscription();

  // ── Poll checkout status after returning from Flutterwave ──────────────────
  const { data: checkoutStatus } = usePollCheckoutStatus(activeTxRef);

  useEffect(() => {
    if (!checkoutStatus) return;
    if (checkoutStatus.status === "SUCCESSFUL") {
      toast.success(
        `✓ Payment confirmed! ${checkoutStatus.credits} credits added.`
      );
      setActiveTxRef(null);
      // Strip query params from URL without reloading
      router.replace("/patient/pilates/subscriptions");
      refetchSubs();
    } else if (
      checkoutStatus.status === "FAILED" ||
      checkoutStatus.status === "CANCELLED"
    ) {
      toast.error(
        `Payment ${checkoutStatus.status.toLowerCase()}. Please try again.`
      );
      setActiveTxRef(null);
      router.replace("/patient/pilates/subscriptions");
    }
  }, [checkoutStatus, refetchSubs, router]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleBuyPackage = async (pkg: PilatesPackage) => {
    try {
      const res = await initiateCheckout.mutateAsync({ packageId: pkg.id });
      // Open the Flutterwave-hosted payment page
      window.location.href = res.checkoutUrl;
    } catch (err: any) {
      toast.error(err?.message || "Failed to start checkout");
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelTarget) return;
    try {
      await cancelSubscription.mutateAsync(cancelTarget.id);
      toast.success("Subscription cancelled");
      setShowCancelModal(false);
      setCancelTarget(null);
      refetchSubs();
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel subscription");
    }
  };

  const openCancelModal = (sub: Subscription) => {
    setCancelTarget(sub);
    setShowCancelModal(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Pilates Subscriptions"
        subtitle="Buy a credit pack to book sessions"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-8">
        {/* ── Payment pending banner ──────────────────────────────────── */}
        {activeTxRef && checkoutStatus?.status === "PENDING" && (
          <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-xl p-5 flex items-center gap-4">
            <div className="w-6 h-6 border-4 border-[#92400E] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#92400E]">
                Confirming your payment…
              </p>
              <p className="text-xs text-[#78350F] mt-0.5">
                This usually takes a few seconds. Please don't close this page.
              </p>
            </div>
          </div>
        )}

        {/* ── Available packages ──────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-[#0B1C30] mb-4">
            Available Packages
          </h2>

          {loadingPackages ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-[#F1F5F9] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 text-center">
              <p className="text-sm text-[#94A3B8]">
                No packages available right now. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-4 hover:border-[#00685C] transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-base font-bold text-[#0B1C30]">
                      {pkg.name}
                    </p>
                    {pkg.description && (
                      <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">
                        {pkg.description}
                      </p>
                    )}
                    <div className="mt-4 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#3D4946]">Credits</span>
                        <span className="font-bold text-[#0B1C30]">
                          {pkg.creditCount} class
                          {pkg.creditCount === 1 ? "" : "es"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#3D4946]">Valid for</span>
                        <span className="font-bold text-[#0B1C30]">
                          {pkg.validityDays} days
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#F1F5F9]">
                    <p className="text-xl font-bold text-[#00685C]">
                      {formatCurrency(pkg.price)}
                    </p>
                    <button
                      onClick={() => handleBuyPackage(pkg)}
                      disabled={initiateCheckout.isPending}
                      className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {initiateCheckout.isPending ? "Loading…" : "Buy Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── My subscriptions ────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-[#0B1C30] mb-4">
            My Subscriptions
          </h2>

          {loadingSubs ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-[#F1F5F9] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 text-center">
              <p className="text-sm font-semibold text-[#0B1C30] mb-1">
                No subscriptions yet
              </p>
              <p className="text-xs text-[#94A3B8]">
                Buy a package above to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {subscriptions.map((sub) => {
                const isActive = sub.status === "ACTIVE";
                return (
                  <div
                    key={sub.id}
                    className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    {/* Credit bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-bold text-[#0B1C30]">
                          {sub.packageName ?? "Package"}
                        </p>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            STATUS_STYLES[sub.status] ?? "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#94A3B8] flex-wrap">
                        <span>
                          {sub.creditsRemaining} credit
                          {sub.creditsRemaining === 1 ? "" : "s"} remaining
                        </span>
                        <span>{sub.creditsUsed} used</span>
                        <span>Expires {formatDate(sub.expiresAt)}</span>
                      </div>

                      {/* Progress bar */}
                      {isActive && (
                        <div className="mt-3 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00685C] rounded-full transition-all"
                            style={{
                              width: `${
                                sub.creditsRemaining + sub.creditsUsed > 0
                                  ? (sub.creditsRemaining /
                                      (sub.creditsRemaining + sub.creditsUsed)) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <button
                        onClick={() => openCancelModal(sub)}
                        className="text-xs font-semibold text-[#93000A] hover:underline whitespace-nowrap flex-shrink-0"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loadingSubs && totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
                className="bg-gray-100 text-[#3D4946] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-[#3D4946]">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(p + 1, totalPages - 1))
                }
                disabled={currentPage >= totalPages - 1}
                className="bg-[#00685C] text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-[#008375] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ── Cancel subscription modal ────────────────────────────────── */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
        subtitle="This action cannot be undone"
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
              onClick={handleCancelSubscription}
              disabled={cancelSubscription.isPending}
              className="bg-[#93000A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-800 disabled:opacity-50"
            >
              {cancelSubscription.isPending ? "Cancelling…" : "Yes, Cancel"}
            </button>
          </>
        }
      >
        <p className="text-sm text-[#3D4946]">
          Are you sure you want to cancel{" "}
          <strong>{cancelTarget?.packageName}</strong>? Your remaining{" "}
          <strong>{cancelTarget?.creditsRemaining} credit(s)</strong> will be
          lost.
        </p>
      </Modal>
    </div>
  );
}
