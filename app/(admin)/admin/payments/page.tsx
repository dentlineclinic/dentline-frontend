"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useAllClinicalRecords } from "@/hooks/useClinicalRecords";
import { ClinicalModule } from "@/services/clinicalRecordService";
import {
  recordPayment,
  markPaymentUnpaid,
  recordDermatologyPayment,
  markDermatologyPaymentUnpaid,
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
  amount: number | null;
  discount: number;
  amountPaid: number;
  balance: number;
  paymentStatus: string;
  isCheckUp: boolean;
  module: ClinicalModule;
};

type ModuleFilter = "ALL" | ClinicalModule;

const PAYMENT_COLORS: Record<string, string> = {
  PAID: "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  PARTIAL: "bg-[#FEF3C7] text-[#92400E]",
  UNPAID: "bg-[#FEE2E2] text-[#991B1B]",
};

const MODULE_COLORS: Record<string, string> = {
  DENTAL: "bg-[#E5EEFF] text-[#1E40AF]",
  DERMATOLOGY: "bg-[#FCE7F3] text-[#9D174D]",
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

const fmt = (n: number) => currencyFormatter.format(n);

const formatDateSafe = (raw: string | null | undefined) => {
  if (!raw) return { date: "—", time: "—" };
  const d = new Date(raw);
  if (isNaN(d.getTime())) return { date: "—", time: "—" };
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};

const initials = (name: string) => {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("ALL");
  const [selected, setSelected] = useState<HistoryRow | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [page, setPage] = useState(0);
  const size = 10;

  const recordTypeParam: ClinicalModule | undefined =
    moduleFilter === "ALL" ? undefined : moduleFilter;

  const { data, isLoading, isError, error, refetch } = useAllClinicalRecords(
    page,
    size,
    recordTypeParam
  );

  const rows: HistoryRow[] = useMemo(() => {
    const records = data?.content ?? [];
    return records.map((h) => {
      const { date, time } = formatDateSafe(h.appointmentDate || h.createdAt);
      const checkUp = h.amount === null || h.amount === undefined;

      return {
        id: h.id,
        shortId: `${h.recordType === "DENTAL" ? "PAY" : "DERM"}-${h.id.slice(0, 6).toUpperCase()}`,
        patientName: h.patientName || "Unknown",
        initials: initials(h.patientName || ""),
        doctorName: h.doctorName || "Unknown",
        observation: h.summary || "—",
        date,
        time,
        amount: h.amount ?? null,
        discount: h.discount ?? 0,
        amountPaid: h.amountPaid ?? 0,
        balance: h.balance ?? 0,
        paymentStatus: h.paymentStatus || "PENDING",
        isCheckUp: checkUp,
        module: h.recordType,
      };
    });
  }, [data]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        r.patientName.toLowerCase().includes(term) ||
        r.doctorName.toLowerCase().includes(term) ||
        r.shortId.toLowerCase().includes(term)
    );
  }, [rows, search]);

  useEffect(() => {
    setPage(0);
  }, [moduleFilter, search]);

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const pageTotals = useMemo(() => {
    const billed = filteredRows.reduce((s, r) => s + (r.amount ?? 0), 0);
    const outstanding = filteredRows.reduce((s, r) => s + (r.balance ?? 0), 0);
    return { billed, outstanding, count: filteredRows.length };
  }, [filteredRows]);

  const dentalCount = rows.filter((r) => r.module === "DENTAL").length;
  const dermCount = rows.filter((r) => r.module === "DERMATOLOGY").length;

  // ── Record payment (routes to the right endpoint based on module) ─────────
  const handleRecordPayment = async () => {
    if (!selected) return;

    const amount = parseFloat(payAmount);
    if (!payAmount || isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount greater than 0.");
      return;
    }

    if (amount > selected.balance) {
      toast.error(`Amount exceeds outstanding balance of ${fmt(selected.balance)}.`);
      return;
    }

    setActionLoading(true);
    try {
      if (selected.module === "DERMATOLOGY") {
        await recordDermatologyPayment(selected.id, amount);
      } else {
        await recordPayment(selected.id, amount);
      }
      toast.success(`Payment of ${fmt(amount)} recorded for ${selected.patientName}.`);
      setPayAmount("");
      await refetch();
      setSelected(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to record payment.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Mark unpaid — both modules ───────────────────────────────────────────
  const handleMarkUnpaid = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      if (selected.module === "DERMATOLOGY") {
        await markDermatologyPaymentUnpaid(selected.id);
      } else {
        await markPaymentUnpaid(selected.id);
      }
      toast.success(`${selected.patientName}'s payment marked as unpaid.`);
      await refetch();
      setSelected((prev) => (prev ? { ...prev, paymentStatus: "UNPAID" } : null));
    } catch (e: any) {
      toast.error(e.message || "Failed to mark as unpaid.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
            <p className="text-sm text-[#3D4946]">Total Billed (this page)</p>
            <p className="text-3xl font-bold text-[#0B1C30] mt-1">
              {fmt(pageTotals.billed)}
            </p>
            <p className="text-xs text-[#0D9488] mt-1">
              Aggregated across all clinical modules
            </p>
          </div>
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
            <p className="text-sm text-[#3D4946]">Outstanding (this page)</p>
            <p className="text-3xl font-bold text-[#0B1C30] mt-1">
              {fmt(pageTotals.outstanding)}
            </p>
            <p className="text-xs text-[#0D9488] mt-1">
              Total unpaid / pending amount
            </p>
          </div>
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
            <p className="text-sm text-[#3D4946]">Records (this page)</p>
            <p className="text-3xl font-bold text-[#0B1C30] mt-1">
              {pageTotals.count}
            </p>
            <p className="text-xs text-[#0D9488] mt-1">
              Showing {pageTotals.count} of {totalElements}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="search"
              placeholder="Search by patient, doctor or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-full sm:w-72"
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
        </div>

        {isError && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {(error as any)?.message || "Failed to load payments."}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  {["ID", "MODULE", "PATIENT", "DOCTOR", "DATE", "AMOUNT", "DISCOUNT", "AMOUNT PAID", "BALANCE", "STATUS", ""].map((h) => (
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
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-t border-[#F8FAFC]">
                      {[...Array(11)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r, i) => (
                    <tr
                      key={r.id}
                      onClick={() => {
                        setSelected(r);
                        setPayAmount("");
                      }}
                      className={`${
                        i > 0 ? "border-t border-[#F8FAFC]" : ""
                      } hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                        selected?.id === r.id ? "bg-[#F0FDFA]" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-[#0D9488]">
                        {r.shortId}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${MODULE_COLORS[r.module]}`}
                        >
                          {r.module === "DERMATOLOGY" ? "Dermatology" : "Dental"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
                            {r.initials}
                          </div>
                          <span className="text-sm font-semibold text-[#0B1C30]">
                            {r.patientName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">{r.doctorName}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#0B1C30]">{r.date}</p>
                        <p className="text-xs text-[#94A3B8]">{r.time}</p>
                      </td>
                      <td className="px-6 py-4">
                        {r.isCheckUp ? (
                          <span className="text-sm font-semibold text-[#0D9488]">Check-up</span>
                        ) : (
                          <span className="text-sm font-bold text-[#0B1C30]">
                            {fmt(r.amount || 0)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#0D9488]">
                        {r.isCheckUp ? "—" : fmt(r.discount || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#2563EB]">
                        {r.isCheckUp ? "—" : fmt(r.amountPaid || 0)}
                      </td>
                      <td className="px-6 py-4">
                        {r.isCheckUp ? (
                          <span className="text-sm font-bold text-[#94A3B8]">—</span>
                        ) : (
                          <span
                            className={`text-sm font-bold ${
                              r.balance === 0 ? "text-[#0F766E]" : "text-[#93000A]"
                            }`}
                          >
                            {fmt(r.balance)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            PAYMENT_COLORS[r.paymentStatus] ??
                            "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {r.isCheckUp ? "COMPLETED" : r.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <svg
                          className="w-4 h-4 text-[#94A3B8] inline"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
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
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-[#3D4946]">
              Page {page + 1} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
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

      {/* Overlay */}
      {selected && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
          onClick={() => setSelected(null)}
        />
      )}

      {/* Drawer */}
      {selected && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-base font-bold text-[#0B1C30]">Payment Details</h2>
              <span
                className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  MODULE_COLORS[selected.module]
                }`}
              >
                {selected.module === "DERMATOLOGY" ? "Dermatology" : "Dental"}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-[#94A3B8] hover:text-[#475569]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#CCFBF1] flex items-center justify-center text-base font-bold text-[#0F766E] flex-shrink-0">
                {selected.initials}
              </div>
              <div>
                <p className="text-base font-bold text-[#0B1C30]">{selected.patientName}</p>
                <p className="text-xs text-[#94A3B8]">{selected.shortId}</p>
                <span
                  className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    PAYMENT_COLORS[selected.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {selected.isCheckUp ? "COMPLETED (No Charge)" : selected.paymentStatus}
                </span>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl p-4 grid grid-cols-2 gap-4">
              {selected.isCheckUp ? (
                <div className="col-span-2 bg-[#F0FDFA] rounded-lg p-4 text-center border border-[#0D9488]">
                  <p className="text-sm font-semibold text-[#0F766E]">
                    Check-up / No Charge Visit
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    This is a non-financial clinical record
                  </p>
                </div>
              ) : (
                <>
                  {[
                    { label: "Doctor", value: selected.doctorName },
                    { label: "Date", value: `${selected.date} ${selected.time}` },
                    { label: "Amount", value: fmt(selected.amount || 0) },
                    { label: "Discount", value: fmt(selected.discount || 0) },
                    { label: "Amount Paid", value: fmt(selected.amountPaid || 0) },
                    { label: "Balance", value: fmt(selected.balance) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-[#0B1C30] mt-0.5">{value}</p>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-1">
                Observation
              </p>
              <p className="text-sm text-[#485F83] bg-[#F8FAFC] rounded-lg p-3 leading-relaxed">
                {selected.observation}
              </p>
            </div>

            {!selected.isCheckUp && (
              <>
                {selected.paymentStatus === "PAID" && (
                  <div className="flex flex-col gap-2 border border-[#E2E8F0] rounded-xl p-4">
                    <p className="text-sm font-bold text-[#0B1C30]">Revert Payment</p>
                    <p className="text-xs text-[#94A3B8]">
                      Mark this record as unpaid if the payment was recorded in error.
                    </p>
                    <button
                      onClick={handleMarkUnpaid}
                      disabled={actionLoading}
                      className="w-full bg-[#93000A] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#BA1A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? "Processing…" : "Mark as Unpaid"}
                    </button>
                  </div>
                )}

                {selected.paymentStatus === "PENDING" && (
                  <div className="flex flex-col gap-2 border border-[#FEF3C7] bg-[#FFFBEB] rounded-xl p-4">
                    <p className="text-sm font-bold text-[#92400E]">Payment Pending</p>
                    <p className="text-xs text-[#92400E] opacity-90">
                      Mark as unpaid to enable payment recording, or record directly.
                    </p>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={handleMarkUnpaid}
                        disabled={actionLoading}
                        className="flex-1 bg-[#92400E] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#78350F] transition-colors disabled:opacity-50"
                      >
                        Mark Unpaid
                      </button>
                    </div>
                   
                    </div>
                  
                )}

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
                        className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? "…" : "Record"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {selected.isCheckUp && (
              <div className="bg-[#F0FDFA] rounded-lg p-4 text-center border border-[#0D9488]">
                <p className="text-sm font-medium text-[#0F766E]">
                  No payment actions available for check-up records
                </p>
              </div>
            )}
          </div>

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