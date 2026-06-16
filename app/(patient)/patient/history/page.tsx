"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { fetchMyPatientHistories } from "@/services/patientHistoryService";
import { submitReview as submitReviewApi } from "@/services/reviewService";

export const dynamic = "force-dynamic";

type PatientHistory = {
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
  imageUrls: string[];
  videoUrls: string[];
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

export default function MedicalHistoryPage() {
  const [histories, setHistories] = useState<PatientHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [userName, setUserName] = useState("Patient");
  const [selectedHistory, setSelectedHistory] = useState<PatientHistory | null>(null);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewAppointmentId, setReviewAppointmentId] = useState<string | null>(null); // ✅ Fixed: renamed to appointmentId
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

        const result = await fetchMyPatientHistories(0, 10);

        if (result.success) {
          setHistories(
            (result.data.content || []).map((h: any) => ({
              ...h,
              imageUrls: Array.isArray(h.imageUrls) ? h.imageUrls : [],
              videoUrls: Array.isArray(h.videoUrls) ? h.videoUrls : [],
            }))
          );
        } else {
          setError(result.message || "Failed to load medical history");
        }
      } catch (err) {
        setError("Failed to load medical history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHistories();
  }, []);

  const filteredHistories = histories.filter((h) => {
    if (statusFilter === "All") return true;
    return h.status === statusFilter;
  });

  // ✅ Fixed: now accepts appointmentId instead of historyId
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

  // ✅ Fixed: using real API call instead of mock
  const submitReview = async () => {
    if (rating === 0) {
      setReviewError("Please select a rating");
      return;
    }

    if (!reviewText.trim()) {
      setReviewError("Please write a review");
      return;
    }

    if (!reviewAppointmentId) {
      setReviewError("Invalid appointment");
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const result = await submitReviewApi({
        appointmentId: reviewAppointmentId, // ✅ correct mapping
        rating,
        comment: reviewText,
      });

      if (result.success) {
        setReviewSuccess(result.message || "Review submitted successfully!");

        setTimeout(() => {
          closeReviewForm();
        }, 2000);
      } else {
        setReviewError(result.message || "Failed to submit review");
      }
    } catch (err: any) {
      // Handle backend error message if available
      const message =
        err?.response?.data?.message ||
        "Failed to submit review. Please try again.";

      setReviewError(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const totalAmount = histories.reduce((sum, h) => sum + h.amount, 0);
  const paidAmount = histories
    .filter(h => h.paymentStatus === "PAID")
    .reduce((sum, h) => sum + h.amount, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Medical History"
        subtitle="Your complete treatment records"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-4 sm:gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#3D4946]">Total Records</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">{histories.length}</p>
                <p className="text-xs text-[#0D9488] mt-1">Treatment history</p>
              </div>
              <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#3D4946]">Completed</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">
                  {histories.filter((h) => h.status === "COMPLETED").length}
                </p>
                <p className="text-xs text-[#0D9488] mt-1">Treatments finished</p>
              </div>
              <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#3D4946]">In Progress</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">
                  {histories.filter((h) => h.status === "IN_PROGRESS").length}
                </p>
                <p className="text-xs text-[#0D9488] mt-1">Ongoing treatments</p>
              </div>
              <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#3D4946]">Total Spent</p>
                <p className="text-3xl font-bold text-[#0B1C30] mt-1">
                  ₦{totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-[#0D9488] mt-1">
                  ₦{paidAmount.toLocaleString()} paid
                </p>
              </div>
              <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 sm:gap-3 flex-wrap">
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

        {/* Error Message */}
        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-[#F1F5F9] rounded w-2/3" />
                    <div className="h-4 bg-[#F1F5F9] rounded w-1/2" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-full" />
                  </div>
                  <div className="h-6 bg-[#F1F5F9] rounded-full w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredHistories.length === 0 ? (
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 shadow-sm text-center">
            <svg
              className="w-16 h-16 text-[#94A3B8] mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm text-[#94A3B8]">No medical history records found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredHistories.map((history) => (
              <div
                key={history.id}
                className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedHistory(history)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#F0FDFA] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-[#00685C]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[#0B1C30]">
                          Treatment Record #{history.appointmentId.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-[#3D4946]">{history.doctorName}</p>
                      </div>
                    </div>

                    <p className="text-sm text-[#485F83] leading-relaxed mb-3 line-clamp-2">
                      {history.observation || "No observation notes available"}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[#3D4946] flex-wrap">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(history.appointmentDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#0D9488]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        ₦{history.amount.toLocaleString()}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          paymentColors[history.paymentStatus] || "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {history.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-2 w-full sm:w-auto">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        statusColors[history.status] || "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      {history.status.replace("_", " ")}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHistory(history);
                      }}
                      className="text-xs text-[#0D9488] hover:underline font-semibold"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && histories.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#3D4946]">
              Showing {filteredHistories.length} of {histories.length} records
            </p>
            {statusFilter !== "All" && filteredHistories.length > 0 && (
              <button
                onClick={() => setStatusFilter("All")}
                className="text-xs text-[#0D9488] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        )}
      </main>

      {/* Details Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#F1F5F9]">
              <h2 className="text-xl font-bold text-[#0B1C30]">Treatment Details</h2>
              <button
                onClick={() => setSelectedHistory(null)}
                className="text-[#94A3B8] hover:text-[#475569] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Record Information */}
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-3">
                  Record Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#94A3B8]">Appointment ID</p>
                    <p className="text-sm font-semibold text-[#0D9488]">
                      #{selectedHistory.appointmentId.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Treatment Date</p>
                    <p className="text-sm font-medium text-[#0B1C30]">
                      {new Date(selectedHistory.appointmentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Record Created</p>
                    <p className="text-sm font-medium text-[#0B1C30]">
                      {new Date(selectedHistory.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Status</p>
                    <span
                      className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${
                        statusColors[selectedHistory.status] || "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      {selectedHistory.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-2">
                  Treating Doctor
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E5EEFF] rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-[#435B7E]">
                      {selectedHistory.doctorName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0B1C30]">{selectedHistory.doctorName}</p>
                    <p className="text-xs text-[#3D4946]">Doctor ID: {selectedHistory.doctorId}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-3">
                  Financial Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#94A3B8]">Amount</p>
                    <p className="text-lg font-bold text-[#0B1C30]">₦{selectedHistory.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Payment Status</p>
                    <span
                      className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${
                        paymentColors[selectedHistory.paymentStatus] ||
                        "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      {selectedHistory.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical Observation */}
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-2">
                  Clinical Observation
                </p>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-[#485F83] leading-relaxed whitespace-pre-wrap">
                    {selectedHistory.observation || "No observation notes available"}
                  </p>
                </div>
              </div>

              {/* Clinical Images */}
              {selectedHistory.imageUrls?.length > 0 && (
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mb-3">
                    Clinical Images ({selectedHistory.imageUrls.length})
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedHistory.imageUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="block aspect-square rounded-xl overflow-hidden border border-[#E2E8F0] hover:opacity-90 transition-opacity bg-[#E2E8F0]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Clinical image ${i + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Videos */}
              {selectedHistory.videoUrls?.length > 0 && (
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
                        <span className="text-sm text-[#0B1C30] font-medium flex-1">Video {i + 1}</span>
                        <svg className="w-4 h-4 text-[#94A3B8] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#F1F5F9]">
              <button
                onClick={() => setSelectedHistory(null)}
                className="px-4 py-2 text-sm font-semibold text-[#3D4946] hover:text-[#0B1C30] transition-colors"
              >
                Close
              </button>
              {/* ✅ Only show Drop Review button for COMPLETED appointments */}
              {selectedHistory.status === "COMPLETED" && (
                <button
                  onClick={() => {
                    setSelectedHistory(null);
                    openReviewForm(selectedHistory.appointmentId); // ✅ Fixed: passing appointmentId
                  }}
                  className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-[#008375] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Drop Review
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#F1F5F9]">
              <h2 className="text-xl font-bold text-[#0B1C30]">Drop Your Review</h2>
              <button
                onClick={closeReviewForm}
                disabled={submittingReview}
                className="text-[#94A3B8] hover:text-[#475569] transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Success Message */}
              {reviewSuccess && (
                <div className="bg-[#DCFCE7] text-[#166534] text-sm font-semibold px-4 py-3 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {reviewSuccess}
                </div>
              )}

              {/* Error Message */}
              {reviewError && (
                <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                  {reviewError}
                </div>
              )}

              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                  Rating <span className="text-[#93000A]">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      disabled={submittingReview}
                      className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className={`w-10 h-10 ${
                          star <= (hoveredRating || rating)
                            ? "text-[#FFC107] fill-[#FFC107]"
                            : "text-[#E2E8F0]"
                        }`}
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth={1}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-[#0D9488] mt-1 font-medium">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                  Your Review <span className="text-[#93000A]">*</span>
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  disabled={submittingReview}
                  placeholder="Share your experience with this treatment..."
                  rows={4}
                  maxLength={500}
                  className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
                <p className="text-xs text-[#94A3B8] mt-1">
                  {reviewText.length}/500 characters
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#F1F5F9]">
              <button
                onClick={closeReviewForm}
                disabled={submittingReview}
                className="px-4 py-2 text-sm font-semibold text-[#3D4946] hover:text-[#0B1C30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}