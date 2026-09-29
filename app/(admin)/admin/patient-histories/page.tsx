"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useAllClinicalRecords } from "@/hooks/useClinicalRecords";
import { ClinicalModule } from "@/services/clinicalRecordService";
import {
  createPatientHistory,
  createDermatologyRecord,
} from "@/services/patientHistoryService";
import { fetchAppointmentById } from "@/services/appointmentService";

export const dynamic = "force-dynamic";

type HistoryRow = {
  id: string;
  shortId: string;
  patientId: string;
  patientName: string;
  initials: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  date: string;
  time: string;
  amount: number | null;
  discount: number;
  amountPaid: number;
  balance: number;
  paymentStatus: string;
  status: string;
  observation: string;
  createdAt: string;
  familyMemberId?: string;
  familyMemberName?: string;
  appointmentType?: "INDIVIDUAL" | "FAMILY";
  headPatientName?: string;
  isCheckUp: boolean;
  module: ClinicalModule;
};

type ModuleFilter = "ALL" | ClinicalModule;

const PAYMENT_COLORS: Record<string, string> = {
  PAID: "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  UNPAID: "bg-[#FFDAD6] text-[#93000A]",
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-[#F0FDFA] text-[#0F766E]",
  IN_PROGRESS: "bg-[#E5EEFF] text-[#435B7E]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
};

const MODULE_COLORS: Record<string, string> = {
  DENTAL: "bg-[#E5EEFF] text-[#1E40AF]",
  DERMATOLOGY: "bg-[#FCE7F3] text-[#9D174D]",
};

const formatCurrency = (n: number | null) => {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(n);
};

const formatDateSafe = (dateString: string | null | undefined) => {
  if (!dateString) return { date: "—", time: "—" };
  const dt = new Date(dateString);
  if (isNaN(dt.getTime())) return { date: "—", time: "—" };
  return {
    date: dt.toLocaleDateString(),
    time: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};

const getInitials = (name: string | null | undefined) => {
  if (!name) return "NA";
  return name
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function ClinicalRecordsPage() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("ALL");
  const [selectedHistory, setSelectedHistory] = useState<HistoryRow | null>(null);

  const [page, setPage] = useState(0);
  const size = 10;

  // ── Create History modal state ────────────────────────────────────────
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createApptId, setCreateApptId] = useState("");
  const [createAmount, setCreateAmount] = useState("");
  const [createDiscount, setCreateDiscount] = useState("");
  const [isCheckUpVisit, setIsCheckUpVisit] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // ── Appointment lookup state ──────────────────────────────────────────
  const [detectedModule, setDetectedModule] = useState<ClinicalModule | null>(null);
  const [detectedPatientName, setDetectedPatientName] = useState<string | null>(null);
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "found" | "notfound" | "unassigned">("idle");
  const [lookupError, setLookupError] = useState<string | null>(null);

  const recordTypeParam: ClinicalModule | undefined =
    moduleFilter === "ALL" ? undefined : moduleFilter;

  const { data, isLoading, isError, error, refetch } = useAllClinicalRecords(
    page,
    size,
    recordTypeParam
  );

  const allRows: HistoryRow[] = useMemo(() => {
    const records = data?.content ?? [];
    return records.map((r) => {
      const { date, time } = formatDateSafe(r.appointmentDate || r.createdAt);
      const displayName = r.familyMemberName || r.patientName || "Unknown Patient";
      const checkUp = r.amount === null || r.amount === undefined;
      const module = r.recordType;

      return {
        id: r.id,
        shortId: `${module === "DENTAL" ? "HIS" : "DERM"}-${r.id.slice(0, 6).toUpperCase()}`,
        patientId: r.patientId,
        patientName: displayName,
        initials: getInitials(displayName),
        doctorId: r.doctorId || "",
        doctorName: r.doctorName || "Unknown Doctor",
        appointmentId: r.appointmentId || "",
        date,
        time,
        amount: r.amount ?? null,
        discount: r.discount ?? 0,
        amountPaid: r.amountPaid ?? 0,
        balance: r.balance ?? 0,
        paymentStatus: r.paymentStatus || "PENDING",
        status: r.status || "PENDING",
        observation: r.summary || "No observation notes",
        createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : "—",
        familyMemberId: r.familyMemberId || undefined,
        familyMemberName: r.familyMemberName || undefined,
        appointmentType: r.familyMemberId ? "FAMILY" : "INDIVIDUAL",
        headPatientName: r.familyMemberId ? r.patientName : undefined,
        isCheckUp: checkUp,
        module,
      };
    });
  }, [data]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return allRows;
    const term = search.trim().toLowerCase();
    return allRows.filter(
      (r) =>
        r.patientName.toLowerCase().includes(term) ||
        r.doctorName.toLowerCase().includes(term) ||
        r.shortId.toLowerCase().includes(term)
    );
  }, [allRows, search]);

  useEffect(() => {
    setPage(0);
  }, [moduleFilter, search]);

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const openDetails = (history: HistoryRow) => setSelectedHistory({ ...history });
  const closeDetails = () => setSelectedHistory(null);
  const handlePageChange = (newPage: number) => setPage(newPage);

  const dentalCount = allRows.filter((r) => r.module === "DENTAL").length;
  const dermCount = allRows.filter((r) => r.module === "DERMATOLOGY").length;

  // ── Appointment lookup (debounced) ────────────────────────────────────
  const lookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookupRequestIdRef = useRef(0);

  const lookupAppointment = async (appointmentId: string) => {
    const trimmed = appointmentId.trim();
    if (!trimmed) {
      setLookupStatus("idle");
      setDetectedModule(null);
      setDetectedPatientName(null);
      setLookupError(null);
      return;
    }

    const requestId = ++lookupRequestIdRef.current;
    setLookupStatus("loading");
    setLookupError(null);

    try {
      const res = await fetchAppointmentById(trimmed);
      // Stale response guard
      if (requestId !== lookupRequestIdRef.current) return;

      const appt = res?.data;
      if (!appt) {
        setLookupStatus("notfound");
        setLookupError("Appointment not found.");
        setDetectedModule(null);
        setDetectedPatientName(null);
        return;
      }

      // If the appointment has no module (doctor not assigned yet)
      if (!appt.clinicalModule) {
        setLookupStatus("unassigned");
        setLookupError(
          "This appointment hasn't been assigned to a doctor yet. Assign a doctor first so we know which module to create the record under."
        );
        setDetectedModule(null);
        setDetectedPatientName(appt.patientName || null);
        return;
      }

      setLookupStatus("found");
      setDetectedModule(appt.clinicalModule);
      setDetectedPatientName(appt.patientName || null);
      setLookupError(null);
    } catch (err: any) {
      if (requestId !== lookupRequestIdRef.current) return;
      setLookupStatus("notfound");
      setLookupError(err?.message || "Appointment not found.");
      setDetectedModule(null);
      setDetectedPatientName(null);
    }
  };

  useEffect(() => {
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);

    lookupTimerRef.current = setTimeout(() => {
      lookupAppointment(createApptId);
    }, 500);

    return () => {
      if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createApptId]);

  // ── Create History handlers ───────────────────────────────────────────
  const openCreatePanel = () => {
    setCreateApptId("");
    setCreateAmount("");
    setCreateDiscount("");
    setIsCheckUpVisit(false);
    setCreateError(null);
    setCreateSuccess(null);
    setDetectedModule(null);
    setDetectedPatientName(null);
    setLookupStatus("idle");
    setLookupError(null);
    setShowCreatePanel(true);
  };

  const closeCreatePanel = () => {
    if (creating) return;
    setShowCreatePanel(false);
  };

  const createHistory = async () => {
    if (!createApptId.trim()) {
      setCreateError("Please enter an appointment ID.");
      return;
    }

    if (lookupStatus !== "found" || !detectedModule) {
      setCreateError(
        lookupError ||
          "Cannot create a record until we detect the appointment's clinical module."
      );
      return;
    }

    let amount: number | null = null;
    if (!isCheckUpVisit) {
      const parsedAmount = parseFloat(createAmount);
      if (!createAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setCreateError("Amount must be a positive number.");
        return;
      }
      amount = parsedAmount;
    }

    const discount = parseFloat(createDiscount) || 0;
    if (discount < 0) {
      setCreateError("Discount cannot be negative.");
      return;
    }

    if (!isCheckUpVisit && discount > (amount || 0)) {
      setCreateError("Discount cannot exceed the total amount.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const payload: any = {
        appointmentId: createApptId.trim(),
        discount,
      };

      if (!isCheckUpVisit && amount !== null) {
        payload.amount = amount;
      }

      // ✅ Route to the correct endpoint based on the detected module
      const res =
        detectedModule === "DERMATOLOGY"
          ? await createDermatologyRecord(payload)
          : await createPatientHistory(payload);

      if (res.success) {
        const moduleLabel = detectedModule === "DERMATOLOGY" ? "Dermatology" : "Dental";
        setCreateSuccess(
          res.message || `${moduleLabel} record created successfully!`
        );

        setTimeout(async () => {
          await refetch();
          setShowCreatePanel(false);
          setCreateApptId("");
          setCreateAmount("");
          setCreateDiscount("");
          setIsCheckUpVisit(false);
          setDetectedModule(null);
          setDetectedPatientName(null);
          setLookupStatus("idle");
        }, 1500);
      } else {
        setCreateError(res.message || "Failed to create record.");
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create record.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10 flex flex-col gap-6">
        {/* Filters row with Create History button */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="search"
              placeholder="Search by patient, doctor or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-72"
            />

            <div className="inline-flex rounded-lg border border-[#E2E8F0] overflow-hidden bg-white">
              {(["ALL", "DENTAL", "DERMATOLOGY"] as ModuleFilter[]).map((m) => {
                const active = moduleFilter === m;
                const label =
                  m === "ALL"
                    ? `All (${dentalCount + dermCount})`
                    : m === "DENTAL"
                    ? `Dental (${dentalCount})`
                    : `Dermatology (${dermCount})`;

                return (
                  <button
                    key={m}
                    onClick={() => setModuleFilter(m)}
                    className={`px-4 py-2 text-xs font-semibold transition-colors border-r border-[#E2E8F0] last:border-r-0 ${
                      active
                        ? "bg-[#00685C] text-white"
                        : "bg-white text-[#3D4946] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={openCreatePanel}
            className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create History
          </button>
        </div>

        {isError && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {(error as any)?.message || "Failed to load clinical records."}
          </div>
        )}

        <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  {["ID", "MODULE", "PATIENT", "TYPE", "DOCTOR", "DATE", "AMOUNT", "DISCOUNT", "AMOUNT PAID", "BALANCE", "PAYMENT", "STATUS", "ACTIONS"].map((h) => (
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
                      {[...Array(13)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                      No clinical records found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((h) => {
                    const isFamily = h.appointmentType === "FAMILY";
                    const isDerm = h.module === "DERMATOLOGY";

                    return (
                      <tr
                        key={h.id}
                        className="hover:bg-[#F8FAFC] transition-colors border-t border-[#F8FAFC]"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-[#0D9488]">
                          {h.shortId}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${MODULE_COLORS[h.module]}`}
                          >
                            {isDerm ? "Dermatology" : "Dental"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
                              {h.initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#0B1C30]">
                                {h.patientName}
                              </p>
                              {isFamily && h.headPatientName && (
                                <p className="text-xs text-[#94A3B8]">
                                  Head: {h.headPatientName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isFamily ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              Family
                            </span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              Individual
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3D4946]">{h.doctorName}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#0B1C30]">{h.date}</p>
                          <p className="text-xs text-[#3D4946]">{h.time}</p>
                        </td>
                        <td className="px-6 py-4">
                          {h.isCheckUp ? (
                            <span className="text-sm font-semibold text-[#0D9488]">Check-up</span>
                          ) : (
                            <span className="text-sm font-semibold text-[#0B1C30]">
                              {formatCurrency(h.amount)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#0D9488]">
                          {h.isCheckUp ? "—" : formatCurrency(h.discount || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#2563EB]">
                          {h.isCheckUp ? "—" : formatCurrency(h.amountPaid || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold">
                          {h.isCheckUp ? (
                            <span className="text-[#94A3B8]">—</span>
                          ) : (
                            <span
                              className={h.balance === 0 ? "text-[#0F766E]" : "text-[#93000A]"}
                            >
                              {formatCurrency(h.balance)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              PAYMENT_COLORS[h.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"
                            }`}
                          >
                            {h.isCheckUp ? "COMPLETED" : h.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              STATUS_COLORS[h.status] ?? "bg-[#F1F5F9] text-[#64748B]"
                            }`}
                          >
                            {h.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openDetails(h)}
                            className="text-xs text-[#0D9488] hover:underline font-semibold"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!isLoading && totalPages > 0 && (
          <div className="flex items-center justify-between mt-6">
            <button
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <span className="text-sm text-[#3D4946]">
              Page {page + 1} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {!isLoading && (
          <p className="text-sm text-[#3D4946]">
            Showing {filteredRows.length} of {totalElements} records
          </p>
        )}
      </main>

      {/* Details Modal (unchanged from previous version) */}
      {selectedHistory && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[#F1F5F9]">
              <div>
                <h2 className="text-xl font-bold text-[#0B1C30]">Clinical Record</h2>
                <span
                  className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    MODULE_COLORS[selectedHistory.module]
                  }`}
                >
                  {selectedHistory.module === "DERMATOLOGY" ? "Dermatology" : "Dental"}
                </span>
              </div>
              <button
                onClick={closeDetails}
                className="text-[#94A3B8] hover:text-[#475569] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Record ID</p>
                  <p className="text-sm font-semibold text-[#0D9488] mt-1">
                    {selectedHistory.shortId}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Appointment ID</p>
                  <p className="text-sm font-semibold text-[#0D9488] mt-1">
                    {selectedHistory.appointmentId?.slice(-8)?.toUpperCase() || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-2">Patient Information</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#CCFBF1] flex items-center justify-center text-sm font-bold text-[#0F766E]">
                      {selectedHistory.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0B1C30]">{selectedHistory.patientName}</p>
                      <p className="text-xs text-[#3D4946]">
                        Patient ID: {selectedHistory.patientId?.slice(-8) || "N/A"}
                      </p>
                      {selectedHistory.appointmentType === "FAMILY" && selectedHistory.headPatientName && (
                        <p className="text-xs text-[#94A3B8]">
                          Head Patient: {selectedHistory.headPatientName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-2">Doctor Information</p>
                  <div>
                    <p className="text-sm font-semibold text-[#0B1C30]">{selectedHistory.doctorName}</p>
                    <p className="text-xs text-[#3D4946]">
                      Doctor ID: {selectedHistory.doctorId?.slice(-8) || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-3">Appointment Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#94A3B8]">Date</p>
                    <p className="text-sm font-medium text-[#0B1C30]">{selectedHistory.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Time</p>
                    <p className="text-sm font-medium text-[#0B1C30]">{selectedHistory.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Type</p>
                    <p className="text-sm font-medium text-[#0B1C30]">
                      {selectedHistory.appointmentType === "FAMILY"
                        ? "Family Appointment"
                        : "Individual Appointment"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Recorded On</p>
                    <p className="text-sm font-medium text-[#0B1C30]">{selectedHistory.createdAt}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-[#94A3B8]">Status</p>
                    <span
                      className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${
                        STATUS_COLORS[selectedHistory.status] ?? "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      {selectedHistory.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-3">Financial Details</p>
                {selectedHistory.isCheckUp ? (
                  <div className="bg-[#F0FDFA] rounded-lg p-4 text-center border border-[#0D9488]">
                    <p className="text-sm font-semibold text-[#0F766E]">Check-up / No Charge Visit</p>
                    <p className="text-xs text-[#94A3B8] mt-1">This is a non-financial clinical record</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-[#94A3B8]">Amount</p>
                      <p className="text-sm font-bold text-[#0B1C30]">{formatCurrency(selectedHistory.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Discount</p>
                      <p className="text-sm font-bold text-[#0D9488]">{formatCurrency(selectedHistory.discount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Amount Paid</p>
                      <p className="text-sm font-bold text-[#2563EB]">{formatCurrency(selectedHistory.amountPaid || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Balance</p>
                      <p className={`text-sm font-bold ${selectedHistory.balance === 0 ? "text-[#0F766E]" : "text-[#93000A]"}`}>
                        {formatCurrency(selectedHistory.balance)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="mt-3">
                  <p className="text-xs text-[#94A3B8]">Payment Status</p>
                  <span
                    className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${
                      PAYMENT_COLORS[selectedHistory.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    {selectedHistory.isCheckUp ? "COMPLETED (No Charge)" : selectedHistory.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-2">Clinical Observation</p>
                <p className="text-sm text-[#485F83] leading-relaxed">
                  {selectedHistory.observation || "No observation notes available"}
                </p>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-[#F1F5F9]">
              <button
                onClick={closeDetails}
                className="px-4 py-2 text-sm font-semibold text-[#3D4946] hover:text-[#0B1C30] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Create History Modal (module-aware) */}
      {showCreatePanel && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !creating) {
              closeCreatePanel();
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-[#F1F5F9]">
              <h2 className="text-xl font-bold text-[#0B1C30]">Create Clinical Record</h2>
              <button
                onClick={closeCreatePanel}
                disabled={creating}
                className="text-[#94A3B8] hover:text-[#475569] transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Module detection banner */}
              {lookupStatus === "loading" && (
                <div className="bg-[#F8FAFC] text-[#3D4946] text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Looking up appointment…
                </div>
              )}

              {lookupStatus === "found" && detectedModule && (
                <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${MODULE_COLORS[detectedModule]}`}>
                  ✓ Detected: <strong>{detectedModule === "DERMATOLOGY" ? "Dermatology" : "Dental"}</strong> appointment
                  {detectedPatientName ? ` — ${detectedPatientName}` : ""}
                </div>
              )}

              {lookupStatus === "unassigned" && (
                <div className="bg-[#FEF3C7] text-[#92400E] text-xs font-semibold px-3 py-2 rounded-lg">
                  ⚠ {lookupError}
                </div>
              )}

              {lookupStatus === "notfound" && lookupError && (
                <div className="bg-[#FFDAD6] text-[#93000A] text-xs font-semibold px-3 py-2 rounded-lg">
                  ✕ {lookupError}
                </div>
              )}

              {createSuccess && (
                <div className="bg-[#DCFCE7] text-[#166534] text-sm font-semibold px-4 py-3 rounded-lg">
                  {createSuccess}
                </div>
              )}

              {createError && (
                <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                  Appointment ID <span className="text-[#93000A]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter appointment ID"
                  value={createApptId}
                  onChange={(e) => setCreateApptId(e.target.value)}
                  disabled={creating}
                  className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-[#94A3B8] mt-1">
                  We'll auto-detect whether this is a Dental or Dermatology appointment
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-lg p-3">
                <input
                  type="checkbox"
                  id="isCheckUp"
                  checked={isCheckUpVisit}
                  onChange={(e) => {
                    setIsCheckUpVisit(e.target.checked);
                    if (e.target.checked) setCreateAmount("");
                  }}
                  disabled={creating}
                  className="w-4 h-4 text-[#00685C] rounded border-[#E2E8F0] focus:ring-[#00685C] disabled:opacity-50"
                />
                <label htmlFor="isCheckUp" className="text-sm font-semibold text-[#0B1C30]">
                  This is a check-up / no-charge visit
                </label>
              </div>

              {!isCheckUpVisit && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                      Amount <span className="text-[#93000A]">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={createAmount}
                      onChange={(e) => setCreateAmount(e.target.value)}
                      disabled={creating}
                      className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                      Discount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={createDiscount}
                      onChange={(e) => setCreateDiscount(e.target.value)}
                      disabled={creating}
                      className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Discount applied to the total amount (optional)
                    </p>
                  </div>

                  {createAmount && parseFloat(createAmount) > 0 && (
                    <div className="bg-[#F8FAFC] rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#3D4946]">Balance after discount:</span>
                        <span className="font-bold text-[#0B1C30]">
                          {formatCurrency(
                            parseFloat(createAmount) - (parseFloat(createDiscount) || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {isCheckUpVisit && (
                <div className="bg-[#F0FDFA] rounded-lg p-4 border border-[#0D9488]">
                  <p className="text-sm font-semibold text-[#0F766E] flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Check-up / No-charge
                  </p>
                  <p className="text-xs text-[#3D4946] mt-1">
                    This will create a clinical record with no financial obligation.
                    The record will be marked as PAID and will not appear in outstanding payments.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[#F1F5F9]">
              <button
                onClick={closeCreatePanel}
                disabled={creating}
                className="px-4 py-2 text-sm font-semibold text-[#3D4946] hover:text-[#0B1C30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={createHistory}
                disabled={creating || lookupStatus !== "found"}
                className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : isCheckUpVisit ? (
                  "Create Check-up Record"
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}