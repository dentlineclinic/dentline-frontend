"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  patientName: string;
  procedure: string;
  amount: string;
  balance: string;
  date: string;
  paymentStatus: string;
};

type Summary = {
  totalRevenue: string;
  pendingAmount: string;
  pendingCount: number;
};

const STATUS_COLORS: Record<string, string> = {
  Paid:    "bg-[#F0FDFA] text-[#0F766E]",
  Pending: "bg-[#FEF3C7] text-[#92400E]",
  Unpaid:  "bg-[#FFDAD6] text-[#93000A]",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/payments", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
        });
        const result = await res.json();
        if (result.success) {
          setPayments(result.data.payments);
          setSummary(result.data.summary);
        } else {
          setError(result.message);
        }
      } catch {
        setError("Failed to load payments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10 flex flex-col gap-6">
        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6">
          {loading ? (
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
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">{summary?.totalRevenue ?? "—"}</p>
                <p className="text-xs text-[#0D9488] mt-1">All time (paid)</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                <p className="text-sm text-[#3D4946]">Pending Payments</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">{summary?.pendingAmount ?? "—"}</p>
                <p className="text-xs text-[#0D9488] mt-1">{summary?.pendingCount ?? 0} invoices</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                <p className="text-sm text-[#3D4946]">Total Records</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">{payments.length}</p>
                <p className="text-xs text-[#0D9488] mt-1">Payment entries</p>
              </div>
            </>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
            <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
              <tr>
                {["PAYMENT ID", "PATIENT", "PROCEDURE", "AMOUNT", "BALANCE", "DATE", "STATUS"].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-[#F8FAFC]">
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p, i) => (
                  <tr key={p.id} className={`${i > 0 ? "border-t border-[#F8FAFC]" : ""} hover:bg-[#F8FAFC] transition-colors`}>
                    <td className="px-6 py-4 text-sm font-semibold text-[#0D9488]">{p.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#0B1C30]">{p.patientName}</td>
                    <td className="px-6 py-4 text-sm text-[#3D4946] max-w-[180px] truncate">{p.procedure}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#0B1C30]">{p.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${p.balance === "$0" || p.balance === "$0.00" ? "text-[#0F766E]" : "text-[#93000A]"}`}>
                        {p.balance}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#3D4946]">{p.date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[p.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </main>
    </div>
  );
}
