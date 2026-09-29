"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  useAllPackages,
  useActivePackages,
  usePurchaseSubscription,
  useCancelSubscription,
} from "@/hooks/usePilates";
import { fetchPatients } from "@/services/patientService";
import type {
  Subscription,
  PilatesPackage,
} from "@/services/pilatesService";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 10;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

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

type PatientOption = {
  patientId: string;
  userId: string | null;
  name: string;
  email: string;
  phoneNumber: string;
};

export default function AdminPilatesSubscriptionsPage() {
  // Not using a dedicated "all subscriptions" query since the backend only
  // exposes subscriptions per-patient. For a full listing, we require the
  // admin to pick a patient, OR we paginate by patient. For v1, the main
  // action is "Purchase Subscription". Historical viewing is done by
  // selecting a patient from the search box.
  //
  // For a full admin view, we'll use per-patient filtering. If the backend
  // later exposes GET /api/pilates/subscriptions/all, swap this.
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PatientOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Purchase modal
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasePackageId, setPurchasePackageId] = useState("");

  // Cancel modal
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Packages for purchase dropdown
  const { data: packagesData } = useActivePackages();
  const packages: PilatesPackage[] = packagesData?.data ?? [];

  // Mutations
  const purchaseSubscription = usePurchaseSubscription();
  const cancelSubscription = useCancelSubscription();

  // ── Patient search (debounced) ─────────────────────────────────────────

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetchPatients(0, 10, term);
        const mapped: PatientOption[] = (res.data?.content ?? []).map(
          (p: any) => ({
            patientId: p.id ?? p.patientId,
            userId: p.userId ?? null,
            name: p.fullName ?? p.name ?? "Unknown",
            email: p.email ?? "—",
            phoneNumber: p.phoneNumber ?? "—",
          })
        );
        setSearchResults(mapped);
      } catch (err) {
        console.error("Failed to search patients:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const selectPatient = async (patient: PatientOption) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    setSearchTerm("");
    await loadSubscriptionsForPatient(patient.patientId);
  };

  const loadSubscriptionsForPatient = async (patientId: string) => {
    setLoadingSubs(true);
    try {
      // The hook-based approach for by-patient is defined but we need it
      // in a plain fetch here for flexibility. Use api directly.
      const api = (await import("@/lib/axios")).default;
      const res = await api.get(`/pilates/subscriptions/patient/${patientId}`, {
        params: { page: 0, size: 100 },
      });
      setSubscriptions(res.data?.data?.content ?? []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load subscriptions");
      setSubscriptions([]);
    } finally {
      setLoadingSubs(false);
    }
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    setSubscriptions([]);
  };

  // ── Purchase ────────────────────────────────────────────────────────────

  const openPurchaseModal = () => {
    if (!selectedPatient) {
      toast.error("Select a patient first");
      return;
    }
    setPurchasePackageId(packages[0]?.id ?? "");
    setShowPurchaseModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedPatient) return;
    if (!purchasePackageId) {
      toast.error("Select a package");
      return;
    }
    try {
      await purchaseSubscription.mutateAsync({
        patientId: selectedPatient.patientId,
        packageId: purchasePackageId,
      });
      toast.success("Subscription purchased");
      setShowPurchaseModal(false);
      await loadSubscriptionsForPatient(selectedPatient.patientId);
    } catch (err: any) {
      toast.error(err?.message || "Failed to purchase subscription");
    }
  };

  // ── Cancel ──────────────────────────────────────────────────────────────

  const openCancelModal = (sub: Subscription) => {
    setCancelTarget(sub);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelSubscription.mutateAsync(cancelTarget.id);
      toast.success("Subscription cancelled");
      setShowCancelModal(false);
      setCancelTarget(null);
      if (selectedPatient) {
        await loadSubscriptionsForPatient(selectedPatient.patientId);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel subscription");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  const selectedPackage = packages.find((p) => p.id === purchasePackageId);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Pilates Subscriptions"
        subtitle="Purchase and manage patient subscriptions"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Patient selector */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-3">
            Select a Patient
          </p>

          {!selectedPatient ? (
            <div className="relative">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-2.5 pl-10 text-sm text-[#3D4946] outline-none focus:border-[#00685C]"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8]">
                  Searching…
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.patientId}
                      onClick={() => selectPatient(p)}
                      className="w-full text-left px-4 py-3 hover:bg-[#F8FAFC] border-b border-[#F1F5F9] last:border-b-0"
                    >
                      <p className="text-sm font-semibold text-[#0B1C30]">
                        {p.name}
                      </p>
                      <p className="text-xs text-[#94A3B8]">
                        {p.email} · {p.phoneNumber}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {searchTerm.trim().length >= 2 &&
                !searching &&
                searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-10 px-4 py-3">
                    <p className="text-xs text-[#94A3B8]">
                      No patients found.
                    </p>
                  </div>
                )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#CCFBF1] text-[#0F766E] text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {selectedPatient.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0B1C30]">
                    {selectedPatient.name}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    {selectedPatient.email} · {selectedPatient.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openPurchaseModal}
                  className="flex items-center gap-2 bg-[#00685C] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#008375]"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Purchase Subscription
                </button>
                <button
                  onClick={clearSelectedPatient}
                  className="text-xs font-semibold text-[#3D4946] px-3 py-2 rounded-lg hover:bg-[#F8FAFC]"
                >
                  Change Patient
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Subscriptions for selected patient */}
        {selectedPatient && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#0B1C30]">
                Subscriptions for {selectedPatient.name}
              </h3>
              <span className="text-xs text-[#94A3B8]">
                {subscriptions.length} record
                {subscriptions.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    <tr>
                      {[
                        "PACKAGE",
                        "CREDITS",
                        "STATUS",
                        "ACTIVATED",
                        "EXPIRES",
                        "ACTIONS",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingSubs ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="border-t border-[#F8FAFC]">
                          {[...Array(6)].map((__, j) => (
                            <td key={j} className="px-6 py-4">
                              <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : subscriptions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-sm text-[#94A3B8]"
                        >
                          No subscriptions for this patient yet.
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((sub) => (
                        <tr
                          key={sub.id}
                          className="border-t border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-[#0B1C30]">
                            {sub.packageName ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#3D4946]">
                            {sub.creditsRemaining} of{" "}
                            {sub.creditsRemaining + sub.creditsUsed} remaining
                          </td>
                          <td className="px-6 py-4">
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
                          </td>
                          <td className="px-6 py-4 text-sm text-[#3D4946]">
                            {formatDate(sub.activatedAt)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#3D4946]">
                            {formatDate(sub.expiresAt)}
                          </td>
                          <td className="px-6 py-4">
                            {sub.status === "ACTIVE" ? (
                              <button
                                onClick={() => openCancelModal(sub)}
                                className="text-sm font-semibold text-[#93000A] hover:underline"
                              >
                                Cancel
                              </button>
                            ) : (
                              <span className="text-sm text-[#94A3B8]">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!selectedPatient && (
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#0B1C30] mb-1">
              Select a patient to view or purchase subscriptions
            </p>
            <p className="text-xs text-[#94A3B8]">
              Use the search box above to find a patient.
            </p>
          </div>
        )}
      </main>

      {/* ── Purchase Subscription Modal ──────────────────────────────────── */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Purchase Subscription"
        subtitle={selectedPatient?.name}
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="text-sm font-semibold text-[#3D4946] px-4 py-2 rounded-lg hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={purchaseSubscription.isPending}
              className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-50"
            >
              {purchaseSubscription.isPending ? "Purchasing…" : "Confirm Purchase"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
              Package <span className="text-[#93000A]">*</span>
            </label>
            <select
              value={purchasePackageId}
              onChange={(e) => setPurchasePackageId(e.target.value)}
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            >
              <option value="">Select a package…</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — {formatCurrency(pkg.price)}
                </option>
              ))}
            </select>
          </div>

          {selectedPackage && (
            <div className="bg-[#F0FDFA] border border-[#D1FAE5] rounded-lg p-4">
              <p className="text-xs font-bold text-[#0F766E] uppercase tracking-widest mb-2">
                What the patient gets
              </p>
              <ul className="text-sm text-[#3D4946] flex flex-col gap-1">
                <li>
                  ✓{" "}
                  <strong className="text-[#0B1C30]">
                    {selectedPackage.creditCount} class credit
                    {selectedPackage.creditCount === 1 ? "" : "s"}
                  </strong>
                </li>
                <li>
                  ✓ Valid for{" "}
                  <strong className="text-[#0B1C30]">
                    {selectedPackage.validityDays} days
                  </strong>{" "}
                  from today
                </li>
                <li>
                  ✓ Amount to charge:{" "}
                  <strong className="text-[#0B1C30]">
                    {formatCurrency(selectedPackage.price)}
                  </strong>
                </li>
              </ul>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Cancel Subscription Modal ────────────────────────────────────── */}
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
              Keep
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelSubscription.isPending}
              className="bg-[#93000A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#BA1A1A] disabled:opacity-50"
            >
              {cancelSubscription.isPending ? "Cancelling…" : "Cancel Subscription"}
            </button>
          </>
        }
      >
        {cancelTarget && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#FFDAD6] border border-[#FCA5A5] rounded-lg p-4">
              <p className="text-sm font-bold text-[#93000A] mb-1">
                This will cancel the subscription
              </p>
              <p className="text-xs text-[#3D4946]">
                The patient will have{" "}
                <strong>{cancelTarget.creditsRemaining} unused credits</strong>{" "}
                that will no longer be usable.
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