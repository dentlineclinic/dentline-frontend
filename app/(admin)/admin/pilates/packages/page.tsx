"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import {
  useAllPackages,
  useCreatePackage,
  useUpdatePackage,
  useDeactivatePackage,
} from "@/hooks/usePilates";
import type {
  PilatesPackage,
  CreatePilatesPackageRequest,
} from "@/services/pilatesService";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 10;

const emptyForm = (): CreatePilatesPackageRequest => ({
  name: "",
  description: "",
  creditCount: 5,
  price: 0,
  validityDays: 30,
  isActive: true,
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    amount
  );

export default function AdminPilatesPackagesPage() {
  const [page, setPage] = useState(0);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PilatesPackage | null>(null);
  const [deactivateTarget, setDeactivateTarget] =
    useState<PilatesPackage | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState<CreatePilatesPackageRequest>(emptyForm());

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading, error: queryError } = useAllPackages(page, DEFAULT_PAGE_SIZE);
  const packages: PilatesPackage[] = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const currentPage = data?.data?.number ?? 0;
  const totalElements = data?.data?.totalElements ?? 0;

  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deactivatePackage = useDeactivatePackage();

  const error = queryError ? (queryError as Error).message || "Failed to load packages." : null;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setForm(emptyForm());
    setEditTarget(null);
    setShowCreateModal(true);
  };

  const openEditModal = (pkg: PilatesPackage) => {
    setForm({
      name: pkg.name,
      description: pkg.description ?? "",
      creditCount: pkg.creditCount,
      price: pkg.price,
      validityDays: pkg.validityDays,
      isActive: pkg.isActive,
    });
    setEditTarget(pkg);
    setShowCreateModal(true);
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) { toast.error("Package name is required"); return false; }
    if (form.creditCount < 1) { toast.error("Credits must be at least 1"); return false; }
    if (form.price < 0) { toast.error("Price cannot be negative"); return false; }
    if (form.validityDays < 1) { toast.error("Validity must be at least 1 day"); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      if (editTarget) {
        await updatePackage.mutateAsync({ id: editTarget.id, payload: form });
        toast.success("Package updated");
      } else {
        await createPackage.mutateAsync(form);
        toast.success("Package created");
      }
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save package");
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivatePackage.mutateAsync(deactivateTarget.id);
      toast.success("Package deactivated");
      setShowDeactivateModal(false);
      setDeactivateTarget(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to deactivate package");
    }
  };

  const isPending = createPackage.isPending || updatePackage.isPending;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Pilates Packages"
        subtitle={`${totalElements} package${totalElements === 1 ? "" : "s"}`}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-[#3D4946]">
            Manage credit packs patients can purchase.
          </p>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#008375] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Package
          </button>
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  {["NAME", "CREDITS", "PRICE (NGN)", "VALIDITY", "STATUS", "ACTIONS"].map((h) => (
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
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-t border-[#F8FAFC]">
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : packages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#94A3B8]">
                      No packages yet. Click "New Package" to create one.
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr
                      key={pkg.id}
                      className="border-t border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-[#0B1C30]">{pkg.name}</p>
                        {pkg.description && (
                          <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">
                            {pkg.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946] font-semibold">
                        {pkg.creditCount}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#00685C]">
                        {formatCurrency(pkg.price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {pkg.validityDays} days
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            pkg.isActive
                              ? "bg-[#DCFCE7] text-[#166534]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {pkg.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(pkg)}
                            className="text-sm font-semibold text-[#00685C] hover:underline"
                          >
                            Edit
                          </button>
                          {pkg.isActive && (
                            <button
                              onClick={() => {
                                setDeactivateTarget(pkg);
                                setShowDeactivateModal(true);
                              }}
                              className="text-sm font-semibold text-[#93000A] hover:underline"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3">
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
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={currentPage >= totalPages - 1}
              className="bg-[#00685C] text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-[#008375] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* ── Create / Edit modal ──────────────────────────────────────── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editTarget ? "Edit Package" : "New Package"}
        subtitle={editTarget ? `Editing: ${editTarget.name}` : "Create a credit pack for patients"}
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-sm font-semibold text-[#3D4946] px-4 py-2 rounded-lg hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-50"
            >
              {isPending ? "Saving…" : editTarget ? "Save Changes" : "Create Package"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Package Name" required>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. 10-Class Pack"
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Optional description"
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] resize-none"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Credits" required>
              <input
                type="number"
                min={1}
                value={form.creditCount}
                onChange={(e) =>
                  setForm({ ...form, creditCount: Number(e.target.value) })
                }
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </Field>
            <Field label="Price (NGN)" required>
              <input
                type="number"
                min={0}
                step={100}
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </Field>
            <Field label="Validity (days)" required>
              <input
                type="number"
                min={1}
                value={form.validityDays}
                onChange={(e) =>
                  setForm({ ...form, validityDays: Number(e.target.value) })
                }
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-[#00685C]"
            />
            <span className="text-sm font-semibold text-[#0B1C30]">Active</span>
            <span className="text-xs text-[#94A3B8]">(visible to patients)</span>
          </label>
        </div>
      </Modal>

      {/* ── Deactivate confirmation ──────────────────────────────────── */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate Package"
        subtitle="Patients will no longer be able to purchase this"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowDeactivateModal(false)}
              className="text-sm font-semibold text-[#3D4946] px-4 py-2 rounded-lg hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeactivate}
              disabled={deactivatePackage.isPending}
              className="bg-[#93000A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-800 disabled:opacity-50"
            >
              {deactivatePackage.isPending ? "Deactivating…" : "Deactivate"}
            </button>
          </>
        }
      >
        <p className="text-sm text-[#3D4946]">
          Deactivate <strong>{deactivateTarget?.name}</strong>? Existing
          subscriptions won't be affected.
        </p>
      </Modal>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
        {label} {required && <span className="text-[#93000A]">*</span>}
      </label>
      {children}
    </div>
  );
}
