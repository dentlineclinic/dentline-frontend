"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import {
  usePilatesInstructorAccounts,
  useCreatePilatesInstructorAccount,
} from "@/hooks/usePilates";
import type { PilatesInstructor } from "@/services/pilatesService";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminPilatesInstructorsPage() {
  const [page, setPage] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newCertifications, setNewCertifications] = useState("");

  const { data, isLoading, error: queryError } =
    usePilatesInstructorAccounts(page, DEFAULT_PAGE_SIZE);

  const instructors: PilatesInstructor[] = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const currentPage = data?.data?.number ?? 0;
  const totalElements = data?.data?.totalElements ?? instructors.length;
  const activeOnPage = instructors.filter((i) => i.status === "ACTIVE").length;

  const createInstructor = useCreatePilatesInstructorAccount();

  const error = queryError
    ? typeof queryError === "string"
      ? queryError
      : (queryError as Error).message || "Failed to load instructors."
    : null;

  const openCreateModal = () => {
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewBio("");
    setNewCertifications("");
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error("Name is required");
    if (!newEmail.trim()) return toast.error("Email is required");
    if (!EMAIL_RE.test(newEmail.trim()))
      return toast.error("Enter a valid email address");
    if (!newPassword.trim() || newPassword.length < 8)
      return toast.error("Password must be at least 8 characters");

    try {
      await createInstructor.mutateAsync({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        bio: newBio.trim() || undefined,
        certifications: newCertifications.trim() || undefined,
      });
      toast.success("Instructor account created");
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create instructor");
    }
  };

  const goToPreviousPage = () => setPage((c) => Math.max(c - 1, 0));
  const goToNextPage = () => setPage((c) => Math.min(c + 1, totalPages - 1));

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Pilates Instructors"
        subtitle={`${totalElements} instructor${
          totalElements === 1 ? "" : "s"
        } · ${activeOnPage} active on this page`}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-[#3D4946]">
            Instructors teach classes. Each one gets a login account.
          </p>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#008375] transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Instructor
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
                  {[
                    "NAME",
                    "EMAIL",
                    "BIO",
                    "CERTIFICATIONS",
                    "STATUS",
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
                ) : instructors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-[#94A3B8]"
                    >
                      No instructors yet. Click "New Instructor" to add one.
                    </td>
                  </tr>
                ) : (
                  instructors.map((instructor) => {
                    const isActive = instructor.status === "ACTIVE";
                    return (
                      <tr
                        key={instructor.id}
                        className="border-t border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#CCFBF1] text-[#0F766E] text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {instructor.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <p className="text-sm font-semibold text-[#0B1C30]">
                              {instructor.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3D4946]">
                          {instructor.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3D4946] max-w-[200px] truncate">
                          {instructor.bio || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3D4946] max-w-[200px] truncate">
                          {instructor.certifications || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              isActive
                                ? "bg-[#DCFCE7] text-[#166534]"
                                : "bg-[#F1F5F9] text-[#64748B]"
                            }`}
                          >
                            {isActive ? "Active" : "Suspended"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8]">
          Editing and suspending instructors from this page will be enabled once
          the account-management endpoints are available.
        </p>

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

      {/* ── Create Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Instructor"
        subtitle="Creates a login account for the instructor"
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
              onClick={handleCreate}
              disabled={createInstructor.isPending}
              className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-50"
            >
              {createInstructor.isPending ? "Creating…" : "Create Instructor"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sarah Johnson"
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="sarah@dentlineclinic.com"
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            />
          </Field>
          <Field
            label="Temporary Password"
            required
            hint="The instructor will be prompted to change this on first login."
          >
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            />
          </Field>
          <Field label="Bio">
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              rows={2}
              placeholder="Short professional bio"
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] resize-none"
            />
          </Field>
          <Field label="Certifications">
            <input
              value={newCertifications}
              onChange={(e) => setNewCertifications(e.target.value)}
              placeholder="e.g. BASI, STOTT"
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

// ── Small helper for consistent labels ────────────────────────────────────
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
        {label} {required && <span className="text-[#93000A]">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#94A3B8] mt-1">{hint}</p>}
    </div>
  );
}