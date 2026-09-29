"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import {
  useAllPackages,
  useActivePackages,
  useCreatePackage,
  useUpdatePackage,
  useDeactivatePackage,
} from "@/hooks/usePilates";
import type { PilatesPackage } from "@/services/pilatesService";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 10;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

export default function AdminPilatesPackagesPage() {
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PilatesPackage | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creditCount, setCreditCount] = useState("");
  const [price, setPrice] = useState("");
  const [validityDays, setValidityDays] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Queries
  const { data, isLoading, error: queryError } = useAllPackages(page, DEFAULT_PAGE_SIZE);
  const { data: activeData } = useActivePackages();

  const packages = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const currentPage = data?.data?.number ?? 0;
  const totalElements = data?.data?.totalElements ?? packages.length;
  const activeCount = activeData?.data?.length ?? 0;

  // Mutations
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deactivatePackage = useDeactivatePackage();

  const error = queryError
    ? typeof queryError === "string"
      ? queryError
      : (queryError as Error).message || "Failed to load packages."
    : null;

  const openCreateModal = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setCreditCount("");
    setPrice("");
    setValidityDays("");
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (pkg: PilatesPackage) => {
    setEditing(pkg);
    setName(pkg.name);
    setDescription(pkg.description ?? "");
    setCreditCount(pkg.creditCount.toString());
    setPrice(pkg.price.toString());
    setValidityDays(pkg.validityDays.toString());
    setIsActive(pkg.isActive);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Package name is required");
      return;
    }
    const credit = parseInt(creditCount, 10);
    if (isNaN(credit) || credit <= 0) {
      toast.error("Credit count must be a positive number");
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Price must be zero or greater");
      return;
    }
    const validity = parseInt(validityDays, 10);
    if (isNaN(validity) || validity <= 0) {
      toast.error("Validity days must be a positive number");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      creditCount: credit,
      price: priceNum,
      validityDays: validity,
      isActive,
    };

    try {
      if (editing) {
        await updatePackage.mutateAsync({ id: editing.id, payload });
        toast.success("Package updated");
      } else {
        await createPackage.mutateAsync(payload);
        toast.success("Package created");
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save package");
    }
  };

  const handleDeactivate = async (id: string, pkgName: string) => {
    if (!confirm(`Deactivate "${pkgName}"? Patients will no longer be able to purchase it.`)) return;
    try {
      await deactivatePackage.mutateAsync(id);
      toast.success("Package deactivated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to deactivate package");
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
        title="Pilates Packages"
        subtitle={`${totalElements} package${totalElements === 1 ? "" : "s"} · ${activeCount} active`}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-[#3D4946]">
            Packages are credit bundles. E.g. "10 classes for ₦50,000, valid 90 days".
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
            <table className="w-full min-w-[900px]">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  {["NAME", "CREDITS", "PRICE", "VALIDITY", "STATUS", "ACTIONS"].map((h) => (
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
                  [...Array(5)].map((_, i) => (
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
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-[#94A3B8]"
                    >
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
                        <p className="text-sm font-semibold text-[#0B1C30]">
                          {pkg.name}
                        </p>
                        {pkg.description && (
                          <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">
                            {pkg.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {pkg.creditCount} credit{pkg.creditCount === 1 ? "" : "s"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#0B1C30]">
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
                              onClick={() => handleDeactivate(pkg.id, pkg.name)}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Package" : "New Package"}
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              className="text-sm font-semibold text-[#3D4946] px-4 py-2 rounded-lg hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createPackage.isPending || updatePackage.isPending}
              className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-50"
            >
              {createPackage.isPending || updatePackage.isPending
                ? "Saving…"
                : editing
                ? "Save Changes"
                : "Create Package"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
              Name <span className="text-[#93000A]">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 10-Class Pack"
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of the package..."
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
                Credits <span className="text-[#93000A]">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={creditCount}
                onChange={(e) => setCreditCount(e.target.value)}
                placeholder="10"
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
                Validity (days) <span className="text-[#93000A]">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                placeholder="90"
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
              Price (₦) <span className="text-[#93000A]">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="50000"
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#00685C] rounded border-[#E2E8F0] focus:ring-[#00685C]"
            />
            <span className="text-sm font-semibold text-[#0B1C30]">
              Active (patients can purchase this package)
            </span>
          </label>
        </div>
      </Modal>
    </div>
  );
}