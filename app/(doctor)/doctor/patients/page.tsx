"use client";

import { useState } from "react";
import Link from "next/link";

type HistoryEntry = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  appointmentDate: string;
  amount: number;
  paymentStatus: string;
  status: string;
  observation: string;
  createdAt: string;
};

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
  histories: HistoryEntry[];
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

  const token = () => (typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "");
  const authHeader = () => ({ Authorization: `Bearer ${token()}` });

  const search = async (page = 0) => {
    const q = query.trim();
    if (!q) return;

    setSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      // Step 1: find the patient by name or ID from the patients list
      const patientsRes = await fetch("/api/admin/patients", { headers: authHeader() });
      const patientsResult = await patientsRes.json();

      if (!patientsResult.success) {
        setError(patientsResult.message);
        setResult(null);
        return;
      }

      const patients: Patient[] = patientsResult.data;
      const lq = q.toLowerCase();
      const matched = patients.find(
        p =>
          p.fullName.toLowerCase().includes(lq) ||
          p.id.toLowerCase().includes(lq) ||
          p.shortId.toLowerCase().includes(lq)
      );

      if (!matched) {
        setError(`No patient found matching "${q}".`);
        setResult(null);
        return;
      }

      // Step 2: fetch histories for that patient
      const histRes = await fetch(
        `/api/patient-history/patient/${matched.id}?page=${page}&size=10`,
        { headers: authHeader() }
      );
      const histResult = await histRes.json();

      if (!histResult.success) {
        setError(histResult.message);
        setResult(null);
        return;
      }

      setResult({
        patient: matched,
        histories: histResult.data.content,
        totalElements: histResult.data.totalElements,
        totalPages: histResult.data.totalPages,
        currentPage: histResult.data.number,
      });
    } catch {
      setError("Search failed. Please try again.");
      setResult(null);
    } finally {
      setSearching(false);
    }
  };

  const loadPage = (page: number) => {
    search(page);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10 flex flex-col gap-6">

        {/* Search bar */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#0B1C30]">Patient History Search</h2>
          <p className="text-sm text-[#94A3B8]">
            Enter a patient name or ID to view their full history records.
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
                placeholder="Search by patient name or ID…"
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
              Enter a patient&apos;s full name or UUID to retrieve their complete history records.
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
                  {result.patient.shortId} · {result.patient.gender} ·{" "}
                  {new Date(result.patient.dateOfBirth).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
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
                          {h.appointmentDate} · Appt {h.appointmentId.slice(-8).toUpperCase()}
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
                      <p className="text-sm text-[#3D4946]">
                        Amount:{" "}
                        <span className="font-bold text-[#0B1C30]">
                          ${typeof h.amount === "number" ? h.amount.toLocaleString() : h.amount}
                        </span>
                      </p>
                      <Link
                        href={`/doctor/record/${h.id}`}
                        className="text-xs font-semibold text-[#0D9488] hover:underline flex items-center gap-1"
                      >
                        Open Record
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
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
    </div>
  );
}
