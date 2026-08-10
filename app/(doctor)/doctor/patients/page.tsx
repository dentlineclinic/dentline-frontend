"use client";

import { useState } from "react";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import { 
  fetchPatientHistoriesById, 
  fetchIndividualHistoriesById,
  fetchFamilyHistoriesById,
  PatientHistory 
} from "@/services/patientHistoryService";

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

type SearchResultIndividual = {
  patient: Patient;
  histories: PatientHistory[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
};

type SearchResultFamily = {
  patient: Patient;
  histories: PatientHistory[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED:   "bg-[#DCFCE7] text-[#166534]",
  IN_PROGRESS: "bg-[#FEF3C7] text-[#92400E]",
  PENDING:     "bg-[#E5EEFF] text-[#435B7E]",
};

const PAYMENT_COLORS: Record<string, string> = {
  PAID:    "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  UNPAID:  "bg-[#FFDAD6] text-[#93000A]",
};

type TabType = "all" | "individual" | "family";

const getPatientDisplayName = (history: PatientHistory): string => {
  if (history.appointmentType === "FAMILY" && history.familyMemberName) {
    return history.familyMemberName;
  }
  return history.patientName || "Unknown Patient";
};

export default function DoctorPatientsPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  
  const [allResult, setAllResult] = useState<SearchResult | null>(null);
  const [individualResult, setIndividualResult] = useState<SearchResultIndividual | null>(null);
  const [familyResult, setFamilyResult] = useState<SearchResultFamily | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedHistory, setSelectedHistory] = useState<PatientHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openHistoryModal = (history: PatientHistory) => {
    setSelectedHistory(history);
    setIsModalOpen(true);
  };

  const closeHistoryModal = () => {
    setIsModalOpen(false);
    setSelectedHistory(null);
  };

  const handleObservationSaved = () => {
    if (allResult) searchAll(allResult.currentPage);
    if (individualResult) searchIndividual(individualResult.currentPage);
    if (familyResult) searchFamily(familyResult.currentPage);
  };

  const searchAll = async (page = 0) => {
    const patientId = query.trim();
    if (!patientId) return;

    setSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetchPatientHistoriesById(patientId, page, 10);

      if (!res.success) {
        setError(res.message);
        setAllResult(null);
        return;
      }

      const histories = res.data.content;

      if (histories.length === 0) {
        setError("No history found for this patient.");
        setAllResult(null);
        return;
      }

      const displayName = getPatientDisplayName(histories[0]);

      setAllResult({
        patient: {
          id: patientId,
          shortId: patientId.slice(-6),
          fullName: displayName,
          initials: displayName
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase() || "NA",
          email: "",
          gender: "",
          dateOfBirth: "",
        },
        histories,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        currentPage: res.data.number,
      });

    } catch (err) {
      setError("Failed to fetch patient history");
      setAllResult(null);
    } finally {
      setSearching(false);
    }
  };

  const searchIndividual = async (page = 0) => {
    const patientId = query.trim();
    if (!patientId) return;

    setSearching(true);
    setError(null);

    try {
      const res = await fetchIndividualHistoriesById(patientId, page, 10);

      if (!res.success) {
        setError(res.message);
        setIndividualResult(null);
        return;
      }

      const histories = res.data.content;

      if (histories.length === 0) {
        setIndividualResult(null);
        return;
      }

      const displayName = histories[0]?.patientName || "Unknown Patient";

      setIndividualResult({
        patient: {
          id: patientId,
          shortId: patientId.slice(-6),
          fullName: displayName,
          initials: displayName
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase() || "NA",
          email: "",
          gender: "",
          dateOfBirth: "",
        },
        histories,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        currentPage: res.data.number,
      });

    } catch (err) {
      setIndividualResult(null);
    } finally {
      setSearching(false);
    }
  };

  const searchFamily = async (page = 0) => {
    const patientId = query.trim();
    if (!patientId) return;

    setSearching(true);
    setError(null);

    try {
      const res = await fetchFamilyHistoriesById(patientId, page, 10);

      if (!res.success) {
        setError(res.message);
        setFamilyResult(null);
        return;
      }

      const histories = res.data.content;

      if (histories.length === 0) {
        setFamilyResult(null);
        return;
      }

      const displayName = histories[0]?.patientName || "Unknown Patient";

      setFamilyResult({
        patient: {
          id: patientId,
          shortId: patientId.slice(-6),
          fullName: displayName,
          initials: displayName
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase() || "NA",
          email: "",
          gender: "",
          dateOfBirth: "",
        },
        histories,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        currentPage: res.data.number,
      });

    } catch (err) {
      setFamilyResult(null);
    } finally {
      setSearching(false);
    }
  };

  const search = async (page = 0) => {
    const patientId = query.trim();
    if (!patientId) return;

    setSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const allRes = await fetchPatientHistoriesById(patientId, page, 10);
      
      if (allRes.success && allRes.data.content.length > 0) {
        const displayName = getPatientDisplayName(allRes.data.content[0]);
        setAllResult({
          patient: {
            id: patientId,
            shortId: patientId.slice(-6),
            fullName: displayName,
            initials: displayName
              .split(" ")
              .map(n => n[0])
              .join("")
              .toUpperCase() || "NA",
            email: "",
            gender: "",
            dateOfBirth: "",
          },
          histories: allRes.data.content,
          totalElements: allRes.data.totalElements,
          totalPages: allRes.data.totalPages,
          currentPage: allRes.data.number,
        });
      } else {
        setAllResult(null);
      }

      const individualRes = await fetchIndividualHistoriesById(patientId, 0, 100);
      if (individualRes.success && individualRes.data.content.length > 0) {
        const displayName = individualRes.data.content[0]?.patientName || "Unknown Patient";
        setIndividualResult({
          patient: {
            id: patientId,
            shortId: patientId.slice(-6),
            fullName: displayName,
            initials: displayName
              .split(" ")
              .map(n => n[0])
              .join("")
              .toUpperCase() || "NA",
            email: "",
            gender: "",
            dateOfBirth: "",
          },
          histories: individualRes.data.content,
          totalElements: individualRes.data.totalElements,
          totalPages: individualRes.data.totalPages,
          currentPage: individualRes.data.number,
        });
      } else {
        setIndividualResult(null);
      }

      const familyRes = await fetchFamilyHistoriesById(patientId, 0, 100);
      if (familyRes.success && familyRes.data.content.length > 0) {
        const displayName = familyRes.data.content[0]?.patientName || "Unknown Patient";
        setFamilyResult({
          patient: {
            id: patientId,
            shortId: patientId.slice(-6),
            fullName: displayName,
            initials: displayName
              .split(" ")
              .map(n => n[0])
              .join("")
              .toUpperCase() || "NA",
            email: "",
            gender: "",
            dateOfBirth: "",
          },
          histories: familyRes.data.content,
          totalElements: familyRes.data.totalElements,
          totalPages: familyRes.data.totalPages,
          currentPage: familyRes.data.number,
        });
      } else {
        setFamilyResult(null);
      }

      if (!allRes.success || allRes.data.content.length === 0) {
        setError("No history found for this patient.");
      }

    } catch (err) {
      setError("Failed to fetch patient history");
      setAllResult(null);
      setIndividualResult(null);
      setFamilyResult(null);
    } finally {
      setSearching(false);
    }
  };

  const loadPage = (page: number, tab: TabType) => {
    if (tab === "all") {
      searchAll(page);
    } else if (tab === "individual") {
      searchIndividual(page);
    } else if (tab === "family") {
      searchFamily(page);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCurrentResult = () => {
    if (activeTab === "all") return allResult;
    if (activeTab === "individual") return individualResult;
    if (activeTab === "family") return familyResult;
    return null;
  };

  const currentResult = getCurrentResult();

  const allCount = allResult?.totalElements || 0;
  const individualCount = individualResult?.totalElements || 0;
  const familyCount = familyResult?.totalElements || 0;

  const renderHistories = (histories: PatientHistory[]) => {
    return histories.map(h => {
      const displayName = h.appointmentType === "FAMILY" && h.familyMemberName 
        ? h.familyMemberName 
        : h.patientName;
      
      return (
        <div
          key={h.id}
          className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col gap-3 hover:border-[#00685C]/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-bold text-[#0B1C30]">
                  {displayName}
                </p>
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
              {h.appointmentType === "FAMILY" && h.patientName && h.patientName !== h.familyMemberName && (
                <p className="text-xs text-[#94A3B8]">
                  Head Patient: {h.patientName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PAYMENT_COLORS[h.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                {h.paymentStatus}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[h.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                {h.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#485F83] leading-relaxed bg-[#F8FAFC] rounded-lg px-4 py-3">
            {h.observation || "No observation recorded."}
          </p>

          {/* FDI Tooth Observations Summary */}
          {h.toothObservations && h.toothObservations.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {h.toothObservations.map((obs) => (
                <span
                  key={obs.id}
                  className="text-xs bg-[#F0FDFA] border border-[#00685C]/20 text-[#00685C] px-2 py-0.5 rounded-full"
                  title={`${obs.fdiCode}: ${obs.toothLabel}`}
                >
                  {obs.fdiCode}
                </span>
              ))}
              <span className="text-xs text-[#94A3B8] ml-1">
                ({h.toothObservations.length} teeth)
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#3D4946]">
                Amount:{" "}
                <span className="font-bold text-[#0B1C30]">
                  ₦{typeof h.amount === "number" ? h.amount.toLocaleString() : h.amount}
                </span>
              </p>
              {h.balance !== undefined && h.balance > 0 && (
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Balance: ₦{typeof h.balance === "number" ? h.balance.toLocaleString() : h.balance}
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
          <h2 className="text-xl font-bold text-[#0B1C30]">Patient History Search</h2>
          <p className="text-sm text-[#94A3B8]">
            Enter a patient ID to view their full history records.
          </p>
          <div className="flex gap-3 mt-2">
            <div className="relative flex-1 max-w-lg">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search by patient ID…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && search(0)}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-11 pr-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors placeholder:text-[#94A3B8]"
              />
            </div>
            <button
              onClick={() => search(0)}
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

        {!hasSearched && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 bg-[#F0FDFA] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-[#0B1C30]">Search for a patient</p>
            <p className="text-sm text-[#94A3B8] text-center max-w-xs">
              Enter a patient ID to retrieve their complete history records.
            </p>
          </div>
        )}

        {currentResult && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#CCFBF1] flex items-center justify-center text-base font-bold text-[#0F766E] flex-shrink-0">
                {currentResult.patient.initials}
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-[#0B1C30]">{currentResult.patient.fullName}</p>
                <p className="text-xs text-[#94A3B8]">
                  Patient ID: {currentResult.patient.id.slice(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#00685C]">{currentResult.totalElements}</p>
                <p className="text-xs text-[#94A3B8]">history records</p>
              </div>
            </div>

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
              <button
                onClick={() => setActiveTab("individual")}
                className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === "individual"
                    ? "border-[#00685C] text-[#00685C]"
                    : "border-transparent text-[#94A3B8] hover:text-[#3D4946]"
                }`}
              >
                Individual ({individualCount})
              </button>
              <button
                onClick={() => setActiveTab("family")}
                className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === "family"
                    ? "border-[#00685C] text-[#00685C]"
                    : "border-transparent text-[#94A3B8] hover:text-[#3D4946]"
                }`}
              >
                Family ({familyCount})
              </button>
            </div>

            {currentResult.histories.length === 0 ? (
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 text-center shadow-sm">
                <p className="text-sm text-[#94A3B8]">No {activeTab} history records found for this patient.</p>
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