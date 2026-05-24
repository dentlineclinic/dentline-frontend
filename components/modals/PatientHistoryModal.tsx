"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { PatientHistory } from "@/services/patientHistoryService";
import {
  updateObservation,
  markHistoryAsCompleted,
  uploadHistoryImage,
  uploadHistoryVideo,
  deleteHistoryImage,
  deleteHistoryVideo,
} from "@/services/doctorService";
import { imageThumbnail } from "@/lib/cloudinary";

interface PatientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: PatientHistory | null;
  /** Pass true when used in doctor context (shows upload + complete controls) */
  doctorMode?: boolean;
  onObservationSaved?: () => void;
}

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

export default function PatientHistoryModal({
  isOpen,
  onClose,
  history,
  doctorMode = false,
  onObservationSaved,
}: PatientHistoryModalProps) {
  const [observation, setObservation] = useState("");
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Local copies of media so UI updates immediately after upload
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Track which media item is being deleted (by URL) to show per-item spinner
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (history) {
      setObservation(history.observation || "");
      setImageUrls(Array.isArray(history.imageUrls) ? history.imageUrls : []);
      setVideoUrls(Array.isArray(history.videoUrls) ? history.videoUrls : []);
    }
  }, [history]);

  const showToast = (message: string, type: "success" | "error") => {
    if (type === "success") toast.success(message);
    else toast.error(message);
  };

  const saveObservation = async () => {
    if (!history) return;
    if (!observation.trim()) {
      showToast("Observation cannot be empty.", "error");
      return;
    }
    setSaving(true);
    try {
      const result = await updateObservation(history.id, observation);
      if (result.success) {
        showToast("Observation saved successfully!", "success");
        history.observation = observation;
        history.status = "IN_PROGRESS";
        onObservationSaved?.();
      } else {
        showToast(result.message || "Failed to save observation.", "error");
      }
    } catch {
      showToast("Failed to save observation.", "error");
    } finally {
      setSaving(false);
    }
  };

  const markAsCompleted = async () => {
    if (!history) return;
    if (!history.observation?.trim()) {
      showToast("Please add an observation before completing.", "error");
      return;
    }
    setCompleting(true);
    try {
      const result = await markHistoryAsCompleted(history.id);
      if (result.success) {
        showToast("Appointment marked as completed!", "success");
        history.status = "COMPLETED";
        onObservationSaved?.();
        setTimeout(onClose, 1500);
      } else {
        showToast(result.message || "Failed to mark as completed.", "error");
      }
    } catch {
      showToast("Failed to mark as completed.", "error");
    } finally {
      setCompleting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !history) return;
    e.target.value = "";
    setUploadingImage(true);
    try {
      const result = await uploadHistoryImage(history.id, file);
      if (result.success) {
        // Optimistically add a local object URL so the image shows immediately
        const localUrl = URL.createObjectURL(file);
        setImageUrls(prev => [...prev, localUrl]);
        showToast("Image uploaded successfully!", "success");
        onObservationSaved?.();
      } else {
        showToast(result.message || "Failed to upload image.", "error");
      }
    } catch {
      showToast("Failed to upload image.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !history) return;
    e.target.value = "";
    setUploadingVideo(true);
    try {
      const result = await uploadHistoryVideo(history.id, file);
      if (result.success) {
        const localUrl = URL.createObjectURL(file);
        setVideoUrls(prev => [...prev, localUrl]);
        showToast("Video uploaded successfully!", "success");
        onObservationSaved?.();
      } else {
        showToast(result.message || "Failed to upload video.", "error");
      }
    } catch {
      showToast("Failed to upload video.", "error");
    } finally {
      setUploadingVideo(false);
    }
  };

  /**
   * Extracts the media ID from a Cloudinary URL.
   * The backend expects the public_id which is everything after the version
   * segment, e.g. "dentline/histories/abc123" from a full Cloudinary URL.
   * We send the last path segment (filename without extension) as the ID.
   */
  const extractMediaId = (url: string): string => {
    try {
      const pathname = new URL(url).pathname;
      // Remove extension and take the last segment
      const withoutExt = pathname.replace(/\.[^/.]+$/, "");
      return withoutExt.split("/").pop() ?? url;
    } catch {
      // Fallback for blob/local URLs (optimistic uploads not yet persisted)
      return url;
    }
  };

  const handleDeleteImage = async (url: string) => {
    if (!history || deletingImage) return;
    const mediaId = extractMediaId(url);
    setDeletingImage(url);
    try {
      const result = await deleteHistoryImage(history.id, mediaId);
      if (result.success) {
        setImageUrls(prev => prev.filter(u => u !== url));
        showToast("Image deleted.", "success");
        onObservationSaved?.();
      } else {
        showToast(result.message || "Failed to delete image.", "error");
      }
    } catch {
      showToast("Failed to delete image.", "error");
    } finally {
      setDeletingImage(null);
    }
  };

  const handleDeleteVideo = async (url: string) => {
    if (!history || deletingVideo) return;
    const mediaId = extractMediaId(url);
    setDeletingVideo(url);
    try {
      const result = await deleteHistoryVideo(history.id, mediaId);
      if (result.success) {
        setVideoUrls(prev => prev.filter(u => u !== url));
        showToast("Video deleted.", "success");
        onObservationSaved?.();
      } else {
        showToast(result.message || "Failed to delete video.", "error");
      }
    } catch {
      showToast("Failed to delete video.", "error");
    } finally {
      setDeletingVideo(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  if (!isOpen || !history) return null;

  const { date, time } = formatDate(history.appointmentDate);
  const isCompleted = history.status === "COMPLETED";
  const hasObservation = !!(history.observation?.trim());

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-[#F1F5F9] px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold text-[#0B1C30]">Patient History Record</h2>
              <p className="text-sm text-[#94A3B8] mt-0.5">Record ID: {history.id.slice(0, 8)}…</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-[#3D4946]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col gap-5">

            {/* Patient Info */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#CCFBF1] flex items-center justify-center text-base font-bold text-[#0F766E] flex-shrink-0">
                {history.patientName?.split(" ").map(n => n[0]).join("") || "NA"}
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-[#0B1C30]">{history.patientName}</p>
                <p className="text-sm text-[#94A3B8]">Patient ID: {history.patientId.slice(0, 8)}…</p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-4">
                <p className="text-xs text-[#94A3B8] mb-1">Doctor</p>
                <p className="text-sm font-semibold text-[#0B1C30]">{history.doctorName}</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-4">
                <p className="text-xs text-[#94A3B8] mb-1">Appointment Date</p>
                <p className="text-sm font-semibold text-[#0B1C30]">{date}</p>
                <p className="text-xs text-[#3D4946]">{time}</p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-4">
                <p className="text-xs text-[#94A3B8] mb-1">Amount</p>
                <p className="text-sm font-bold text-[#0B1C30]">
                  ₦{typeof history.amount === "number" ? history.amount.toLocaleString() : history.amount}
                </p>
              </div>
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-4">
                <p className="text-xs text-[#94A3B8] mb-1">Status</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PAYMENT_COLORS[history.paymentStatus] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                    {history.paymentStatus}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[history.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                    {history.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Observation */}
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0B1C30]">Clinical Observation</h3>
                {isCompleted && <span className="text-xs text-[#94A3B8]">Read-only — completed</span>}
              </div>

              {isCompleted ? (
                <div className="bg-[#F8FAFC] rounded-lg px-4 py-3 text-sm text-[#485F83] leading-relaxed">
                  {history.observation || "No observation recorded."}
                </div>
              ) : doctorMode ? (
                <>
                  <textarea
                    rows={5}
                    value={observation}
                    onChange={e => setObservation(e.target.value)}
                    placeholder="Enter clinical observation, treatment details, and follow-up notes…"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] resize-none placeholder:text-[#94A3B8] transition-colors"
                  />
                  <button
                    onClick={saveObservation}
                    disabled={saving || !observation.trim()}
                    className="self-start flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                    {hasObservation ? "Update Observation" : "Save Observation"}
                  </button>
                </>
              ) : (
                <div className="bg-[#F8FAFC] rounded-lg px-4 py-3 text-sm text-[#485F83] leading-relaxed">
                  {history.observation || "No observation recorded."}
                </div>
              )}
            </div>

            {/* Media Upload (doctor only, not completed) */}
            {doctorMode && !isCompleted && (
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-base font-bold text-[#0B1C30]">Upload Media</h3>
                <div className="flex gap-3">
                  {/* Image upload */}
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 border border-[#E2E8F0] text-sm font-semibold px-4 py-2.5 rounded-lg text-[#3D4946] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage
                      ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    }
                    {uploadingImage ? "Uploading…" : "Upload Image"}
                  </button>
                  <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />

                  {/* Video upload */}
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingVideo}
                    className="flex items-center gap-2 border border-[#E2E8F0] text-sm font-semibold px-4 py-2.5 rounded-lg text-[#3D4946] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingVideo
                      ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    }
                    {uploadingVideo ? "Uploading…" : "Upload Video"}
                  </button>
                  <input ref={videoInputRef} type="file" accept="video/mp4,video/avi,video/quicktime,video/webm" className="hidden" onChange={handleVideoUpload} />
                </div>
              </div>
            )}

            {/* Images display */}
            {imageUrls.length > 0 && (
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 flex flex-col gap-3">
                <h3 className="text-base font-bold text-[#0B1C30]">
                  Clinical Images <span className="text-sm font-normal text-[#94A3B8]">({imageUrls.length})</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC]">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageThumbnail(url)} alt={`Clinical image ${i + 1}`} className="w-full h-full object-cover" />
                      </a>

                      {/* Delete button — visible on hover in doctor mode */}
                      {doctorMode && !isCompleted && (
                        <button
                          onClick={() => handleDeleteImage(url)}
                          disabled={deletingImage === url}
                          aria-label={`Delete image ${i + 1}`}
                          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-[#93000A]/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#93000A] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {deletingImage === url ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos display */}
            {videoUrls.length > 0 && (
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 flex flex-col gap-3">
                <h3 className="text-base font-bold text-[#0B1C30]">
                  Clinical Videos <span className="text-sm font-normal text-[#94A3B8]">({videoUrls.length})</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {videoUrls.map((url, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3">
                      {/* Clickable video link */}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                      >
                        <div className="w-8 h-8 bg-[#F0FDFA] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm text-[#0B1C30] font-medium flex-1 truncate">Video {i + 1}</span>
                        <svg className="w-4 h-4 text-[#94A3B8] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>

                      {/* Delete button — doctor mode only, not completed */}
                      {doctorMode && !isCompleted && (
                        <button
                          onClick={() => handleDeleteVideo(url)}
                          disabled={deletingVideo === url}
                          aria-label={`Delete video ${i + 1}`}
                          className="w-7 h-7 rounded-lg bg-[#FFDAD6] text-[#93000A] flex items-center justify-center flex-shrink-0 hover:bg-[#93000A] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingVideo === url ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Balance warning */}
            {history.balance !== undefined && history.balance > 0 && (
              <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-[#92400E] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-[#92400E]">Outstanding Balance</p>
                  <p className="text-xs text-[#78350F] mt-0.5">
                    ₦{typeof history.balance === "number" ? history.balance.toLocaleString() : history.balance} remaining
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[#F8FAFC] border-t border-[#F1F5F9] px-6 py-4 flex items-center justify-between gap-3 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#E2E8F0] text-[#3D4946] hover:bg-white transition-colors"
            >
              Close
            </button>

            {doctorMode && !isCompleted && (
              <button
                onClick={markAsCompleted}
                disabled={completing || !hasObservation}
                title={!hasObservation ? "Add an observation first" : "Mark as completed"}
                className="flex items-center gap-2 bg-[#0F766E] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0D5C56] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {completing && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {completing ? "Completing…" : "Mark as Complete"}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
