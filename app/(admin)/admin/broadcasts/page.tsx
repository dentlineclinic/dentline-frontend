"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import {
  addBroadcastRecipient,
  getBroadcastRecipients,
  sendBroadcast,
  getBroadcastHistory,
  importRecipientsFromCsv,
  type BroadcastRecipient,
  type BroadcastHistoryDto,
  type ImportRecipientsResponse,
} from "@/services/broadcastService";

export const dynamic = "force-dynamic";

type Tab = "send" | "recipients" | "history" | "import";

function Spinner({ small }: { small?: boolean }) {
  return (
    <svg className={`animate-spin ${small ? "w-4 h-4" : "w-5 h-5"}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function formatDate(raw: string | null | undefined) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "—";
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

const INPUT = "w-full bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors";

export default function BroadcastPage() {
  const [tab, setTab] = useState<Tab>("send");

  // ── Send broadcast ────────────────────────────────────────────────────────
  const [subject, setSubject] = useState("");
  const [messageBeforeFlyer, setMessageBeforeFlyer] = useState("");
  const [messageAfterFlyer, setMessageAfterFlyer] = useState("");
  const [flyerImage, setFlyerImage] = useState<File | null>(null);
  const [flyerImagePreview, setFlyerImagePreview] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState(80);
  const [imagePosition, setImagePosition] = useState<"top" | "between" | "bottom">("between");
  const [sending, setSending] = useState(false);

  // Handle flyer image selection
  const handleFlyerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFlyerImage(file);
    
    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlyerImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFlyerImagePreview(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!subject.trim()) { 
      toast.error("Subject is required."); 
      return; 
    }
    
    if (!messageBeforeFlyer.trim() && !messageAfterFlyer.trim()) {
      toast.error("At least one message section is required.");
      return;
    }
    
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("subject", subject.trim());
      
      // Always send both message parts (they can be empty)
      formData.append("messageBeforeFlyer", messageBeforeFlyer.trim());
      formData.append("messageAfterFlyer", messageAfterFlyer.trim());
      
      // Image settings
      formData.append("imageWidth", imageWidth.toString());
      formData.append("imagePosition", imagePosition);
      
      // Upload flyer image if selected
      if (flyerImage) {
        formData.append("flyerImage", flyerImage);
      }
      
      const res = await sendBroadcast(formData);
      toast.success(
        `Broadcast sent to ${res.data.recipientCount} recipient${res.data.recipientCount !== 1 ? "s" : ""}.`
      );
      
      // Reset form
      setSubject("");
      setMessageBeforeFlyer("");
      setMessageAfterFlyer("");
      setFlyerImage(null);
      setFlyerImagePreview(null);
      setImageWidth(80);
      setImagePosition("between");
      
    } catch (err: any) {
      toast.error(err.message || "Failed to send broadcast.");
    } finally {
      setSending(false);
    }
  };

  // ── Recipients ────────────────────────────────────────────────────────────
  const [recipients, setRecipients] = useState<BroadcastRecipient[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recPage, setRecPage] = useState(0);
  const [recTotalPages, setRecTotalPages] = useState(0);
  const [recTotal, setRecTotal] = useState(0);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const loadRecipients = useCallback(async (p: number) => {
    setRecLoading(true);
    setRecError(null);
    try {
      const res = await getBroadcastRecipients(p, 10);
      setRecipients(res.data.content ?? []);
      setRecTotalPages(res.data.totalPages);
      setRecTotal(res.data.totalElements);
    } catch (err: any) {
      setRecError(err.message || "Failed to load recipients.");
    } finally {
      setRecLoading(false);
    }
  }, []);

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) { toast.error("Email is required."); return; }
    setAdding(true);
    try {
      await addBroadcastRecipient({ email: newEmail.trim(), name: newName.trim() || undefined });
      toast.success("Recipient added successfully.");
      setNewEmail(""); setNewName(""); setShowAddForm(false);
      setRecPage(0); loadRecipients(0);
    } catch (err: any) {
      toast.error(err.message || "Failed to add recipient.");
    } finally {
      setAdding(false);
    }
  };

  // ── History ───────────────────────────────────────────────────────────────
  const [history, setHistory] = useState<BroadcastHistoryDto[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histError, setHistError] = useState<string | null>(null);
  const [histPage, setHistPage] = useState(0);
  const [histTotalPages, setHistTotalPages] = useState(0);
  const [histTotal, setHistTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── CSV Import ────────────────────────────────────────────────────────────
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportRecipientsResponse | null>(null);

  const loadHistory = useCallback(async (p: number) => {
    setHistLoading(true);
    setHistError(null);
    try {
      const res = await getBroadcastHistory(p, 10);
      setHistory(res.data.content ?? []);
      setHistTotalPages(res.data.totalPages);
      setHistTotal(res.data.totalElements);
    } catch (err: any) {
      setHistError(err.message || "Failed to load broadcast history.");
    } finally {
      setHistLoading(false);
    }
  }, []);

  // Load data when tab or page changes
  useEffect(() => {
    if (tab === "recipients") loadRecipients(recPage);
  }, [tab, recPage, loadRecipients]);

  useEffect(() => {
    if (tab === "history") loadHistory(histPage);
  }, [tab, histPage, loadHistory]);

  // ── CSV import handler ────────────────────────────────────────────────────
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) { toast.error("Please select a CSV file."); return; }
    setImporting(true);
    setImportResult(null);
    try {
      const res = await importRecipientsFromCsv(importFile);
      setImportResult(res.data);
      toast.success(`Imported ${res.data.successCount} recipient${res.data.successCount !== 1 ? "s" : ""} from ${res.data.fileName}`);
      if (tab === "recipients") loadRecipients(0);
    } catch (err: any) {
      toast.error(err.message || "Failed to import CSV.");
    } finally {
      setImporting(false);
    }
  };

  // Helper to check if we have any message content
  const hasMessageContent = messageBeforeFlyer.trim() || messageAfterFlyer.trim();

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Broadcasts" subtitle="Send email broadcasts to subscribers" />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">

        {/* Tab bar */}
        <div className="flex gap-0 border-b border-[#F1F5F9] overflow-x-auto">
          {(["send", "recipients", "history", "import"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px whitespace-nowrap ${
                tab === t
                  ? "border-[#00685C] text-[#00685C]"
                  : "border-transparent text-[#3D4946] hover:text-[#0B1C30]"
              }`}
            >
              {t === "send"       ? "Send Broadcast"
               : t === "recipients" ? `Recipients${recTotal > 0 ? ` (${recTotal})` : ""}`
               : t === "import"     ? "Import CSV"
               : "History"}
            </button>
          ))}
        </div>

        {/* ──────────────────────────────────────────────────────────────────
            SEND TAB
        ────────────────────────────────────────────────────────────────── */}
        {tab === "send" && (
          <div className="max-w-2xl">
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div>
                <h2 className="text-base font-bold text-[#0B1C30]">Compose Broadcast</h2>
                <p className="text-sm text-[#94A3B8] mt-0.5">
                  This email will be sent to all active subscribers who have not opted out.
                </p>
              </div>

              <form onSubmit={handleSend} className="flex flex-col gap-5">
                {/* Subject */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">
                    Subject <span className="text-[#93000A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Clinic Closure Notice – Public Holiday"
                    className={INPUT}
                  />
                </div>

                {/* Message Before Flyer */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">
                    Message Before Flyer
                  </label>
                  <textarea
                    rows={4}
                    value={messageBeforeFlyer}
                    onChange={e => setMessageBeforeFlyer(e.target.value)}
                    placeholder="Message content that appears BEFORE the flyer image (leave empty to show flyer at top)"
                    className={`${INPUT} resize-none`}
                  />
                  <p className="text-xs text-[#94A3B8] text-right">{messageBeforeFlyer.length} characters</p>
                </div>

                {/* Flyer Image Upload */}
                <div className="flex flex-col gap-2 border border-[#E2E8F0] rounded-xl p-4 bg-[#F8FAFC]">
                  <label className="text-sm font-semibold text-[#3D4946]">
                    Flyer Image <span className="text-xs font-normal text-[#94A3B8]">(optional)</span>
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#008375] transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFlyerImageChange}
                        className="hidden"
                      />
                    </label>
                    {flyerImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setFlyerImage(null);
                          setFlyerImagePreview(null);
                        }}
                        className="text-sm text-[#93000A] hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {flyerImage && (
                    <p className="text-xs text-[#3D4946]">
                      {flyerImage.name} ({(flyerImage.size / 1024).toFixed(1)} KB)
                    </p>
                  )}

                  {/* Image preview */}
                  {flyerImagePreview && (
                    <div className="mt-2">
                      <img 
                        src={flyerImagePreview} 
                        alt="Flyer preview" 
                        className="max-h-48 w-auto rounded-lg border border-[#E2E8F0]"
                        style={{ maxWidth: `${imageWidth}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Image Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Image Width */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[#3D4946]">
                      Image Width: {imageWidth}%
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={imageWidth}
                      onChange={e => setImageWidth(parseInt(e.target.value))}
                      className="w-full accent-[#00685C]"
                      disabled={!flyerImage && !flyerImagePreview}
                    />
                    <div className="flex justify-between text-xs text-[#94A3B8]">
                      <span>20%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Image Position */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[#3D4946]">
                      Image Position
                    </label>
                    <select
                      value={imagePosition}
                      onChange={e => setImagePosition(e.target.value as "top" | "between" | "bottom")}
                      className={INPUT}
                      disabled={!flyerImage && !flyerImagePreview}
                    >
                      <option value="top">Top of message</option>
                      <option value="between">Between message parts</option>
                      <option value="bottom">Bottom of message</option>
                    </select>
                    <p className="text-xs text-[#94A3B8]">
                      {imagePosition === "top" && "Flyer appears before all message content"}
                      {imagePosition === "between" && "Flyer appears between the two message sections"}
                      {imagePosition === "bottom" && "Flyer appears after all message content"}
                    </p>
                  </div>
                </div>

                {/* Message After Flyer */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">
                    Message After Flyer
                  </label>
                  <textarea
                    rows={4}
                    value={messageAfterFlyer}
                    onChange={e => setMessageAfterFlyer(e.target.value)}
                    placeholder="Message content that appears AFTER the flyer image (leave empty to show flyer at bottom)"
                    className={`${INPUT} resize-none`}
                  />
                  <p className="text-xs text-[#94A3B8] text-right">{messageAfterFlyer.length} characters</p>
                </div>

                {/* Preview Section */}
                {(subject.trim() || hasMessageContent || flyerImagePreview) && (
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5">
                    <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Email Preview</p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#00685C] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0B1C30]">Dentline Clinic</p>
                        <p className="text-xs text-[#94A3B8]">noreply@dentlineclinic.com</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#0B1C30] mb-2">{subject || "(No subject)"}</p>
                    
                    {/* Preview: Message Before */}
                    {messageBeforeFlyer && (
                      <div className="mb-3">
                        <p className="text-xs text-[#94A3B8] mb-1">Before Flyer:</p>
                        <p className="text-sm text-[#485F83] whitespace-pre-wrap leading-relaxed">
                          {messageBeforeFlyer}
                        </p>
                      </div>
                    )}
                    
                    {/* Preview: Flyer */}
                    {flyerImagePreview && (
                      <div className="my-3 border-t border-[#E2E8F0] pt-3">
                        <p className="text-xs text-[#94A3B8] mb-2">Flyer Image ({imagePosition}):</p>
                        <img 
                          src={flyerImagePreview} 
                          alt="Flyer preview" 
                          className="rounded-lg border border-[#E2E8F0]"
                          style={{ maxWidth: `${imageWidth}%` }}
                        />
                      </div>
                    )}
                    
                    {/* Preview: Message After */}
                    {messageAfterFlyer && (
                      <div className="mt-3 border-t border-[#E2E8F0] pt-3">
                        <p className="text-xs text-[#94A3B8] mb-1">After Flyer:</p>
                        <p className="text-sm text-[#485F83] whitespace-pre-wrap leading-relaxed">
                          {messageAfterFlyer}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center justify-center gap-2 bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                >
                  {sending ? (
                    <><Spinner small /> Sending…</>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Broadcast
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────
            RECIPIENTS TAB
        ────────────────────────────────────────────────────────────────── */}
        {tab === "recipients" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-[#3D4946]">{recTotal} subscriber{recTotal !== 1 ? "s" : ""}</p>
              <button
                onClick={() => setShowAddForm(f => !f)}
                className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Recipient
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <form
                onSubmit={handleAddRecipient}
                className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col gap-4"
              >
                <h3 className="text-sm font-bold text-[#0B1C30]">New Recipient</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[#3D4946]">
                      Email <span className="text-[#93000A]">*</span>
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className={INPUT}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[#3D4946]">
                      Name <span className="text-xs font-normal text-[#94A3B8]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="John Doe"
                      className={INPUT}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50"
                  >
                    {adding && <Spinner small />}
                    {adding ? "Adding…" : "Add Recipient"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setNewEmail(""); setNewName(""); }}
                    className="text-sm font-semibold text-[#3D4946] border border-[#E2E8F0] px-5 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {recError && (
              <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">{recError}</div>
            )}

            {/* Table */}
            <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    <tr>
                      {["NAME", "EMAIL", "STATUS", "ADDED"].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-t border-[#F8FAFC]">
                          {[...Array(4)].map((__, j) => (
                            <td key={j} className="px-6 py-4">
                              <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : recipients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                          No recipients yet. Add your first subscriber.
                        </td>
                      </tr>
                    ) : (
                      recipients.map((r, i) => (
                        <tr key={r.id} className={`${i > 0 ? "border-t border-[#F8FAFC]" : ""} hover:bg-[#F8FAFC] transition-colors`}>
                          <td className="px-6 py-4 text-sm font-semibold text-[#0B1C30]">
                            {r.name || <span className="text-[#94A3B8] font-normal">—</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#3D4946]">{r.email}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              r.optOut
                                ? "bg-[#FFDAD6] text-[#93000A]"
                                : "bg-[#DCFCE7] text-[#166534]"
                            }`}>
                              {r.optOut ? "Opted Out" : "Active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#3D4946]">
                            {r.createdAt
                              ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {!recLoading && recTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <button disabled={recPage === 0} onClick={() => setRecPage(p => p - 1)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 transition-colors">Previous</button>
                <span className="text-sm text-[#3D4946]">Page {recPage + 1} of {recTotalPages}</span>
                <button disabled={recPage >= recTotalPages - 1} onClick={() => setRecPage(p => p + 1)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 transition-colors">Next</button>
              </div>
            )}
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────
            HISTORY TAB
        ────────────────────────────────────────────────────────────────── */}
        {tab === "history" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#3D4946]">{histTotal} broadcast{histTotal !== 1 ? "s" : ""} sent</p>

            {histError && (
              <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">{histError}</div>
            )}

            {histLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm animate-pulse">
                    <div className="h-4 bg-[#F1F5F9] rounded w-1/3 mb-2" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-full mb-1" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 bg-[#F0FDFA] rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#0B1C30]">No broadcasts sent yet</p>
                <p className="text-xs text-[#94A3B8]">Your sent broadcasts will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map(broadcast => (
                  <div key={broadcast.id} className="bg-white border border-[#F1F5F9] rounded-xl shadow-sm overflow-hidden">
                    {/* Header row */}
                    <button
                      onClick={() => setExpandedId(id => id === broadcast.id ? null : broadcast.id)}
                      className="w-full flex items-start justify-between gap-4 px-6 py-5 hover:bg-[#F8FAFC] transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="text-sm font-bold text-[#0B1C30] truncate">{broadcast.subject}</p>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E5EEFF] text-[#1E40AF] flex-shrink-0">
                            {broadcast.recipientCount} recipient{broadcast.recipientCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#94A3B8] flex-wrap">
                          <span>{formatDate(broadcast.createdAt)}</span>
                          <span>·</span>
                          <span>Sent by {broadcast.createdBy}</span>
                        </div>
                      </div>
                      <svg
                        className={`w-4 h-4 text-[#94A3B8] flex-shrink-0 mt-1 transition-transform ${expandedId === broadcast.id ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded body */}
                    {expandedId === broadcast.id && (
                      <div className="px-6 pb-5 border-t border-[#F1F5F9]">
                        <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mt-4 mb-2">Message</p>
                        <p className="text-sm text-[#485F83] whitespace-pre-wrap leading-relaxed bg-[#F8FAFC] rounded-lg p-4">
                          {broadcast.body}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!histLoading && histTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <button disabled={histPage === 0} onClick={() => setHistPage(p => p - 1)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 transition-colors">Previous</button>
                <span className="text-sm text-[#3D4946]">Page {histPage + 1} of {histTotalPages}</span>
                <button disabled={histPage >= histTotalPages - 1} onClick={() => setHistPage(p => p + 1)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 transition-colors">Next</button>
              </div>
            )}
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────
            IMPORT CSV TAB
        ────────────────────────────────────────────────────────────────── */}
        {tab === "import" && (
          <div className="flex flex-col gap-6 max-w-2xl">

            {/* Instructions card */}
            <div className="bg-[#F0FDFA] border border-[#00685C]/20 rounded-xl p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#00685C] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-bold text-[#00685C]">Google Forms CSV Format</p>
              </div>
              <p className="text-xs text-[#3D4946] leading-relaxed">
                Upload a CSV exported from the clinic's Google Forms registration form.
                The file must follow the standard column structure:
                <strong> First Name</strong> (column 3) and <strong>Email address</strong> (column 13).
                Duplicate emails and invalid addresses are automatically skipped.
              </p>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/admin/broadcasts/sample-csv`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#00685C] hover:underline w-fit flex items-center gap-1 mt-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download sample CSV template
              </a>
            </div>

            {/* Upload form */}
            <form onSubmit={handleImport} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-5">
              <div>
                <h2 className="text-base font-bold text-[#0B1C30]">Upload CSV File</h2>
                <p className="text-sm text-[#94A3B8] mt-0.5">
                  Works with all clinic Google Forms exports (Gbagada, Ikeja, Surulere, etc.)
                </p>
              </div>

              {/* Drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                  importFile
                    ? "border-[#00685C] bg-[#F0FDFA]"
                    : "border-[#BDC9C5] bg-[#F8FAFC] hover:border-[#00685C] hover:bg-[#F0FDFA]/50"
                }`}
                onClick={() => document.getElementById("csv-file-input")?.click()}
              >
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv,text/csv,application/vnd.ms-excel,text/plain"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0] ?? null;
                    setImportFile(f);
                    setImportResult(null);
                  }}
                />
                {importFile ? (
                  <>
                    <svg className="w-10 h-10 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-[#00685C]">{importFile.name}</p>
                    <p className="text-xs text-[#3D4946]">
                      {(importFile.size / 1024).toFixed(1)} KB · Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-semibold text-[#3D4946]">Click to upload CSV</p>
                    <p className="text-xs text-[#94A3B8]">CSV files only · Any size</p>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="flex items-center justify-center gap-2 bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <><Spinner small /> Importing…</>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Import Recipients
                    </>
                  )}
                </button>
                {importFile && !importing && (
                  <button
                    type="button"
                    onClick={() => { setImportFile(null); setImportResult(null); }}
                    className="text-sm font-semibold text-[#3D4946] border border-[#E2E8F0] px-5 py-3 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            {/* Import result */}
            {importResult && (
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-[#0B1C30]">Import Results</h3>
                  <span className="text-xs text-[#94A3B8] truncate max-w-[260px]">{importResult.fileName}</span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Processed",   value: importResult.totalProcessed, color: "text-[#0B1C30]",  bg: "bg-[#F8FAFC]" },
                    { label: "Imported",    value: importResult.successCount,   color: "text-[#166534]",  bg: "bg-[#DCFCE7]" },
                    { label: "Duplicates",  value: importResult.duplicateEmails?.length ?? 0, color: "text-[#92400E]", bg: "bg-[#FEF3C7]" },
                    { label: "Invalid",     value: importResult.failedCount,    color: "text-[#93000A]",  bg: "bg-[#FFDAD6]" },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-lg p-3 text-center`}>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-[#3D4946] mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-[#3D4946]">{importResult.message}</p>

                {/* Duplicate emails */}
                {importResult.duplicateEmails?.length > 0 && (
                  <details className="group">
                    <summary className="text-xs font-semibold text-[#92400E] cursor-pointer hover:underline list-none flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {importResult.duplicateEmails.length} duplicate email{importResult.duplicateEmails.length !== 1 ? "s" : ""} skipped
                    </summary>
                    <div className="mt-2 bg-[#FEF3C7] rounded-lg p-3 max-h-32 overflow-y-auto">
                      {importResult.duplicateEmails.map((email, i) => (
                        <p key={`dup-${i}`} className="text-xs text-[#92400E] font-mono">{email}</p>
                      ))}
                    </div>
                  </details>
                )}

                {/* Failed emails */}
                {importResult.failedEmails?.length > 0 && (
                  <details className="group">
                    <summary className="text-xs font-semibold text-[#93000A] cursor-pointer hover:underline list-none flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {importResult.failedEmails.length} invalid email{importResult.failedEmails.length !== 1 ? "s" : ""} skipped
                    </summary>
                    <div className="mt-2 bg-[#FFDAD6] rounded-lg p-3 max-h-32 overflow-y-auto">
                      {importResult.failedEmails.map((email, i) => (
                        <p key={`fail-${i}`} className="text-xs text-[#93000A] font-mono">{email}</p>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}