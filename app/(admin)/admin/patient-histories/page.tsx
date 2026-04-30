"use client";

import { useEffect, useState } from "react";

type PatientHistory = {
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
  amount: string;
  paymentStatus: string;
  status: string;
  observation: string;
  createdAt: string;
};

type SelectedHistory = PatientHistory & { balance?: string };

type Appointment = {
  id: string;
  rawId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
};

const PAYMENT_COLORS: Record<string, string> = {
  PAID:    "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  UNPAID:  "bg-[#FFDAD6] text-[#93000A]",
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED:   "bg-[#F0FDFA] text-[#0F766E]",
  IN_PROGRESS: "bg-[#E5EEFF] text-[#435B7E]",
  PENDING:     "bg-[#FEF3C7] text-[#92400E]",
};

export default function PatientHistoriesPage() {
  const [histories, setHistories] = useState<PatientHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [selectedHistory, setSelectedHistory] = useState<SelectedHistory | null>(null);

  // Create panel state
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createApptId, setCreateApptId] = useState("");
  const [createAmount, setCreateAmount] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const token = () => (typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "");
  const authHeader = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/patient-histories", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
        });
        const result = await res.json();
        if (result.success) {
          const historiesWithBalance = result.data.map((h: PatientHistory) => ({
            ...h,
            balance: calculateBalance(h.amount, h.paymentStatus)
          }));
          setHistories(historiesWithBalance);
        } else {
          setError(result.message);
        }
      } catch {
        setError("Failed to load patient histories.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const calculateBalance = (amount: string, paymentStatus: string) => {
    if (paymentStatus === "PAID") return "$0";
    if (paymentStatus === "UNPAID") return amount;
    return amount;
  };

  const openCreatePanel = () => {
    setCreateApptId("");
    setCreateAmount("");
    setCreateError(null);
    setCreateSuccess(null);
    setShowCreatePanel(true);
  };

  const createHistory = async () => {
    if (!createApptId.trim()) return setCreateError("Please enter an appointment ID.");
    const amount = parseFloat(createAmount);
    if (!createAmount || isNaN(amount) || amount <= 0) return setCreateError("Amount must be a positive number.");
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      const res = await fetch("/api/patient-history", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ appointmentId: createApptId, amount }),
      });
      const result = await res.json();
      if (result.success) {
        setCreateSuccess(result.message);
        setTimeout(() => {
          setShowCreatePanel(false);
          setCreateApptId("");
          setCreateAmount("");
        }, 1500);
        // Refresh the list
        const listRes = await fetch("/api/admin/patient-histories", { headers: authHeader() });
        const listResult = await listRes.json();
        if (listResult.success) {
          setHistories(listResult.data.map((h: PatientHistory) => ({
            ...h,
            balance: calculateBalance(h.amount, h.paymentStatus),
          })));
        }
      } else {
        setCreateError(result.message);
      }
    } catch {
      setCreateError("Failed to create patient history.");
    } finally {
      setCreating(false);
    }
  };

  const visible = histories.filter(h => {
    const matchesSearch =
      h.patientName.toLowerCase().includes(search.toLowerCase()) ||
      h.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      h.shortId.toLowerCase().includes(search.toLowerCase());
    const matchesPayment = paymentFilter === "All" || h.paymentStatus === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  // Summary stats
  const totalAmount = histories.reduce((sum, h) => {
    const num = parseFloat(h.amount.replace(/[$,]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
  const paidCount = histories.filter(h => h.paymentStatus === "PAID").length;
  const unpaidCount = histories.filter(h => h.paymentStatus !== "PAID").length;

  const openDetails = (history: PatientHistory) => {
    const balance = calculateBalance(history.amount, history.paymentStatus);
    setSelectedHistory({ ...history, balance });
  };

  const closeDetails = () => {
    setSelectedHistory(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10 flex flex-col gap-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/2 mb-3" />
                <div className="h-8 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
              </div>
            ))
          ) : (
            <>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                <p className="text-sm text-[#3D4946]">Total Records</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">{histories.length}</p>
                <p className="text-xs text-[#0D9488] mt-1">Patient history entries</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                <p className="text-sm text-[#3D4946]">Total Billed</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">
                  ${totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-[#0D9488] mt-1">
                  {paidCount} paid · {unpaidCount} outstanding
                </p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                <p className="text-sm text-[#3D4946]">Completion Rate</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">
                  {histories.length
                    ? `${Math.round((histories.filter(h => h.status === "COMPLETED").length / histories.length) * 100)}%`
                    : "—"}
                </p>
                <p className="text-xs text-[#0D9488] mt-1">Treatments completed</p>
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            {["All", "PAID", "PENDING", "UNPAID"].map(f => (
              <button
                key={f}
                onClick={() => setPaymentFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  paymentFilter === f
                    ? "bg-[#00685C] text-white"
                    : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search by patient, doctor or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-72"
            />
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
        </div>

        {/* Error */}
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
                {["ID", "PATIENT", "DOCTOR", "APPOINTMENT DATE", "PAYMENT STATUS", "HISTORY STATUS", "ACTIONS"].map(h => (
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
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                    No patient history records found.
                  </td>
                </tr>
              ) : (
                visible.map((h) => (
                  <tr key={h.id} className="hover:bg-[#F8FAFC] transition-colors border-t border-[#F8FAFC]">
                    <td className="px-6 py-4 text-sm font-semibold text-[#0D9488]">{h.shortId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
                          {h.initials}
                        </div>
                        <span className="text-sm font-semibold text-[#0B1C30]">{h.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#3D4946]">{h.doctorName}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#0B1C30]">{h.date}</p>
                      <p className="text-xs text-[#3D4946]">{h.time}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${PAYMENT_COLORS[h.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                        {h.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[h.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
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
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {!loading && (
          <p className="text-sm text-[#3D4946]">
            Showing {visible.length} of {histories.length} records
          </p>
        )}
      </main>

      {/* Modal/Popup for Detailed Information */}
      {selectedHistory && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#F1F5F9]">
              <h2 className="text-xl font-bold text-[#0B1C30]">Patient History Details</h2>
              <button
                onClick={closeDetails}
                className="text-[#94A3B8] hover:text-[#475569] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Information Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Record ID</p>
                  <p className="text-sm font-semibold text-[#0D9488] mt-1">{selectedHistory.shortId}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Appointment ID</p>
                  <p className="text-sm font-semibold text-[#0D9488] mt-1">{selectedHistory.appointmentId.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              {/* Patient & Doctor Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-2">Patient Information</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#CCFBF1] flex items-center justify-center text-sm font-bold text-[#0F766E]">
                      {selectedHistory.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0B1C30]">{selectedHistory.patientName}</p>
                      <p className="text-xs text-[#3D4946]">Patient ID: {selectedHistory.patientId?.slice(-8) || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-2">Doctor Information</p>
                  <div>
                    <p className="text-sm font-semibold text-[#0B1C30]">{selectedHistory.doctorName}</p>
                    <p className="text-xs text-[#3D4946]">Doctor ID: {selectedHistory.doctorId?.slice(-8) || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
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
                    <p className="text-xs text-[#94A3B8]">Recorded On</p>
                    <p className="text-sm font-medium text-[#0B1C30]">{selectedHistory.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">History Status</p>
                    <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[selectedHistory.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                      {selectedHistory.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-3">Financial Details</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-[#94A3B8]">Amount</p>
                    <p className="text-sm font-bold text-[#0B1C30]">{selectedHistory.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Balance</p>
                    <p className="text-sm font-bold text-[#0D9488]">{selectedHistory.balance}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Payment Status</p>
                    <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${PAYMENT_COLORS[selectedHistory.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                      {selectedHistory.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical Observation */}
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-2">Clinical Observation</p>
                <p className="text-sm text-[#485F83] leading-relaxed">
                  {selectedHistory.observation || "No observation notes available"}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
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

      {/* Create Patient History Modal */}
      {showCreatePanel && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !creating) {
              setShowCreatePanel(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#F1F5F9]">
              <h2 className="text-xl font-bold text-[#0B1C30]">Create Patient History</h2>
              <button
                onClick={() => !creating && setShowCreatePanel(false)}
                disabled={creating}
                className="text-[#94A3B8] hover:text-[#475569] transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Success Message */}
              {createSuccess && (
                <div className="bg-[#DCFCE7] text-[#166534] text-sm font-semibold px-4 py-3 rounded-lg">
                  {createSuccess}
                </div>
              )}

              {/* Error Message */}
              {createError && (
                <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                  {createError}
                </div>
              )}

              {/* Appointment ID Input */}
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
                  Enter the appointment ID to link this history record
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                  Amount ($) <span className="text-[#93000A]">*</span>
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
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#F1F5F9]">
              <button
                onClick={() => setShowCreatePanel(false)}
                disabled={creating}
                className="px-4 py-2 text-sm font-semibold text-[#3D4946] hover:text-[#0B1C30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={createHistory}
                disabled={creating}
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
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}