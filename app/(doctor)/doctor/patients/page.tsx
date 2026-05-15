"use client";

import { useState } from "react";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import { fetchPatientHistoriesById, PatientHistory } from "@/services/patientHistoryService";

// Dynamically import the modal — it's heavy (uploads, observation editor) and only
// needed when a doctor clicks "Quick View". This keeps the initial bundle smaller.
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
  COMPLETED:   "bg-[#DCFCE7] text-[#166534]",
  IN_PROGRESS: "bg-[#FEF3C7] text-[#92400E]",
  PENDING:     "bg-[#E5EEFF] text-[#435B7E]",
};

const PAYMENT_COLORS: Record<string, string> = {
  PAID:    "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  UNPAID:  "bg-[#FFDAD6] text-[#93000A]",
};

export default function DoctorPatientsPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Modal state
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
    // Refresh the search results to show updated observation
    if (result) {
      search(result.currentPage);
    }
  };

  const search = async (page = 0) => {
    const patientId = query.trim();
    if (!patientId) return;

    setSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetchPatientHistoriesById(patientId, page, 10);

      if (!res.success) {
        setError(res.message);
        setResult(null);
        return;
      }

      const histories = res.data.content;

      // Handle empty history case
      if (histories.length === 0) {
        setError("No history found for this patient.");
        setResult(null);
        return;
      }

      setResult({
        patient: {
          id: patientId,
          shortId: patientId.slice(-6),
          fullName: histories[0]?.patientName || "Unknown Patient",
          initials: histories[0]?.patientName
            ?.split(" ")
            .map(n => n[0])
            .join("") || "NA",
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
      setResult(null);
    } finally {
      setSearching(false);
    }
  };

  const loadPage = (page: number) => {
    search(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10 flex flex-col gap-6">

        {/* Search bar */}
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

        {/* Error */}
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
              Enter a patient ID to retrieve their complete history records.
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-5">
            {/* Patient summary card */}
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#CCFBF1] flex items-center justify-center text-base font-bold text-[#0F766E] flex-shrink-0">
                {result.patient.initials}
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-[#0B1C30]">{result.patient.fullName}</p>
                <p className="text-xs text-[#94A3B8]">
                  Patient ID: {result.patient.id.slice(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#00685C]">{result.totalElements}</p>
                <p className="text-xs text-[#94A3B8]">history records</p>
              </div>
            </div>

            {/* History records */}
            {result.histories.length === 0 ? (
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 text-center shadow-sm">
                <p className="text-sm text-[#94A3B8]">No history records found for this patient.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {result.histories.map(h => (
                  <div
                    key={h.id}
                    className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col gap-3"
                  >
                    {/* Row 1: doctor + date + badges */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#0B1C30]">{h.doctorName}</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                          {formatDate(h.appointmentDate)}
                        </p>
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

                    {/* Row 2: observation */}
                    <p className="text-sm text-[#485F83] leading-relaxed bg-[#F8FAFC] rounded-lg px-4 py-3">
                      {h.observation || "No observation recorded."}
                    </p>

                    {/* Row 3: amount + link */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#3D4946]">
                          Amount:{" "}
                          <span className="font-bold text-[#0B1C30]">
                            ${typeof h.amount === "number" ? h.amount.toLocaleString() : h.amount}
                          </span>
                        </p>
                        {h.balance !== undefined && h.balance > 0 && (
                          <p className="text-xs text-[#94A3B8] mt-0.5">
                            Balance: ${typeof h.balance === "number" ? h.balance.toLocaleString() : h.balance}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/doctor/record/${h.id}`}
                          className="text-xs font-semibold text-[#0D9488] hover:underline flex items-center gap-1"
                        >
                          Open Record
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
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
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {result.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#3D4946]">
                  Page {result.currentPage + 1} of {result.totalPages} · {result.totalElements} records
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadPage(result.currentPage - 1)}
                    disabled={result.currentPage === 0 || searching}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E2E8F0] text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  {[...Array(result.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => loadPage(i)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                        i === result.currentPage
                          ? "bg-[#00685C] text-white"
                          : "border border-[#E2E8F0] text-[#3D4946] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => loadPage(result.currentPage + 1)}
                    disabled={result.currentPage >= result.totalPages - 1 || searching}
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

      {/* Patient History Modal */}
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