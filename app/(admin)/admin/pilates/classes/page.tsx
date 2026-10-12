"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import {
  useAllClasses,
  useCreateClass,
  useUpdateClass,
  useDeactivateClass,
  useGenerateClassSessions,
  useActivePrograms,
  useActiveInstructors,
} from "@/hooks/usePilates";
import type {
  PilatesClass,
  CreatePilatesClassRequest,
  GenerateSessionsRequest,
} from "@/services/pilatesService";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 10;

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

const emptyClassForm = (): Omit<CreatePilatesClassRequest, "programId" | "instructorId"> & {
  programId: string;
  instructorId: string;
} => ({
  programId: "",
  instructorId: "",
  name: "",
  description: "",
  dayOfWeek: 1,
  startTime: "09:00",
  durationMinutes: 60,
  defaultCapacity: 10,
  isActive: true,
});

export default function AdminPilatesClassesPage() {
  const [page, setPage] = useState(0);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showClassModal, setShowClassModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PilatesClass | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<PilatesClass | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [generateTarget, setGenerateTarget] = useState<PilatesClass | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [classForm, setClassForm] = useState(emptyClassForm());
  const [genForm, setGenForm] = useState<{ startDate: string; endDate: string }>({
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
  });

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading, error: queryError } = useAllClasses(page, DEFAULT_PAGE_SIZE);
  const classes: PilatesClass[] = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const currentPage = data?.data?.number ?? 0;
  const totalElements = data?.data?.totalElements ?? 0;

  const { data: programsData } = useActivePrograms();
  const programs = programsData?.data ?? [];

  const { data: instructorsData } = useActiveInstructors();
  const instructors = instructorsData?.data ?? [];

  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deactivateClass = useDeactivateClass();
  const generateSessions = useGenerateClassSessions();

  const error = queryError ? (queryError as Error).message || "Failed to load classes." : null;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setClassForm(emptyClassForm());
    setEditTarget(null);
    setShowClassModal(true);
  };

  const openEditModal = (cls: PilatesClass) => {
    setClassForm({
      programId: cls.programId,
      instructorId: cls.instructorId,
      name: cls.name,
      description: cls.description ?? "",
      dayOfWeek: cls.dayOfWeek,
      startTime: cls.startTime.slice(0, 5), // HH:mm
      durationMinutes: cls.durationMinutes,
      defaultCapacity: cls.defaultCapacity,
      isActive: cls.isActive,
    });
    setEditTarget(cls);
    setShowClassModal(true);
  };

  const validateClassForm = (): boolean => {
    if (!classForm.name.trim()) { toast.error("Class name is required"); return false; }
    if (!classForm.programId) { toast.error("Program is required"); return false; }
    if (!classForm.instructorId) { toast.error("Instructor is required"); return false; }
    if (classForm.durationMinutes < 1) { toast.error("Duration must be at least 1 minute"); return false; }
    if (classForm.defaultCapacity < 1) { toast.error("Capacity must be at least 1"); return false; }
    return true;
  };

  const handleSaveClass = async () => {
    if (!validateClassForm()) return;
    // Ensure time has seconds for backend: "09:00" → "09:00:00"
    const payload: CreatePilatesClassRequest = {
      ...classForm,
      startTime: classForm.startTime.length === 5 ? classForm.startTime + ":00" : classForm.startTime,
    };
    try {
      if (editTarget) {
        await updateClass.mutateAsync({ id: editTarget.id, payload });
        toast.success("Class updated");
      } else {
        await createClass.mutateAsync(payload);
        toast.success("Class created");
      }
      setShowClassModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save class");
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateClass.mutateAsync(deactivateTarget.id);
      toast.success("Class deactivated");
      setShowDeactivateModal(false);
      setDeactivateTarget(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to deactivate class");
    }
  };

  const handleGenerateSessions = async () => {
    if (!generateTarget) return;
    if (!genForm.startDate) { toast.error("Start date is required"); return; }
    if (!genForm.endDate) { toast.error("End date is required"); return; }
    if (genForm.endDate < genForm.startDate) {
      toast.error("End date must be after start date");
      return;
    }
    try {
      const res = await generateSessions.mutateAsync({
        classId: generateTarget.id,
        payload: {
          classId: generateTarget.id,
          startDate: genForm.startDate,
          endDate: genForm.endDate,
        } as GenerateSessionsRequest,
      });
      const count = (res as any)?.data?.length ?? 0;
      toast.success(`${count} session${count === 1 ? "" : "s"} generated`);
      setShowGenerateModal(false);
      setGenerateTarget(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate sessions");
    }
  };

  const isClassPending = createClass.isPending || updateClass.isPending;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Pilates Classes"
        subtitle={`${totalElements} class${totalElements === 1 ? "" : "es"}`}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-[#3D4946]">
            Create classes then generate sessions for specific date ranges.
          </p>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#008375] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Class
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
                  {["CLASS", "PROGRAM", "INSTRUCTOR", "SCHEDULE", "CAPACITY", "STATUS", "ACTIONS"].map((h) => (
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
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#94A3B8]">
                      No classes yet. Click "New Class" to create one.
                    </td>
                  </tr>
                ) : (
                  classes.map((cls) => (
                    <tr
                      key={cls.id}
                      className="border-t border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-[#0B1C30]">{cls.name}</p>
                        {cls.description && (
                          <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">
                            {cls.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {cls.programName ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {cls.instructorName ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#0B1C30] font-medium">
                          {DAY_LABELS[cls.dayOfWeek] ?? `Day ${cls.dayOfWeek}`}
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                          {cls.startTime.slice(0, 5)} · {cls.durationMinutes}min
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {cls.defaultCapacity}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            cls.isActive
                              ? "bg-[#DCFCE7] text-[#166534]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {cls.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => openEditModal(cls)}
                            className="text-sm font-semibold text-[#00685C] hover:underline"
                          >
                            Edit
                          </button>
                          {cls.isActive && (
                            <>
                              <button
                                onClick={() => {
                                  setGenerateTarget(cls);
                                  setGenForm({
                                    startDate: new Date().toISOString().slice(0, 10),
                                    endDate: "",
                                  });
                                  setShowGenerateModal(true);
                                }}
                                className="text-sm font-semibold text-[#1E40AF] hover:underline"
                              >
                                Generate Sessions
                              </button>
                              <button
                                onClick={() => {
                                  setDeactivateTarget(cls);
                                  setShowDeactivateModal(true);
                                }}
                                className="text-sm font-semibold text-[#93000A] hover:underline"
                              >
                                Deactivate
                              </button>
                            </>
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

      {/* ── Create / Edit class modal ────────────────────────────────── */}
      <Modal
        isOpen={showClassModal}
        onClose={() => setShowClassModal(false)}
        title={editTarget ? "Edit Class" : "New Class"}
        subtitle={editTarget ? `Editing: ${editTarget.name}` : "Create a recurring Pilates class"}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowClassModal(false)}
              className="text-sm font-semibold text-[#3D4946] px-4 py-2 rounded-lg hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClass}
              disabled={isClassPending}
              className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-50"
            >
              {isClassPending ? "Saving…" : editTarget ? "Save Changes" : "Create Class"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Class Name" required>
            <input
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              placeholder="e.g. Morning Flow"
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={classForm.description}
              onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
              rows={2}
              placeholder="Optional description"
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] resize-none"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Program" required>
              <select
                value={classForm.programId}
                onChange={(e) => setClassForm({ ...classForm, programId: e.target.value })}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              >
                <option value="">Select program…</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Instructor" required>
              <select
                value={classForm.instructorId}
                onChange={(e) => setClassForm({ ...classForm, instructorId: e.target.value })}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              >
                <option value="">Select instructor…</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Day of Week" required>
              <select
                value={classForm.dayOfWeek}
                onChange={(e) => setClassForm({ ...classForm, dayOfWeek: Number(e.target.value) })}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              >
                {Object.entries(DAY_LABELS).map(([val, label]) => (
                  <option key={val} value={Number(val)}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label="Start Time" required>
              <input
                type="time"
                value={classForm.startTime}
                onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </Field>
            <Field label="Duration (min)" required>
              <input
                type="number"
                min={15}
                step={15}
                value={classForm.durationMinutes}
                onChange={(e) => setClassForm({ ...classForm, durationMinutes: Number(e.target.value) })}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </Field>
          </div>
          <Field label="Default Capacity" required>
            <input
              type="number"
              min={1}
              value={classForm.defaultCapacity}
              onChange={(e) => setClassForm({ ...classForm, defaultCapacity: Number(e.target.value) })}
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={classForm.isActive}
              onChange={(e) => setClassForm({ ...classForm, isActive: e.target.checked })}
              className="w-4 h-4 accent-[#00685C]"
            />
            <span className="text-sm font-semibold text-[#0B1C30]">Active</span>
            <span className="text-xs text-[#94A3B8]">(visible to patients)</span>
          </label>
        </div>
      </Modal>

      {/* ── Generate sessions modal ──────────────────────────────────── */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Sessions"
        subtitle={generateTarget ? `For: ${generateTarget.name}` : ""}
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowGenerateModal(false)}
              className="text-sm font-semibold text-[#3D4946] px-4 py-2 rounded-lg hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateSessions}
              disabled={generateSessions.isPending}
              className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-50"
            >
              {generateSessions.isPending ? "Generating…" : "Generate"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#3D4946]">
            Sessions will be created for every{" "}
            <strong>
              {generateTarget ? DAY_LABELS[generateTarget.dayOfWeek] : ""}
            </strong>{" "}
            between the two dates.
          </p>
          <Field label="Start Date" required>
            <input
              type="date"
              value={genForm.startDate}
              onChange={(e) => setGenForm({ ...genForm, startDate: e.target.value })}
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            />
          </Field>
          <Field label="End Date" required>
            <input
              type="date"
              value={genForm.endDate}
              min={genForm.startDate}
              onChange={(e) => setGenForm({ ...genForm, endDate: e.target.value })}
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
            />
          </Field>
        </div>
      </Modal>

      {/* ── Deactivate confirmation ──────────────────────────────────── */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate Class"
        subtitle="Patients will no longer see this class"
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
              disabled={deactivateClass.isPending}
              className="bg-[#93000A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-800 disabled:opacity-50"
            >
              {deactivateClass.isPending ? "Deactivating…" : "Deactivate"}
            </button>
          </>
        }
      >
        <p className="text-sm text-[#3D4946]">
          Deactivate <strong>{deactivateTarget?.name}</strong>? Existing
          scheduled sessions won't be affected.
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
