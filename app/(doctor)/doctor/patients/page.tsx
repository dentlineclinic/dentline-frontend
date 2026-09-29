"use client";

import { useState, useEffect } from "react";
import dynamicImport from "next/dynamic";
import {
  searchPatientsForHistory,
  PatientSearchResult,
  PatientHistory,
} from "@/services/patientHistoryService";
import {
  fetchClinicalRecordsByPatient,
  UnifiedClinicalRecord,
  ClinicalModule,
} from "@/services/clinicalRecordService";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";

const PatientHistoryModal = dynamicImport(
  () => import("@/components/modals/PatientHistoryModal"),
  { ssr: false }
);

export const dynamic = "force-dynamic";

type Patient = {
  id: string;
  shortId: string;
  fullName: string;
  initials: string;
  email: string;
  gender: string;
  dateOfBirth: string;
};

type SearchResult = {
  patient: Patient;
  histories: PatientHistory[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-[#DCFCE7] text-[#166534]",
  IN_PROGRESS: "bg-[#FEF3C7] text-[#92400E]",
  PENDING: "bg-[#E5EEFF] text-[#435B7E]",
};

const PAYMENT_COLORS: Record<string, string> = {
  PAID: "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  UNPAID: "bg-[#FFDAD6] text-[#93000A]",
};

const MODULE_COLORS: Record<string, string> = {
  DENTAL: "bg-[#E5EEFF] text-[#1E40AF]",
  DERMATOLOGY: "bg-[#FCE7F3] text-[#9D174D]",
};

type TabType = "all" | "individual" | "family";
type SearchMode = "id" | "name";

const buildInitials = (name: string): string =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase() || "NA";

/**
 * Convert a UnifiedClinicalRecord (from the merged endpoint) into a
 * PatientHistory-shaped object so the existing modal + card renderer
 * keep working. The key extra field is `recordType`, which the modal
 * uses to decide between dental and dermatology UIs.
 */
function unifiedToPatientHistory(r: UnifiedClinicalRecord): PatientHistory & {
  recordType: ClinicalModule;
} {
  return {
    id: r.id,
    patientId: r.patientId,
    patientName: r.patientName,
    hmo: null,
    doctorId: r.doctorId || "",
    doctorName: r.doctorName || "Unknown",
    appointmentId: r.appointmentId || "",
    appointmentDate: r.appointmentDate || r.createdAt || "",
    observation: r.summary || "",
    amount: r.amount ?? null,
    discount: r.discount ?? 0,
    amountPaid: r.amountPaid ?? 0,
    balance: r.balance ?? 0,
    paymentStatus: r.paymentStatus || "PENDING",
    status: r.status || "PENDING",
    createdAt: r.createdAt || "",
    imageUrls: [],
    imageIds: [],
    videoUrls: [],
    videoIds: [],
    familyMemberId: r.familyMemberId ?? undefined,
    familyMemberName: r.familyMemberName ?? undefined,
    appointmentType: r.familyMemberId ? "FAMILY" : "INDIVIDUAL",
    // Custom fields we read elsewhere
    recordType: r.recordType,
  } as any;
}

export default function DoctorPatientsPage() {
  // ── Doctor profile (module detection) ─────────────────────────────────────
  const { data: profileRes } = useDoctorProfile();
  const doctorModule: ClinicalModule | undefined = profileRes?.data?.clinicalModule;
  const moduleLabel =
    doctorModule === "DERMATOLOGY" ? "Dermatology" : "Dental";

  // ── Search state ──────────────────────────────────────────────────────────
  const [searchMode, setSearchMode] = useState<SearchMode>("id");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Patient name search results
  const [patientResults, setPatientResults] = useState<PatientSearchResult[]>([]);
  const [patientSearchTotalPages, setPatientSearchTotalPages] = useState(0);
  const [patientSearchCurrentPage, setPatientSearchCurrentPage] = useState(0);
  const [patientSearchTotalElements, setPatientSearchTotalElements] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  // History results
  const [allResult, setAllResult] = useState<SearchResult | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedHistory, setSelectedHistory] = useState<PatientHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activePatientId = selectedPatient?.patientId || query.trim();

  const openHistoryModal = (history: PatientHistory) => {
    setSelectedHistory(history);
    setIsModalOpen(true);
  };

  const closeHistoryModal = () => {
    setIsModalOpen(false);
    setSelectedHistory(null);
  };

  const handleObservationSaved = () => {
    if (!activePatientId) return;
    if (allResult) searchAll(activePatientId, allResult.currentPage);
  };

  // ── Reset helpers ─────────────────────────────────────────────────────────
  const resetHistoryResults = () => {
    setAllResult(null);
    setError(null);
  };

  const resetAll = () => {
    setPatientResults([]);
    setPatientSearchTotalPages(0);
    setPatientSearchCurrentPage(0);
    setPatientSearchTotalElements(0);
    setSelectedPatient(null);
    resetHistoryResults();
    setHasSearched(false);
    setActiveTab("all");
  };

  const handleModeChange = (mode: SearchMode) => {
    if (mode === searchMode) return;
    setSearchMode(mode);
    setQuery("");
    resetAll();
  };

  // ── Patient name search ───────────────────────────────────────────────────
  const searchPatientsByName = async (page = 0) => {
    const name = query.trim();
    if (!name) return;

    setSearching(true);
    setError(null);
    setHasSearched(true);
    setSelectedPatient(null);
    resetHistoryResults();

    try {
      const res = await searchPatientsForHistory(name, page, 10);

      if (!res.success) {
        setError(res.message);
        setPatientResults([]);
        setPatientSearchTotalPages(0);
        setPatientSearchTotalElements(0);
        return;
      }

      if (res.data.content.length === 0) {
        setError("No patients found with this name.");
        setPatientResults([]);
        setPatientSearchTotalPages(0);
        setPatientSearchTotalElements(0);
        return;
      }

      setPatientResults(res.data.content);
      setPatientSearchTotalPages(res.data.totalPages);
      setPatientSearchCurrentPage(res.data.number);
      setPatientSearchTotalElements(res.data.totalElements);
    } catch (err) {
      setError("Failed to search patients");
      setPatientResults([]);
      setPatientSearchTotalPages(0);
      setPatientSearchTotalElements(0);
    } finally {
      setSearching(false);
    }
  };

  // ── Unified clinical records (dental + dermatology) ───────────────────────

  const searchAll = async (patientId: string, page = 0) => {
    if (!patientId) return;

    setSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      // Fetch both modules; filter to the doctor's module if we know it.
      const res = await fetchClinicalRecordsByPatient(patientId, page, 10);

      if (!res || !res.content) {
        setError("No clinical records found for this patient.");
        setAllResult(null);
        return;
      }

      // Filter: show only records in this doctor's module (if known).
      // If doctorModule is unknown (profile still loading), show everything
      // so nothing disappears.
      const filtered = doctorModule
        ? res.content.filter((r) => r.recordType === doctorModule)
        : res.content;

      if (filtered.length === 0) {
        setError(
          doctorModule
            ? `No ${moduleLabel.toLowerCase()} records found for this patient.`
            : "No clinical records found for this patient."
        );
        setAllResult(null);
        return;
      }

      const histories = filtered.map(unifiedToPatientHistory);
      const displayName =
        histories[0].familyMemberName || histories[0].patientName || "Unknown Patient";

      setAllResult({
        patient: {
          id: patientId,
          shortId: patientId.slice(-6),
          fullName: displayName,
          initials: buildInitials(displayName),
          email: "",
          gender: "",
          dateOfBirth: "",
        },
        histories,
        totalElements: filtered.length,
        totalPages: res.totalPages,
        currentPage: res.number,
      });
    } catch (err) {
      setError("Failed to fetch patient clinical records");
      setAllResult(null);
    } finally {
      setSearching(false);
    }
  };

  // ── Load histories ────────────────────────────────────────────────────────
  const loadAllHistories = async (patientId: string) => {
    setActiveTab("all");
    await searchAll(patientId, 0);
  };

  const selectPatient = async (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    await loadAllHistories(patient.patientId);
  };

  const handleSearch = async (page = 0) => {
    if (!query.trim()) return;
    if (searchMode === "id") {
      await loadAllHistories(query.trim());
    } else {
      await searchPatientsByName(page);
    }
  };

  const loadPage = (page: number, _tab: TabType) => {
    const patientId = activePatientId;
    if (!patientId) return;
    searchAll(patientId, page);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const currentResult = allResult;

  // Since we only have one tab now, we override counts.
  const allCount = allResult?.totalElements || 0;
  const individualCount = 0;
  const familyCount = 0;

  // ── Render a history card ─────────────────────────────────────────────────
  const renderHistories = (histories: (PatientHistory & { recordType?: ClinicalModule })[]) => {
    return histories.map((h) => {
      const displayName =
        h.appointmentType === "FAMILY" && h.familyMemberName
          ? h.familyMemberName
          : h.patientName;

      const recordModule = (h as any).recordType as ClinicalModule | undefined;

      return (
        <div
          key={h.id}
          className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col gap-3 hover:border-[#00685C]/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-bold text-[#0B1C30]">{displayName}</p>

                {recordModule && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${MODULE_COLORS[recordModule]}`}
                  >
                    {recordModule === "DERMATOLOGY" ? "Dermatology" : "Dental"}
                  </span>
                )}

                {h.appointmentType === "FAMILY" && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex-shrink-0">
                    Family
                  </span>
                )}
                {h.appointmentType === "INDIVIDUAL" && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                    Individual
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Doctor: {h.doctorName} • {formatDate(h.appointmentDate)}
              </p>
              {h.appointmentType === "FAMILY" && h.familyMemberName && (
                <p className="text-sm font-semibold text-[#00685C] mt-0.5">
                  👤 Family Member: {h.familyMemberName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  PAYMENT_COLORS[h.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                {h.paymentStatus}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  STATUS_COLORS[h.status] ?? "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                {(h.status || "").replace("_", " ")}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#485F83] leading-relaxed bg-[#F8FAFC] rounded-lg px-4 py-3">
            {h.observation || "No observation recorded."}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#3D4946]">
                Amount:{" "}
                <span className="font-bold text-[#0B1C30]">
                  {h.amount === 0 || h.amount === null || h.amount === undefined ? (
                    <span className="text-[#0D9488] font-bold">Checkup</span>
                  ) : (
                    `₦${typeof h.amount === "number" ? h.amount.toLocaleString() : h.amount}`
                  )}
                </span>
              </p>
              {h.balance !== undefined && h.balance > 0 && (
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Balance: ₦
                  {typeof h.balance === "number" ? h.balance.toLocaleString() : h.balance}
                </p>
              )}
            </div>
            <button
              onClick={() => openHistoryModal(h)}
              className="text-xs font-semibold text-[#00685C] hover:underline flex items-center gap-1"
            >
              Quick View
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0B1C30]">Patient History Search</h2>
            {doctorModule && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${MODULE_COLORS[doctorModule]}`}
              >
                {moduleLabel}
              </span>
            )}
          </div>
          <p className="text-sm text-[#94A3B8]">
            Search for patient history records by patient ID or patient name.
            {doctorModule && (
              <>
                {" "}
                Showing <strong>{moduleLabel.toLowerCase()}</strong> records only.
              </>
            )}
          </p>

          {/* Search mode toggle */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleModeChange("id")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                searchMode === "id"
                  ? "bg-[#00685C] text-white"
                  : "bg-[#F1F5F9] text-[#3D4946] hover:bg-[#E2E8F0]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
              </svg>
              Search by ID
            </button>
            <button
              onClick={() => handleModeChange("name")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                searchMode === "name"
                  ? "bg-[#00685C] text-white"
                  : "bg-[#F1F5F9] text-[#3D4946] hover:bg-[#E2E8F0]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Search by Name
            </button>
          </div>

          {/* Search input */}
          <div className="flex gap-3 mt-2">
            <div className="relative flex-1 max-w-lg">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder={
                  searchMode === "id" ? "Search by patient ID…" : "Search by patient name…"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(0)}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-11 pr-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors placeholder:text-[#94A3B8]"
              />
            </div>
            <button
              onClick={() => handleSearch(0)}
              disabled={searching || !query.trim()}
              className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              {searching ? "Searching…" : "Search"}
            </button>
          </div>
        </div>

        <hr className="border-[#E2E8F0]" />

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!hasSearched && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 bg-[#F0FDFA] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-[#0B1C30]">Search for a patient</p>
            <p className="text-sm text-[#94A3B8] text-center max-w-xs">
              {searchMode === "id"
                ? "Enter a patient ID to retrieve their records."
                : "Enter a patient name to find matching patients and view their history."}
            </p>
          </div>
        )}

        {/* Patient name search results list */}
        {searchMode === "name" && patientResults.length > 0 && !selectedPatient && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0B1C30]">
                Select a Patient
                <span className="text-sm font-normal text-[#94A3B8] ml-2">
                  ({patientSearchTotalElements} found)
                </span>
              </h3>
            </div>

            <div className="grid gap-3">
              {patientResults.map((patient) => (
                <button
                  key={patient.patientId}
                  onClick={() => selectPatient(patient)}
                  className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex items-center gap-4 hover:border-[#00685C] hover:shadow-md transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-[#CCFBF1] flex items-center justify-center text-base font-bold text-[#0F766E] flex-shrink-0">
                    {buildInitials(patient.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-[#0B1C30]">{patient.name}</p>
                    <p className="text-sm text-[#94A3B8] truncate">
                      {patient.email || "No email"} • {patient.phoneNumber || "No phone"}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      ID: {patient.patientId.slice(0, 8)}...
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-[#94A3B8] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            {patientSearchTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#3D4946]">
                  Page {patientSearchCurrentPage + 1} of {patientSearchTotalPages} · {patientSearchTotalElements} patients
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => searchPatientsByName(patientSearchCurrentPage - 1)}
                    disabled={patientSearchCurrentPage === 0 || searching}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E2E8F0] text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => searchPatientsByName(patientSearchCurrentPage + 1)}
                    disabled={patientSearchCurrentPage >= patientSearchTotalPages - 1 || searching}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E2E8F0] text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected patient banner */}
        {selectedPatient && (
          <div className="bg-[#F0FDFA] border border-[#00685C]/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#CCFBF1] flex items-center justify-center text-sm font-bold text-[#0F766E] flex-shrink-0">
              {buildInitials(selectedPatient.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0B1C30] truncate">{selectedPatient.name}</p>
              <p className="text-xs text-[#94A3B8]">ID: {selectedPatient.patientId.slice(0, 8)}...</p>
            </div>
            <button
              onClick={() => {
                setSelectedPatient(null);
                resetHistoryResults();
                setHasSearched(true);
              }}
              className="text-xs font-semibold text-[#00685C] hover:underline flex-shrink-0"
            >
              Change Patient
            </button>
          </div>
        )}

        {/* History results */}
        {currentResult && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#CCFBF1] flex items-center justify-center text-base font-bold text-[#0F766E] flex-shrink-0">
                {currentResult.patient.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-[#0B1C30] truncate">
                  {currentResult.patient.fullName}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  Patient ID: {currentResult.patient.id.slice(0, 8)}...
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-[#00685C]">{currentResult.totalElements}</p>
                <p className="text-xs text-[#94A3B8]">
                  {moduleLabel.toLowerCase()} records
                </p>
              </div>
            </div>

            {/* Tab bar — still shown but only "All" is functional for now */}
            <div className="flex border-b border-[#E2E8F0]">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === "all"
                    ? "border-[#00685C] text-[#00685C]"
                    : "border-transparent text-[#94A3B8] hover:text-[#3D4946]"
                }`}
              >
                All ({allCount})
              </button>
            </div>

            {currentResult.histories.length === 0 ? (
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 text-center shadow-sm">
                <p className="text-sm text-[#94A3B8]">
                  No {moduleLabel.toLowerCase()} records found for this patient.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {renderHistories(currentResult.histories)}
              </div>
            )}

            {currentResult.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#3D4946]">
                  Page {currentResult.currentPage + 1} of {currentResult.totalPages} · {currentResult.totalElements} records
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadPage(currentResult.currentPage - 1, activeTab)}
                    disabled={currentResult.currentPage === 0 || searching}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E2E8F0] text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  {[...Array(currentResult.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => loadPage(i, activeTab)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                        i === currentResult.currentPage
                          ? "bg-[#00685C] text-white"
                          : "border border-[#E2E8F0] text-[#3D4946] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => loadPage(currentResult.currentPage + 1, activeTab)}
                    disabled={currentResult.currentPage >= currentResult.totalPages - 1 || searching}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E2E8F0] text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <PatientHistoryModal
        isOpen={isModalOpen}
        onClose={closeHistoryModal}
        history={selectedHistory}
        doctorMode={true}
        onObservationSaved={handleObservationSaved}
      />
    </div>
  );
}