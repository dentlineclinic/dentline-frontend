"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import {
  fetchPatientHistories,
  fetchPaymentStats,
  createPatientHistory
} from "@/services/patientHistoryService";

export const dynamic = "force-dynamic";

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
  amount: number;
  discount: number;
  balance: number;
  paymentStatus: string;
  status: string;
  observation: string;
  createdAt: string;
  imageUrls: string[];
  videoUrls: string[];
  familyMemberId?: string;
  familyMemberName?: string;
  appointmentType?: "INDIVIDUAL" | "FAMILY";
  headPatientName?: string;
};

export type PaymentStats = {
  totalRecords: number;
  totalBilled: number;
  totalRevenue: number;
  totalOutstanding: number;
  paidCount: number;
  pendingCount: number;
  unpaidCount: number;
  completedCount: number;
  completedRatePercent: number;
};

type SelectedHistory = PatientHistory;

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

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(n);

export default function PatientHistoriesPage() {
  const [histories, setHistories] = useState<PatientHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [selectedHistory, setSelectedHistory] = useState<SelectedHistory | null>(null);
  const [stats, setStats] = useState<PaymentStats | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createApptId, setCreateApptId] = useState("");
  const [createAmount, setCreateAmount] = useState("");
  const [createDiscount, setCreateDiscount] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const calculateBalance = (amount: number, paymentStatus: string): number => {
    return paymentStatus === "PAID" ? 0 : amount;
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

  const getDisplayName = (history: any) => {
    if (history.appointmentType === "FAMILY" && history.familyMemberName) {
      return history.familyMemberName;
    }
    return history.patientName || "Unknown Patient";
  };

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchPaymentStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load payment stats:", err);
    }
  }, []);

  const loadHistories = useCallback(async (pageNum: number, pageSize: number, searchTerm: string, paymentStatus: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchPatientHistories(
        pageNum,
        pageSize,
        searchTerm,
        paymentStatus
      );

      if (res.success) {
        const mapped = res.data.content.map((h) => {
          const { date, time } = formatDateSafe(h.appointmentDate);
          const displayName = getDisplayName(h);

          return {
            id: h.id,
            shortId: `HIS-${h.id.slice(0, 6).toUpperCase()}`,
            patientId: h.patientId,
            patientName: displayName,
            initials: getInitials(displayName),
            doctorId: h.doctorId,
            doctorName: h.doctorName || "Unknown Doctor",
            appointmentId: h.appointmentId,
            date,
            time,
            amount: h.amount ?? 0,
            discount: h.discount ?? 0,
            balance: h.balance ?? calculateBalance(
              h.amount ?? 0,
              h.paymentStatus || "PENDING"
            ),
            paymentStatus: h.paymentStatus || "PENDING",
            status: h.status || "PENDING",
            observation: h.observation || "No observation notes",
            createdAt: h.createdAt ? new Date(h.createdAt).toLocaleString() : "—",
            imageUrls: Array.isArray(h.imageUrls) ? h.imageUrls : [],
            videoUrls: Array.isArray(h.videoUrls) ? h.videoUrls : [],
            familyMemberId: h.familyMemberId,
            familyMemberName: h.familyMemberName,
            appointmentType: h.appointmentType || "INDIVIDUAL",
            headPatientName: h.patientName,
          };
        });

        setHistories(mapped);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      } else {
        setError(res.message || "Failed to load patient histories.");
      }
    } catch (err: any) {
      console.error("Error loading histories:", err);
      setError(err.message || "Failed to load patient histories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const currentPageCompletedCount = histories.filter(h => h.status === "COMPLETED").length;
  const currentPageCompletionRate = histories.length
    ? Math.round((currentPageCompletedCount / histories.length) * 100)
    : 0;

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      loadHistories(page, size, search, paymentFilter);
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [page, search, paymentFilter, loadHistories]);

  const openCreatePanel = () => {
    setCreateApptId("");
    setCreateAmount("");
    setCreateDiscount("");
    setCreateError(null);
    setCreateSuccess(null);
    setShowCreatePanel(true);
  };

  const createHistory = async () => {
    if (!createApptId.trim()) {
      setCreateError("Please enter an appointment ID.");
      return;
    }

    const amount = parseFloat(createAmount);
    if (!createAmount || isNaN(amount) || amount <= 0) {
      setCreateError("Amount must be a positive number.");
      return;
    }

    const discount = parseFloat(createDiscount) || 0;
    if (discount < 0) {
      setCreateError("Discount cannot be negative.");
      return;
    }

    if (discount > amount) {
      setCreateError("Discount cannot exceed the total amount.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const res = await createPatientHistory({
        appointmentId: createApptId,
        amount,
        discount,
      });

      if (res.success) {
        setCreateSuccess(res.message || "Patient history created successfully!");

        setTimeout(async () => {
          await Promise.all([
            loadHistories(page, size, search, paymentFilter),
            loadStats(),
          ]);
          setShowCreatePanel(false);
          setCreateApptId("");
          setCreateAmount("");
          setCreateDiscount("");
        }, 1500);
      } else {
        setCreateError(res.message || "Failed to create patient history.");
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create patient history.");
    } finally {
      setCreating(false);
    }
  };

  const openDetails = (history: PatientHistory) => {
    setSelectedHistory({ ...history });
  };

  const closeDetails = () => {
    setSelectedHistory(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10 flex flex-col gap-6">

        {stats ? (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
              <p className="text-sm text-[#3D4946]">Total Records</p>
              <p className="text-3xl font-bold text-[#0B1C30] mt-1">
                {stats.totalRecords}
              </p>
              <p className="text-xs text-[#0D9488] mt-1">Patient history entries</p>
            </div>

            <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
              <p className="text-sm text-[#3D4946]">Total Revenue</p>
              <p className="text-3xl font-bold text-[#0B1C30] mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs text-[#0D9488] mt-1">
                Outstanding: {formatCurrency(stats.totalOutstanding)}
              </p>
            </div>

            <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
              <p className="text-sm text-[#3D4946]">Payment Breakdown</p>
              <p className="text-xs text-[#3D4946] mt-2">
                Paid: {stats.paidCount} · Pending: {stats.pendingCount} · Unpaid: {stats.unpaidCount}
              </p>
              <p className="text-xs text-[#0D9488] mt-1">
                Completion Rate: {stats.completedRatePercent}%
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/2 mb-3" />
                <div className="h-8 bg-[#F1F5F9] rounded animate-pulse w-3/4 mb-2" />
                <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && histories.length > 0 && (
          <div className="text-xs text-[#94A3B8] bg-[#F8FAFC] rounded-lg px-4 py-2">
            Current page: {histories.length} records ·
            {currentPageCompletedCount} completed ({currentPageCompletionRate}% completion rate)
          </div>
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search by patient, doctor or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  {["ID", "PATIENT", "TYPE", "DOCTOR", "APPOINTMENT DATE", "AMOUNT", "DISCOUNT", "BALANCE", "PAYMENT STATUS", "HISTORY STATUS", "ACTIONS"].map(h => (
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
                      {[...Array(11)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : histories.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                      No patient history records found.
                    </td>
                  </tr>
                ) : (
                  histories.map((h) => {
                    const isFamily = h.appointmentType === "FAMILY";
                    
                    return (
                      <tr key={h.id} className="hover:bg-[#F8FAFC] transition-colors border-t border-[#F8FAFC]">
                        <td className="px-6 py-4 text-sm font-semibold text-[#0D9488]">{h.shortId}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
                              {h.initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#0B1C30]">{h.patientName}</p>
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
                        <td className="px-6 py-4 text-sm font-semibold text-[#0B1C30]">
                          {formatCurrency(h.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#0D9488]">
                          {formatCurrency(h.discount || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold">
                          <span className={h.balance === 0 ? "text-[#0F766E]" : "text-[#93000A]"}>
                            {formatCurrency(h.balance)}
                          </span>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && totalPages > 0 && (
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

        {!loading && (
          <p className="text-sm text-[#3D4946]">
            Showing {histories.length} of {totalElements} records
          </p>
        )}
      </main>

      {selectedHistory && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Record ID</p>
                  <p className="text-sm font-semibold text-[#0D9488] mt-1">{selectedHistory.shortId}</p>
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
                      <p className="text-xs text-[#3D4946]">Patient ID: {selectedHistory.patientId?.slice(-8) || 'N/A'}</p>
                      {selectedHistory.appointmentType === "FAMILY" && selectedHistory.headPatientName && (
                        <p className="text-xs text-[#94A3B8]">Head Patient: {selectedHistory.headPatientName}</p>
                      )}
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
                      {selectedHistory.appointmentType === "FAMILY" ? "Family Appointment" : "Individual Appointment"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Recorded On</p>
                    <p className="text-sm font-medium text-[#0B1C30]">{selectedHistory.createdAt}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-[#94A3B8]">History Status</p>
                    <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[selectedHistory.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                      {selectedHistory.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-3">Financial Details</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-[#94A3B8]">Amount</p>
                    <p className="text-sm font-bold text-[#0B1C30]">{formatCurrency(selectedHistory.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Discount</p>
                    <p className="text-sm font-bold text-[#0D9488]">{formatCurrency(selectedHistory.discount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Balance</p>
                    <p className={`text-sm font-bold ${selectedHistory.balance === 0 ? "text-[#0F766E]" : "text-[#93000A]"}`}>
                      {formatCurrency(selectedHistory.balance)}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-[#94A3B8]">Payment Status</p>
                  <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${PAYMENT_COLORS[selectedHistory.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                    {selectedHistory.paymentStatus}
                  </span>
                </div>
                {selectedHistory.paymentStatus !== "PAID" && (
                  <p className="text-xs text-[#94A3B8] mt-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    To record or manage payments, go to the <strong className="text-[#0D9488]">Payments</strong> page.
                  </p>
                )}
              </div>

              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-2">Clinical Observation</p>
                <p className="text-sm text-[#485F83] leading-relaxed">
                  {selectedHistory.observation || "No observation notes available"}
                </p>
              </div>

              {selectedHistory.imageUrls.length > 0 && (
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-3">
                    Clinical Images ({selectedHistory.imageUrls.length})
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedHistory.imageUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="block aspect-square rounded-lg overflow-hidden border border-[#E2E8F0] hover:opacity-90 transition-opacity bg-[#E2E8F0]">
                        <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedHistory.videoUrls.length > 0 && (
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-3">
                    Clinical Videos ({selectedHistory.videoUrls.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedHistory.videoUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 hover:border-[#00685C] transition-colors">
                        <div className="w-8 h-8 bg-[#F0FDFA] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm text-[#0B1C30] font-medium truncate flex-1">Video {i + 1}</span>
                        <svg className="w-4 h-4 text-[#94A3B8] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
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

            <div className="p-6 space-y-4">
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
                  Enter the appointment ID to link this history record
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                  Amount <span className="text-[#93000A]">*</span>
                </label>
                <input                  type="number"
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
            </div>

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