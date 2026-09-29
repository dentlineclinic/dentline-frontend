"use client";

import { useState } from "react";
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
import type { PilatesClass } from "@/services/pilatesService";

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

const formatTime = (time: string) => {
  // Backend sends "HH:mm:ss" — display as "HH:mm"
  return time?.slice(0, 5) ?? "—";
};

export default function AdminPilatesClassesPage() {
  const [page, setPage] = useState(0);

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PilatesClass | null>(null);

  // Form state
  const [programId, setProgramId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [defaultCapacity, setDefaultCapacity] = useState("12");
  const [isActive, setIsActive] = useState(true);

  // Generate sessions modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateClass, setGenerateClass] = useState<PilatesClass | null>(null);
  const [generateStartDate, setGenerateStartDate] = useState("");
  const [generateEndDate, setGenerateEndDate] = useState("");

  // Queries
  const { data, isLoading, error: queryError } = useAllClasses(page, DEFAULT_PAGE_SIZE);
  const { data: programsData } = useActivePrograms();
  const { data: instructorsData } = useActiveInstructors();

  const classes = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const currentPage = data?.data?.number ?? 0;
  const totalElements = data?.data?.totalElements ?? classes.length;

  const programs = programsData?.data ?? [];
  const instructors = instructorsData?.data ?? [];

  // Mutations
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deactivateClass = useDeactivateClass();
  const generateSessions = useGenerateClassSessions();

  const error = queryError
    ? typeof queryError === "string"
      ? queryError
      : (queryError as Error).message || "Failed to load classes."
    : null;

  const openCreateModal = () => {
    setEditing(null);
    setProgramId(programs[0]?.id ?? "");
    setInstructorId(instructors[0]?.id ?? "");
    setName("");
    setDescription("");
    setDayOfWeek("1");
    setStartTime("09:00");
    setDurationMinutes("60");
    setDefaultCapacity("12");
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (cls: PilatesClass) => {
    setEditing(cls);
    setProgramId(cls.programId);
    setInstructorId(cls.instructorId);
    setName(cls.name);
    setDescription(cls.description ?? "");
    setDayOfWeek(String(cls.dayOfWeek));
    setStartTime(cls.startTime?.slice(0, 5) ?? "09:00");
    setDurationMinutes(String(cls.durationMinutes));
    setDefaultCapacity(String(cls.defaultCapacity));
    setIsActive(cls.isActive);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!programId) {
      toast.error("Please select a program");
      return;
    }
    if (!instructorId) {
      toast.error("Please select an instructor");
      return;
    }
    if (!name.trim()) {
      toast.error("Class name is required");
      return;
    }
    if (!startTime) {
      toast.error("Start time is required");
      return;
    }

    const payload = {
      programId,
      instructorId,
      name: name.trim(),
      description: description.trim() || undefined,
      dayOfWeek: parseInt(dayOfWeek, 10),
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
      durationMinutes: parseInt(durationMinutes, 10),
      defaultCapacity: parseInt(defaultCapacity, 10),
      isActive,
    };

    try {
      if (editing) {
        await updateClass.mutateAsync({ id: editing.id, payload });
        toast.success("Class updated");
      } else {
        await createClass.mutateAsync(payload);
        toast.success("Class created");
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save class");
    }
  };

  const handleDeactivate = async (id: string, className: string) => {
    if (!confirm(`Deactivate "${className}"? Existing sessions remain but no new sessions can be generated.`)) return;
    try {
      await deactivateClass.mutateAsync(id);
      toast.success("Class deactivated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to deactivate class");
    }
  };

  const openGenerateModal = (cls: PilatesClass) => {
    setGenerateClass(cls);
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);
    setGenerateStartDate(today.toISOString().slice(0, 10));
    setGenerateEndDate(nextMonth.toISOString().slice(0, 10));
    setShowGenerateModal(true);
  };

  const handleGenerateSessions = async () => {
    if (!generateClass) return;
    if (!generateStartDate || !generateEndDate) {
      toast.error("Both dates are required");
      return;
    }
    if (generateStartDate > generateEndDate) {
      toast.error("Start date must be before end date");
      return;
    }

    try {
      const res = await generateSessions.mutateAsync({
        classId: generateClass.id,
        payload: {
          classId: generateClass.id,
          startDate: generateStartDate,
          endDate: generateEndDate,
        },
      });
      const count = res?.data?.length ?? 0;
      toast.success(`${count} session${count === 1 ? "" : "s"} generated`);
      setShowGenerateModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate sessions");
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
        title="Pilates Classes"
        subtitle={`${totalElements} class${totalElements === 1 ? "" : "es"}`}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-[#3D4946]">
            Classes are recurring templates. Sessions are individual occurrences.
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
            <table className="w-full min-w-[1000px]">
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
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-sm text-[#94A3B8]"
                    >
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
                        <p className="text-sm font-semibold text-[#0B1C30]">
                          {cls.name}
                        </p>
                        {cls.description && (
                          <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">
                            {cls.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {cls.programName || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {cls.instructorName || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#3D4946]">
                          {DAY_LABELS[cls.dayOfWeek] ?? `Day ${cls.dayOfWeek}`}
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                          {formatTime(cls.startTime)} · {cls.durationMinutes}min
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
                                onClick={() => openGenerateModal(cls)}
                                className="text-sm font-semibold text-[#0D9488] hover:underline"
                              >
                                Generate Sessions
                              </button>
                              <button
                                onClick={() => handleDeactivate(cls.id, cls.name)}
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

      {/* ── Create/Edit Class Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Class" : "New Class"}
        size="lg"
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
              disabled={createClass.isPending || updateClass.isPending}
              className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-50"
            >
              {createClass.isPending || updateClass.isPending
                ? "Saving…"
                : editing
                ? "Save Changes"
                : "Create Class"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
                Program <span className="text-[#93000A]">*</span>
              </label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              >
                <option value="">Select a program…</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
                Instructor <span className="text-[#93000A]">*</span>
              </label>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              >
                <option value="">Select an instructor…</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
              Class Name <span className="text-[#93000A]">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Core"
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
              className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
                Day <span className="text-[#93000A]">*</span>
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              >
                {Object.entries(DAY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
                Start Time <span className="text-[#93000A]">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
                Duration (min)
              </label>
              <input
                type="number"
                min="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
                Default Capacity
              </label>
              <input
                type="number"
                min="1"
                value={defaultCapacity}
                onChange={(e) => setDefaultCapacity(e.target.value)}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer mt-6">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#00685C] rounded border-[#E2E8F0] focus:ring-[#00685C]"
              />
              <span className="text-sm font-semibold text-[#0B1C30]">
                Active
              </span>
            </label>
          </div>
        </div>
      </Modal>

      {/* ── Generate Sessions Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Sessions"
        subtitle={generateClass ? `For "${generateClass.name}"` : ""}
        size="md"
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
          <div className="bg-[#F0FDFA] border border-[#D1FAE5] rounded-lg p-4">
            <p className="text-sm text-[#0F766E] font-semibold mb-1">
              About session generation
            </p>
            <p className="text-xs text-[#3D4946]">
              The system will create one session per{" "}
              <strong>
                {generateClass ? DAY_LABELS[generateClass.dayOfWeek] : "day"}
              </strong>{" "}
              between the two dates below. Existing sessions on those dates are
              skipped automatically.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
                Start Date <span className="text-[#93000A]">*</span>
              </label>
              <input
                type="date"
                value={generateStartDate}
                onChange={(e) => setGenerateStartDate(e.target.value)}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
                End Date <span className="text-[#93000A]">*</span>
              </label>
              <input
                type="date"
                value={generateEndDate}
                onChange={(e) => setGenerateEndDate(e.target.value)}
                className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}