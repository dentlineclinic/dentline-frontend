"use client";

import { useEffect, useState } from "react";
import dynamicImport from "next/dynamic";
import TopBar from "@/components/layout/TopBar";
import {
  fetchMyClinicalRecords,
  UnifiedClinicalRecord,
} from "@/services/clinicalRecordService";
import { submitReview as submitReviewApi } from "@/services/reviewService";

const PatientHistoryModal = dynamicImport(
  () => import("@/components/modals/PatientHistoryModal"),
  { ssr: false }
);

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  recordType: "DENTAL" | "DERMATOLOGY";
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
  familyMemberId?: string;
  familyMemberName?: string;
  appointmentType?: "INDIVIDUAL" | "FAMILY";
};

const statusColors: Record<string, string> = {
  IN_PROGRESS: "bg-[#E5EEFF] text-[#435B7E]",
  COMPLETED: "bg-[#F0FDFA] text-[#0F766E]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
};

const paymentColors: Record<string, string> = {
  PAID: "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  UNPAID: "bg-[#FFDAD6] text-[#93000A]",
};

const moduleColors: Record<string, string> = {
  DENTAL: "bg-[#E5EEFF] text-[#1E40AF]",
  DERMATOLOGY: "bg-[#FCE7F3] text-[#9D174D]",
};

type TabType = "all" | "individual" | "family";
type ModuleFilter = "ALL" | "DENTAL" | "DERMATOLOGY";

function toRow(r: UnifiedClinicalRecord): Row {
  return {
    id: r.id,
    recordType: r.recordType,
    patientId: r.patientId,
    patientName: r.patientName,
    doctorId: r.doctorId || "",
    doctorName: r.doctorName || "Unknown",
    appointmentId: r.appointmentId || "",
    appointmentDate: r.appointmentDate || r.createdAt || "",
    amount: r.amount ?? 0,
    paymentStatus: r.paymentStatus || "PENDING",
    status: r.status || "PENDING",
    observation: r.summary || "",
    createdAt: r.createdAt || "",
    familyMemberId: r.familyMemberId || undefined,
    familyMemberName: r.familyMemberName || undefined,
    appointmentType: r.familyMemberId ? "FAMILY" : "INDIVIDUAL",
  };
}

export default function MedicalHistoryPage() {
  const [allHistories, setAllHistories] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("ALL");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [userName, setUserName] = useState("Patient");
  const [selectedHistory, setSelectedHistory] = useState<Row | null>(null);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewAppointmentId, setReviewAppointmentId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistories = async () => {
      setLoading(true);
      setError(null);

      try {
        const name = localStorage.getItem("userName") || "Patient";
        setUserName(name);

        const result = await fetchMyClinicalRecords(0, 100);

        if (result && result.content) {
          setAllHistories(result.content.map(toRow));
        } else {
          setError("Failed to load medical history");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load medical history");
      } finally {
        setLoading(false);
      }
    };

    loadHistories();
  }, []);

  const getCurrentHistories = () => {
    let histories: Row[] = [];

    if (activeTab === "all") histories = allHistories;
    else if (activeTab === "individual") histories = allHistories.filter((h) => h.appointmentType === "INDIVIDUAL");
    else if (activeTab === "family") histories = allHistories.filter((h) => h.appointmentType === "FAMILY");

    if (moduleFilter !== "ALL") {
      histories = histories.filter((h) => h.recordType === moduleFilter);
    }

    if (statusFilter !== "All") {
      histories = histories.filter((h) => h.status === statusFilter);
    }

    return histories;
  };

  const filteredHistories = getCurrentHistories();

  const allCount = allHistories.length;
  const individualCount = allHistories.filter((h) => h.appointmentType === "INDIVIDUAL").length;
  const familyCount = allHistories.filter((h) => h.appointmentType === "FAMILY").length;
  const dentalCount = allHistories.filter((h) => h.recordType === "DENTAL").length;
  const dermCount = allHistories.filter((h) => h.recordType === "DERMATOLOGY").length;

  const openReviewForm = (appointmentId: string) => {
    setReviewAppointmentId(appointmentId);
    setShowReviewForm(true);
    setRating(0);
    setReviewText("");
    setReviewSuccess(null);
    setReviewError(null);
  };

  const closeReviewForm = () => {
    setShowReviewForm(false);
    setReviewAppointmentId(null);
    setRating(0);
    setReviewText("");
    setReviewSuccess(null);
    setReviewError(null);
  };

  const submitReview = async () => {
    if (rating === 0) { setReviewError("Please select a rating"); return; }
    if (!reviewText.trim()) { setReviewError("Please write a review"); return; }
    if (!reviewAppointmentId) { setReviewError("Invalid appointment"); return; }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const result = await submitReviewApi({
        appointmentId: reviewAppointmentId,
        rating,
        comment: reviewText,
      });

      if (result.success) {
        setReviewSuccess(result.message || "Review submitted successfully!");
        setTimeout(() => closeReviewForm(), 2000);
      } else {
        setReviewError(result.message || "Failed to submit review");
      }
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const allTotalAmount = allHistories.reduce((sum, h) => sum + (h.amount || 0), 0);
  const allPaidAmount = allHistories
    .filter((h) => h.paymentStatus === "PAID")
    .reduce((sum, h) => sum + (h.amount || 0), 0);
  const checkupCount = allHistories.filter((h) => !h.amount || h.amount === 0).length;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Medical History" subtitle="Your complete treatment records" />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-4 sm:gap-6">
        {/* Summary Cards — By Module card removed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
            <p className="text-sm text-[#3D4946]">Total Records</p>
            <p className="text-3xl font-bold text-[#0B1C30] mt-1">{allHistories.length}</p>
            <p className="text-xs text-[#0D9488] mt-1">Treatment history</p>
          </div>

          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
            <p className="text-sm text-[#3D4946]">Completed</p>
            <p className="text-3xl font-bold text-[#0B1C30] mt-1">
              {allHistories.filter((h) => h.status === "COMPLETED").length}
            </p>
            <p className="text-xs text-[#0D9488] mt-1">Treatments finished</p>
          </div>

          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
            <p className="text-sm text-[#3D4946]">Total Spent</p>
            <p className="text-3xl font-bold text-[#0B1C30] mt-1">
              ₦{allTotalAmount.toLocaleString()}
            </p>
            <p className="text-xs text-[#0D9488] mt-1">
              ₦{allPaidAmount.toLocaleString()} paid
              {checkupCount > 0 ? ` · ${checkupCount} checkup${checkupCount !== 1 ? "s" : ""}` : ""}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "all" ? "border-[#00685C] text-[#00685C]" : "border-transparent text-[#94A3B8] hover:text-[#3D4946]"
            }`}
          >
            All ({allCount})
          </button>
          <button
            onClick={() => setActiveTab("individual")}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "individual" ? "border-[#00685C] text-[#00685C]" : "border-transparent text-[#94A3B8] hover:text-[#3D4946]"
            }`}
          >
            Individual ({individualCount})
          </button>
          <button
            onClick={() => setActiveTab("family")}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "family" ? "border-[#00685C] text-[#00685C]" : "border-transparent text-[#94A3B8] hover:text-[#3D4946]"
            }`}
          >
            Family ({familyCount})
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex gap-3 flex-wrap">
          <div className="inline-flex rounded-lg border border-[#E2E8F0] overflow-hidden bg-white">
            {(["ALL", "DENTAL", "DERMATOLOGY"] as ModuleFilter[]).map((m) => {
              const active = moduleFilter === m;
              const label =
                m === "ALL" ? `All Modules (${dentalCount + dermCount})`
                : m === "DENTAL" ? `Dental (${dentalCount})`
                : `Dermatology (${dermCount})`;
              return (
                <button
                  key={m}
                  onClick={() => setModuleFilter(m)}
                  className={`px-4 py-2 text-xs font-semibold transition-colors border-r border-[#E2E8F0] last:border-r-0 ${
                    active ? "bg-[#00685C] text-white" : "bg-white text-[#3D4946] hover:bg-[#F8FAFC]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 flex-wrap">
            {["All", "COMPLETED", "IN_PROGRESS", "PENDING"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  f === statusFilter
                    ? "bg-[#00685C] text-white"
                    : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
                }`}
              >
                {f === "All" ? "All" : f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-5 bg-[#F1F5F9] rounded w-2/3 mb-3" />
                <div className="h-4 bg-[#F1F5F9] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredHistories.length === 0 ? (
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 shadow-sm text-center">
            <p className="text-sm text-[#94A3B8]">No medical history records found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredHistories.map((history) => (
              <div
                key={history.id}
                onClick={() => setSelectedHistory(history)}
                className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div>
                        <p className="text-base font-semibold text-[#0B1C30]">
                          Treatment Record #{history.appointmentId.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-[#3D4946]">{history.doctorName}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${moduleColors[history.recordType]}`}>
                        {history.recordType === "DERMATOLOGY" ? "Dermatology" : "Dental"}
                      </span>
                      {history.appointmentType === "FAMILY" && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          Family
                        </span>
                      )}
                    </div>

                    {history.appointmentType === "FAMILY" && history.familyMemberName && (
                      <p className="text-sm font-semibold text-[#00685C] mb-2">
                        👤 Family Member: {history.familyMemberName}
                      </p>
                    )}

                    <p className="text-sm text-[#485F83] leading-relaxed mb-3 line-clamp-2">
                      {history.observation || "No observation notes available"}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[#3D4946] flex-wrap">
                      <span>{new Date(history.appointmentDate).toLocaleDateString()}</span>
                      <span className="font-semibold text-[#0D9488]">
                        {history.amount === 0 || history.amount === null || history.amount === undefined
                          ? <span className="font-semibold text-[#0D9488]">Checkup</span>
                          : `₦${history.amount.toLocaleString()}`}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${paymentColors[history.paymentStatus] || "bg-[#F1F5F9] text-[#64748B]"}`}>
                        {history.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end gap-2 w-full sm:w-auto">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[history.status] || "bg-[#F1F5F9] text-[#64748B]"}`}>
                      {history.status.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      {history.status === "COMPLETED" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openReviewForm(history.appointmentId);
                          }}
                          className="text-xs font-semibold text-[#00685C] hover:underline"
                        >
                          Drop Review
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedHistory(history); }}
                        className="text-xs text-[#0D9488] hover:underline font-semibold"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && allHistories.length > 0 && (
          <p className="text-sm text-[#3D4946]">
            Showing {filteredHistories.length} of {allHistories.length} records
          </p>
        )}
      </main>

      {/* ── Shared detail modal — auto-renders dental OR derm based on recordType ── */}
      <PatientHistoryModal
        isOpen={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        history={
          selectedHistory
            ? ({
                id: selectedHistory.id,
                patientId: selectedHistory.patientId,
                patientName: selectedHistory.patientName,
                doctorId: selectedHistory.doctorId,
                doctorName: selectedHistory.doctorName,
                appointmentId: selectedHistory.appointmentId,
                appointmentDate: selectedHistory.appointmentDate,
                amount: selectedHistory.amount,
                balance: 0,
                paymentStatus: selectedHistory.paymentStatus,
                status: selectedHistory.status,
                observation: selectedHistory.observation,
                createdAt: selectedHistory.createdAt,
                familyMemberId: selectedHistory.familyMemberId,
                familyMemberName: selectedHistory.familyMemberName,
                appointmentType: selectedHistory.appointmentType,
                recordType: selectedHistory.recordType,
                imageUrls: [],
                imageIds: [],
                videoUrls: [],
                videoIds: [],
                toothObservations: [],
              } as any)
            : null
        }
        doctorMode={false}
        onObservationSaved={() => {
          // Patient view — no-op
        }}
      />

      {/* ── Review Form Modal (unchanged) ── */}
      {showReviewForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-[#F1F5F9]">
              <h2 className="text-xl font-bold text-[#0B1C30]">Drop Your Review</h2>
              <button onClick={closeReviewForm} disabled={submittingReview} className="text-[#94A3B8] hover:text-[#475569] disabled:opacity-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {reviewSuccess && (
                <div className="bg-[#DCFCE7] text-[#166534] text-sm font-semibold px-4 py-3 rounded-lg">
                  {reviewSuccess}
                </div>
              )}
              {reviewError && (
                <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                  {reviewError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      disabled={submittingReview}
                      className="transition-transform hover:scale-110 disabled:opacity-50"
                    >
                      <svg
                        className={`w-10 h-10 ${star <= (hoveredRating || rating) ? "text-[#FFC107] fill-[#FFC107]" : "text-[#E2E8F0]"}`}
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth={1}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">Your Review *</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  disabled={submittingReview}
                  placeholder="Share your experience..."
                  rows={4}
                  maxLength={500}
                  className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#00685C] disabled:opacity-50 resize-none"
                />
                <p className="text-xs text-[#94A3B8] mt-1">{reviewText.length}/500 characters</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[#F1F5F9]">
              <button onClick={closeReviewForm} disabled={submittingReview} className="px-4 py-2 text-sm font-semibold text-[#3D4946] hover:text-[#0B1C30] disabled:opacity-50">
                Cancel
              </button>
              <button onClick={submitReview} disabled={submittingReview} className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-50">
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}