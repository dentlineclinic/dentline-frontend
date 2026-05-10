"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchPayments,
  recordPayment,
  markPaymentUnpaid,
} from "@/services/patientHistoryService";

export const dynamic = "force-dynamic";

type HistoryRow = {
  id: string;
  shortId: string;
  patientName: string;
  initials: string;
  doctorName: string;
  observation: string;
  date: string;
  time: string;
  amount: number;
  balance: number;
  paymentStatus: string;
};

type SummaryData = {
  totalRevenue: number;
  totalPending: number;
  totalPendingRecords: number;
};

const PAYMENT_COLORS: Record<string, string> = {
  PAID:    "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  PARTIAL: "bg-[#FEF3C7] text-[#92400E]",
  UNPAID:  "bg-[#FEE2E2] text-[#991B1B]", // 👈 add this
};

// ✅ Move formatter outside component to avoid recreation
const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

const fmt = (n: number) => currencyFormatter.format(n);

function formatDateSafe(raw: string | null | undefined) {
  if (!raw) return { date: "—", time: "—" };
  const d = new Date(raw);
  if (isNaN(d.getTime())) return { date: "—", time: "—" };
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function initials(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PaymentsPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData>({
    totalRevenue: 0,
    totalPending: 0,
    totalPendingRecords: 0,
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  // Search - will move to backend in next phase
  const [search, setSearch] = useState("");

  // Selected row for side panel
  const [selected, setSelected] = useState<HistoryRow | null>(null);

  // Record payment panel
  const [payAmount, setPayAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Page-level success banner
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ✅ Load ONLY payments (not summary)
  const loadPayments = useCallback(async (p: number, searchTerm?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetchPayments(p, size);
      
      const mapped: HistoryRow[] = res.data.content.map((h: any) => {
        const { date, time } = formatDateSafe(h.createdAt);
        
        // ✅ Safely map payment status - handle PARTIAL, remove UNPAID assumption
        const paymentStatus = h.paymentStatus || "PENDING";

        return {
          id: h.id,
          shortId: `PAY-${h.id.slice(0, 6).toUpperCase()}`,
          patientName: h.patientName || "Unknown",
          initials: initials(h.patientName || ""),
          doctorName: h.doctorName || "Unknown",
          observation: h.observation || "—",
          date,
          time,
          amount: h.amount ?? 0,
          balance: h.balance ?? 0,
          paymentStatus,
        };
      });

      setRows(mapped);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err: any) {
      console.error("Failed to load payments:", err);
      setError(err?.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, [size]);

  // ✅ Load payments when page or search changes (with debounce)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadPayments(page, search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [page, search, loadPayments]);

  // Client-side search temporarily (until backend search is implemented)
  const visible = search.trim() === "" 
    ? rows 
    : rows.filter((r) => 
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.doctorName.toLowerCase().includes(search.toLowerCase()) ||
        r.shortId.toLowerCase().includes(search.toLowerCase())
      );

  // ── Actions ────────────────────────────────────────────────────────────────

  const showBanner = (msg: string) => {
    setPageSuccess(msg);
    setTimeout(() => setPageSuccess(null), 5000);
  };

  const refreshAllData = async () => {
    await loadPayments(page, search);
  };

  const handleRecordPayment = async () => {
    if (!selected) return;
    const amount = parseFloat(payAmount);
    if (!payAmount || isNaN(amount) || amount <= 0) {
      setActionError("Enter a valid amount greater than 0.");
      return;
    }
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await recordPayment(selected.id, amount);
      setActionSuccess("Payment recorded successfully.");
      setPayAmount("");
      showBanner(`Payment of ${fmt(amount)} recorded for ${selected.patientName}.`);
      
      await refreshAllData();
      setSelected(null);
    } catch (e: any) {
      setActionError(e?.response?.data?.message || "Failed to record payment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnpaid = async () => {
    if (!selected) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await markPaymentUnpaid(selected.id);
      setActionSuccess("Payment status marked as UNPAID. You can now record a payment.");
      showBanner(`${selected.patientName}'s payment marked as unpaid.`);
      // Refresh table data
      await loadPayments(page, search);
      // Update the selected row's status in-place so the panel switches to record payment
      setSelected((prev) => prev ? { ...prev, paymentStatus: "UNPAID" } : null);
    } catch (e: any) {
      setActionError(e?.response?.data?.message || "Failed to mark as unpaid.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">

        {/* Page-level success banner */}
        {pageSuccess && (
          <div className="flex items-center gap-3 bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] px-4 py-3 rounded-lg text-sm font-semibold">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pageSuccess}
            <button onClick={() => setPageSuccess(null)} className="ml-auto">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {loading && rows.length === 0 ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/2 mb-3" />
                <div className="h-8 bg-[#F1F5F9] rounded animate-pulse w-3/4 mb-2" />
                <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/3" />
              </div>
            ))
          ) : (
            <>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                <p className="text-sm text-[#3D4946]">Total Revenue</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">{fmt(summary.totalRevenue)}</p>
                <p className="text-xs text-[#0D9488] mt-1">Total revenue (all records)</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                <p className="text-sm text-[#3D4946]">Pending Payments</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">{fmt(summary.totalPending)}</p>
                <p className="text-xs text-[#0D9488] mt-1">{summary.totalPendingRecords} unpaid/pending records</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                <p className="text-sm text-[#3D4946]">Total Records</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">{totalElements}</p>
                <p className="text-xs text-[#0D9488] mt-1">All payment entries</p>
              </div>
            </>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          <input
            type="search"
            placeholder="Search by patient, doctor or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-full sm:w-72"
          />
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  {["ID", "PATIENT", "DOCTOR", "DATE", "AMOUNT", "BALANCE", "PAYMENT STATUS", ""].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0 ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-t border-[#F8FAFC]">
                      {[...Array(8)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  visible.map((r, i) => (
                    <tr
                      key={r.id}
                      onClick={() => {
                        setSelected(r);
                        setPayAmount("");
                        setActionError(null);
                        setActionSuccess(null);
                      }}
                      className={`${i > 0 ? "border-t border-[#F8FAFC]" : ""} hover:bg-[#F8FAFC] transition-colors cursor-pointer ${selected?.id === r.id ? "bg-[#F0FDFA]" : ""}`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-[#0D9488]">{r.shortId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
                            {r.initials}
                          </div>
                          <span className="text-sm font-semibold text-[#0B1C30]">{r.patientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">{r.doctorName}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#0B1C30]">{r.date}</p>
                        <p className="text-xs text-[#94A3B8]">{r.time}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#0B1C30]">{fmt(r.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${r.balance === 0 ? "text-[#0F766E]" : "text-[#93000A]"}`}>
                          {fmt(r.balance)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${PAYMENT_COLORS[r.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                          {r.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <svg className="w-4 h-4 text-[#94A3B8] inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-[#3D4946]">Page {page + 1} of {totalPages}</span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {!loading && (
          <p className="text-sm text-[#3D4946]">
            Showing {visible.length} of {totalElements} records
          </p>
        )}
      </main>

      {/* Overlay and Side Panel */}
      {selected && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
          onClick={() => setSelected(null)}
        />
      )}

      {/* Detail / action panel */}
      {selected && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
            <h2 className="text-base font-bold text-[#0B1C30]">Payment Details</h2>
            <button onClick={() => setSelected(null)} className="text-[#94A3B8] hover:text-[#475569]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            {/* Patient */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#CCFBF1] flex items-center justify-center text-base font-bold text-[#0F766E] flex-shrink-0">
                {selected.initials}
              </div>
              <div>
                <p className="text-base font-bold text-[#0B1C30]">{selected.patientName}</p>
                <p className="text-xs text-[#94A3B8]">{selected.shortId}</p>
                <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${PAYMENT_COLORS[selected.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                  {selected.paymentStatus}
                </span>
              </div>
            </div>

            {/* Info grid */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 grid grid-cols-2 gap-4">
              {[
                { label: "Doctor", value: selected.doctorName },
                { label: "Date", value: `${selected.date} ${selected.time}` },
                { label: "Amount", value: fmt(selected.amount) },
                { label: "Balance", value: fmt(selected.balance) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">{label}</p>
                  <p className="text-sm font-semibold text-[#0B1C30] mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Observation */}
            <div>
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Observation</p>
              <p className="text-sm text-[#485F83] bg-[#F8FAFC] rounded-lg p-3 leading-relaxed">
                {selected.observation}
              </p>
            </div>

            {/* Feedback */}
            {actionSuccess && (
              <div className="bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] text-sm font-semibold px-4 py-3 rounded-lg">
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="bg-[#FFDAD6] border border-[#FCA5A5] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                {actionError}
              </div>
            )}

            {/*
              Action logic:
              - PAID    → only "Mark as Unpaid" (revert)
              - PENDING → only "Mark as Unpaid" first; once marked UNPAID the record
                          payment form will appear on next open
              - UNPAID  → only "Record Payment" form
            */}

            {/* PAID: revert only */}
            {selected.paymentStatus === "PAID" && (
              <div className="flex flex-col gap-2 border border-[#E2E8F0] rounded-xl p-4">
                <p className="text-sm font-bold text-[#0B1C30]">Revert Payment</p>
                <p className="text-xs text-[#94A3B8]">
                  Mark this record as unpaid if the payment was recorded in error.
                </p>
                <button
                  onClick={handleMarkUnpaid}
                  disabled={actionLoading}
                  className="w-full bg-[#93000A] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#BA1A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : "Mark as Unpaid"}
                </button>
              </div>
            )}

            {/* PENDING: must mark unpaid before payment can be recorded */}
            {selected.paymentStatus === "PENDING" && (
              <div className="flex flex-col gap-2 border border-[#FEF3C7] bg-[#FFFBEB] rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#92400E] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-bold text-[#92400E]">Payment Pending</p>
                </div>
                <p className="text-xs text-[#92400E]">
                  This record is pending. Click below to mark it as unpaid so you can record a payment.
                </p>
                <button
                  onClick={handleMarkUnpaid}
                  disabled={actionLoading}
                  className="w-full bg-[#92400E] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#78350F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : "Mark as Unpaid to Record Payment"}
                </button>
              </div>
            )}

            {/* UNPAID: record payment directly */}
            {selected.paymentStatus === "UNPAID" && (
              <div className="flex flex-col gap-3 border border-[#E2E8F0] rounded-xl p-4">
                <div>
                  <p className="text-sm font-bold text-[#0B1C30]">Record Payment</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Amount must be ≤ balance ({fmt(selected.balance)}). Partial payments are allowed.
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={selected.balance}
                    placeholder={`Max ${fmt(selected.balance)}`}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    disabled={actionLoading}
                    className="flex-1 bg-white border border-[#F1F5F9] rounded-lg px-3 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                  />
                  <button
                    onClick={handleRecordPayment}
                    disabled={actionLoading}
                    className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : "Record"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#F1F5F9]">
            <button
              onClick={() => setSelected(null)}
              className="w-full py-2.5 text-sm font-semibold text-[#3D4946] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}