"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { updateObservation } from "@/services/doctorService";

type HistoryRecord = {
  id: string;
  shortId: string;
  patientId: string;
  patientName: string;
  initials: string;
  doctorName: string;
  appointmentId: string;
  date: string;
  time: string;
  amount: number;
  amountFormatted: string;
  balance: number;
  balanceFormatted: string;
  paymentStatus: string;
  status: string;
  observation: string;
  createdAt: string;
};

type Toast = { message: string; type: "success" | "error" };

const STATUS_COLORS: Record<string, string> = {
  COMPLETED:   "bg-[#DCFCE7] text-[#166534]",
  IN_PROGRESS: "bg-[#FEF3C7] text-[#92400E]",
  PENDING:     "bg-[#E5EEFF] text-[#435B7E]",
};

export default function PatientRecordPage() {
  const { historyId } = useParams<{ historyId: string }>();
  const token = () => (typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "");
  const authHeader = () => ({ Authorization: `Bearer ${token()}` });

  const [record, setRecord] = useState<HistoryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  // Observation
  const [observation, setObservation] = useState("");
  const [savingObs, setSavingObs] = useState(false);

  // Uploads
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Complete
  const [completing, setCompleting] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/patient-histories", { headers: authHeader() });
        const result = await res.json();
        if (result.success) {
          const found = result.data.find((h: HistoryRecord) => h.id === historyId);
          if (found) {
            setRecord(found);
            setObservation(found.observation ?? "");
          }
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyId]);

  const saveObservation = async () => {
    if (!observation.trim()) return showToast("Observation cannot be empty.", "error");
    setSavingObs(true);
    try {
      const result = await updateObservation(historyId, observation);
      if (result.success) {
        showToast(result.message, "success");
        setRecord(prev => prev ? { ...prev, observation, status: "IN_PROGRESS" } : prev);
      } else {
        showToast(result.message, "error");
      }
    } catch {
      showToast("Failed to save observation.", "error");
    } finally {
      setSavingObs(false);
    }
  };

  const uploadFile = async (file: File, type: "image" | "video") => {
    const setter = type === "image" ? setUploadingImage : setUploadingVideo;
    setter(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/patient-history/${historyId}/upload/${type}`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, "success");
        if (type === "image") {
          setUploadedImages(prev => [...prev, ...result.data.imageUrls]);
        } else {
          setUploadedVideos(prev => [...prev, ...result.data.videoUrls]);
        }
      } else {
        showToast(result.message, "error");
      }
    } catch {
      showToast(`Failed to upload ${type}.`, "error");
    } finally {
      setter(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, "image");
    e.target.value = "";
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, "video");
    e.target.value = "";
  };

  const markComplete = async () => {
    if (record?.status === "COMPLETED") return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/patient-history/${historyId}/complete`, {
        method: "PATCH",
        headers: authHeader(),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, "success");
        setRecord(prev => prev ? { ...prev, status: "COMPLETED" } : prev);
      } else {
        showToast(result.message, "error");
      }
    } catch {
      showToast("Failed to complete history.", "error");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-10">
        <div className="max-w-3xl flex flex-col gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
              <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-1/3 mb-4" />
              <div className="h-20 bg-[#F1F5F9] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex-1 p-10 flex flex-col items-center justify-center gap-4">
        <p className="text-base text-[#94A3B8]">Patient history record not found.</p>
        <Link href="/doctor" className="text-sm text-[#0D9488] hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isCompleted = record.status === "COMPLETED";

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10">
        <div className="max-w-3xl flex flex-col gap-6">

          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-3 ${
                toast.type === "success"
                  ? "bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]"
                  : "bg-[#FFDAD6] text-[#93000A] border border-[#FFBAB4]"
              }`}
            >
              {toast.type === "success" ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toast.message}
            </div>
          )}

          {/* Back + header */}
          <div className="flex items-center justify-between">
            <Link href="/doctor" className="text-sm text-[#0D9488] hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[record.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
              {record.status.replace("_", " ")}
            </span>
          </div>

          {/* Patient info card */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xl font-bold text-[#0F766E] flex-shrink-0">
              {record.initials}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#0B1C30]">{record.patientName}</h2>
              <p className="text-sm text-[#94A3B8]">{record.shortId} · Appointment {record.appointmentId.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#94A3B8]">Date</p>
              <p className="text-sm font-semibold text-[#0B1C30]">{record.date}</p>
              <p className="text-xs text-[#3D4946]">{record.time}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#94A3B8]">Amount</p>
              <p className="text-sm font-bold text-[#0B1C30]">{record.amountFormatted}</p>
              <p className={`text-xs font-semibold ${record.paymentStatus === "PAID" ? "text-[#0F766E]" : "text-[#93000A]"}`}>
                {record.paymentStatus}
              </p>
            </div>
          </div>

          {/* Observation */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0B1C30]">Clinical Observation</h3>
              {isCompleted && (
                <span className="text-xs text-[#94A3B8]">Read-only — appointment completed</span>
              )}
            </div>
            <textarea
              rows={5}
              value={observation}
              onChange={e => setObservation(e.target.value)}
              disabled={isCompleted}
              placeholder="Describe the patient's condition, treatment performed, and any follow-up notes..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] resize-none placeholder:text-[#94A3B8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            />
            {!isCompleted && (
              <button
                onClick={saveObservation}
                disabled={savingObs || !observation.trim()}
                className="self-start flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingObs && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                Save Observation
              </button>
            )}
          </div>

          {/* Media uploads */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-base font-bold text-[#0B1C30]">Media Uploads</h3>

            {/* Images */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#3D4946]">Images</p>
                {!isCompleted && (
                  <>
                    <button
                      onClick={() => imageRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex items-center gap-2 text-sm font-semibold text-[#0D9488] hover:underline disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      )}
                      Upload Image
                    </button>
                    <input
                      ref={imageRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </>
                )}
              </div>
              {uploadedImages.length === 0 ? (
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 text-center">
                  <svg className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-[#94A3B8]">No images uploaded yet</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="w-20 h-20 bg-[#F0FDFA] rounded-lg border border-[#CCFBF1] flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#3D4946]">Videos</p>
                {!isCompleted && (
                  <>
                    <button
                      onClick={() => videoRef.current?.click()}
                      disabled={uploadingVideo}
                      className="flex items-center gap-2 text-sm font-semibold text-[#0D9488] hover:underline disabled:opacity-50"
                    >
                      {uploadingVideo ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                      Upload Video
                    </button>
                    <input
                      ref={videoRef}
                      type="file"
                      accept="video/mp4,video/avi,video/quicktime"
                      className="hidden"
                      onChange={handleVideoChange}
                    />
                  </>
                )}
              </div>
              {uploadedVideos.length === 0 ? (
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 text-center">
                  <svg className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-[#94A3B8]">No videos uploaded yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {uploadedVideos.map((url, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3">
                      <svg className="w-5 h-5 text-[#0D9488] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-[#3D4946] truncate flex-1">{url}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mark Complete */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0B1C30]">Mark as Completed</h3>
              <p className="text-sm text-[#94A3B8] mt-0.5">
                {isCompleted
                  ? "This appointment has been marked as completed."
                  : "Once marked complete, no further edits can be made."}
              </p>
            </div>
            <button
              onClick={markComplete}
              disabled={completing || isCompleted}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                isCompleted
                  ? "bg-[#DCFCE7] text-[#166534] cursor-not-allowed"
                  : "bg-[#00685C] text-white hover:bg-[#008375] disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {completing ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {isCompleted ? "Completed" : "Mark Complete"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
