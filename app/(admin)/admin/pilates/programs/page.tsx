"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  useAllPrograms,
  useActivePrograms,
  useCreateProgram,
  useUpdateProgram,
  useDeactivateProgram,
} from "@/hooks/usePilates";
import { formatDate } from "@/types";
import type { PilatesProgram } from "@/services/pilatesService";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 10;

export default function AdminPilatesProgramsPage() {
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PilatesProgram | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Queries
  const { data, isLoading, error: queryError } = useAllPrograms(page, DEFAULT_PAGE_SIZE);
  const { data: activeData } = useActivePrograms();

  const programs = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const currentPage = data?.data?.number ?? 0;
  const totalElements = data?.data?.totalElements ?? programs.length;
  const activeCount = activeData?.data?.length ?? 0;

  // Mutations
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const deactivateProgram = useDeactivateProgram();

  const error = queryError
    ? typeof queryError === "string"
      ? queryError
      : (queryError as Error).message || "Failed to load programs."
    : null;

  const openCreateModal = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setDurationWeeks("");
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (program: PilatesProgram) => {
    setEditing(program);
    setName(program.name);
    setDescription(program.description ?? "");
    setDurationWeeks(program.durationWeeks?.toString() ?? "");
    setIsActive(program.isActive);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Program name is required");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      durationWeeks: durationWeeks ? parseInt(durationWeeks, 10) : undefined,
      isActive,
    };

    try {
      if (editing) {
        await updateProgram.mutateAsync({ id: editing.id, payload });
        toast.success("Program updated");
      } else {
        await createProgram.mutateAsync(payload);
        toast.success("Program created");
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save program");
    }
  };

  const handleDeactivate = async (id: string, programName: string) => {
    if (!confirm(`Deactivate "${programName}"? Existing classes will remain but no new sessions can be generated.`)) return;
    try {
      await deactivateProgram.mutateAsync(id);
      toast.success("Program deactivated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to deactivate program");
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
        title="Pilates Programs"
        subtitle={`${totalElements} program${totalElements === 1 ? "" : "s"} · ${activeCount} active`}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm text-[#3D4946]">
              Programs group related classes. E.g. "Core Strength — 8 weeks".
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#008375] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Program
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
            <table className="w-full min-w-[820px]">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  {["NAME", "DURATION", "STATUS", "CREATED", "ACTIONS"].map((h) => (
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
                      {[...Array(5)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : programs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-[#94A3B8]"
                    >
                      No programs yet. Click "New Program" to create one.
                    </td>
                  </tr>
                ) : (
                  programs.map((program) => (
                    <tr
                      key={program.id}
                      className="border-t border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-[#0B1C30]">
                          {program.name}
                        </p>
                        {program.description && (
                          <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">
                            {program.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {program.durationWeeks
                          ? `${program.durationWeeks} weeks`
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            program.isActive
                              ? "bg-[#DCFCE7] text-[#166534]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {program.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {formatDate(program.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(program)}
                            className="text-sm font-semibold text-[#00685C] hover:underline"
                          >
                            Edit
                          </button>
                          {program.isActive && (
                            <button
                              onClick={() => handleDeactivate(program.id, program.name)}
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
        title={editing ? "Edit Program" : "New Program"}
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
              disabled={createProgram.isPending || updateProgram.isPending}
              className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-50"
            >
              {createProgram.isPending || updateProgram.isPending
                ? "Saving…"
                : editing
                ? "Save Changes"
                : "Create Program"}
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
              placeholder="e.g. Core Strength"
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
              rows={3}
              placeholder="Brief description of the program..."
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
              Duration (weeks)
            </label>
            <input
              type="number"
              min="1"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(e.target.value)}
              placeholder="e.g. 8"
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
              Active (available for new classes)
            </span>
          </label>
        </div>
      </Modal>
    </div>
  );
}