"use client";

import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Doctor = {
  id: string;
  fullName: string;
  initials: string;
  specialty: string;
  email: string;
  patients: number;
  status: string; // "Active" | "Suspended"
};

type Toast = { message: string; type: "success" | "error" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#F1F5F9] rounded-xl shadow-sm overflow-hidden">
      <div className="px-8 py-5 border-b border-[#F1F5F9]">
        <h3 className="text-base font-bold text-[#0B1C30]">{title}</h3>
        <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>
      </div>
      <div className="px-8 py-6">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors placeholder:text-[#94A3B8]"
    />
  );
}

function Btn({
  children,
  onClick,
  loading,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  variant?: "primary" | "danger" | "success" | "ghost";
  disabled?: boolean;
}) {
  const base = "px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#00685C] text-white hover:bg-[#008375]",
    danger:  "bg-[#FFDAD6] text-[#93000A] hover:bg-[#FFBAB4]",
    success: "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]",
    ghost:   "border border-[#E2E8F0] text-[#3D4946] hover:bg-[#F8FAFC]",
  };
  return (
    <button className={`${base} ${variants[variant]}`} onClick={onClick} disabled={disabled || loading}>
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const token = () => (typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "");
  const authHeader = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

  const [toast, setToast] = useState<Toast | null>(null);
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Reference Points ──────────────────────────────────────────────────────
  const [rpPatientId, setRpPatientId] = useState("");
  const [rpData, setRpData] = useState<{ patientId: string; referencePoints: number } | null>(null);
  const [rpLoading, setRpLoading] = useState(false);
  const [rpPoints, setRpPoints] = useState("");
  const [rpReason, setRpReason] = useState("");
  const [rpMutating, setRpMutating] = useState(false);

  const fetchReferencePoints = async () => {
    if (!rpPatientId.trim()) return;
    setRpLoading(true);
    setRpData(null);
    try {
      const res = await fetch(`/api/admin/reference-points/${rpPatientId.trim()}`, {
        headers: authHeader(),
      });
      const result = await res.json();
      if (result.success) setRpData(result.data);
      else showToast(result.message, "error");
    } catch {
      showToast("Failed to fetch reference points.", "error");
    } finally {
      setRpLoading(false);
    }
  };

  const mutatePoints = async (action: "add" | "remove") => {
    const pts = parseInt(rpPoints, 10);
    if (!rpData) return showToast("Fetch a patient first.", "error");
    if (!pts || pts <= 0) return showToast("Enter a valid positive number of points.", "error");
    setRpMutating(true);
    try {
      let res: Response;
      if (action === "add") {
        res = await fetch(
          `/api/admin/reference-points/add?patientId=${rpData.patientId}&points=${pts}&reason=${encodeURIComponent(rpReason)}`,
          { method: "POST", headers: authHeader() }
        );
      } else {
        res = await fetch("/api/admin/reference-points/remove", {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify({ patientId: rpData.patientId, pointsToRemove: pts, reason: rpReason }),
        });
      }
      const result = await res.json();
      if (result.success) {
        showToast(result.message, "success");
        // Optimistic update
        setRpData(prev =>
          prev
            ? {
                ...prev,
                referencePoints:
                  action === "add"
                    ? prev.referencePoints + pts
                    : Math.max(0, prev.referencePoints - pts),
              }
            : null
        );
        setRpPoints("");
        setRpReason("");
      } else {
        showToast(result.message, "error");
      }
    } catch {
      showToast("Request failed.", "error");
    } finally {
      setRpMutating(false);
    }
  };

  // ── Unlock Patient ────────────────────────────────────────────────────────
  const [unlockId, setUnlockId] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  const unlockPatient = async () => {
    if (!unlockId.trim()) return showToast("Enter a patient ID.", "error");
    setUnlocking(true);
    try {
      const res = await fetch(`/api/users/patients/${unlockId.trim()}/unlock`, {
        method: "PATCH",
        headers: authHeader(),
      });
      const result = await res.json();
      showToast(result.message, result.success ? "success" : "error");
      if (result.success) setUnlockId("");
    } catch {
      showToast("Request failed.", "error");
    } finally {
      setUnlocking(false);
    }
  };

  // ── Doctor Suspend / Activate ─────────────────────────────────────────────
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorAction, setDoctorAction] = useState<string | null>(null); // id of doctor being actioned
  const [doctorSearch, setDoctorSearch] = useState(""); // Search query

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/doctors", { headers: authHeader() });
        const result = await res.json();
        if (result.success) {
          // Add a local "status" field defaulting to Active
          setDoctors(result.data.map((d: Doctor) => ({ ...d, status: d.status ?? "Active" })));
        }
      } catch {
        // non-critical
      } finally {
        setDoctorsLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDoctorStatus = async (doctor: Doctor) => {
    const action = doctor.status === "Active" ? "suspend" : "activate";
    setDoctorAction(doctor.id);
    try {
      const res = await fetch(`/api/users/doctors/${doctor.id}/${action}`, {
        method: "PATCH",
        headers: authHeader(),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, "success");
        setDoctors(prev =>
          prev.map(d =>
            d.id === doctor.id
              ? { ...d, status: action === "suspend" ? "Suspended" : "Active" }
              : d
          )
        );
      } else {
        showToast(result.message, "error");
      }
    } catch {
      showToast("Request failed.", "error");
    } finally {
      setDoctorAction(null);
    }
  };

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter(doctor => {
    const searchLower = doctorSearch.toLowerCase();
    return (
      doctor.fullName.toLowerCase().includes(searchLower) ||
      doctor.email.toLowerCase().includes(searchLower) ||
      doctor.specialty.toLowerCase().includes(searchLower)
    );
  });

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10 flex flex-col gap-8 max-w-3xl">

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-3 transition-all ${
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

        {/* ── 1. Reference Points ── */}
        <Section
          title="Reference Points"
          subtitle="View and adjust a patient's reference point balance"
        >
          <div className="flex flex-col gap-5">
            {/* Lookup */}
            <Field label="Patient ID">
              <div className="flex gap-3">
                <Input
                  placeholder="550e8400-e29b-41d4-a716-446655440001"
                  value={rpPatientId}
                  onChange={e => setRpPatientId(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && fetchReferencePoints()}
                  className="flex-1"
                />
                <Btn onClick={fetchReferencePoints} loading={rpLoading} variant="ghost">
                  Fetch
                </Btn>
              </div>
            </Field>

            {/* Current balance */}
            {rpData && (
              <div className="flex items-center justify-between bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl px-6 py-4">
                <div>
                  <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest">Current Balance</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5 font-mono">{rpData.patientId}</p>
                </div>
                <p className="text-4xl font-bold text-[#00685C]">{rpData.referencePoints}</p>
              </div>
            )}

            {/* Adjust */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Points">
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 50"
                  value={rpPoints}
                  onChange={e => setRpPoints(e.target.value)}
                />
              </Field>
              <Field label="Reason (optional)">
                <Input
                  placeholder="e.g. Referral bonus"
                  value={rpReason}
                  onChange={e => setRpReason(e.target.value)}
                />
              </Field>
            </div>

            <div className="flex gap-3">
              <Btn
                onClick={() => mutatePoints("add")}
                loading={rpMutating}
                disabled={!rpData}
                variant="primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Points
              </Btn>
              <Btn
                onClick={() => mutatePoints("remove")}
                loading={rpMutating}
                disabled={!rpData}
                variant="danger"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Remove Points
              </Btn>
            </div>
          </div>
        </Section>

        {/* ── 2. Unlock Patient Account ── */}
        <Section
          title="Unlock Patient Account"
          subtitle="Unlock accounts locked due to too many failed login attempts"
        >
          <div className="flex flex-col gap-4">
            <Field label="Patient ID">
              <div className="flex gap-3">
                <Input
                  placeholder="550e8400-e29b-41d4-a716-446655440003"
                  value={unlockId}
                  onChange={e => setUnlockId(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && unlockPatient()}
                  className="flex-1"
                />
                <Btn onClick={unlockPatient} loading={unlocking} variant="success">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Unlock Account
                </Btn>
              </div>
            </Field>
            <p className="text-xs text-[#94A3B8]">
              Only use this for patient accounts. Doctor accounts are managed via the suspend/activate controls below.
            </p>
          </div>
        </Section>

        {/* ── 3. Doctor Status Management ── */}
        <Section
          title="Doctor Status Management"
          subtitle="Suspend or activate doctor accounts. Suspended doctors cannot log in."
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#94A3B8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                placeholder="Search by name, email, or specialty..."
                value={doctorSearch}
                onChange={e => setDoctorSearch(e.target.value)}
                className="pl-10 w-full"
              />
              {doctorSearch && (
                <button
                  onClick={() => setDoctorSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8] hover:text-[#3D4946]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {doctorSearch && (
              <p className="text-xs text-[#94A3B8] mt-2">
                Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {doctorsLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-[#F1F5F9] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-[#F1F5F9] animate-pulse flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/4" />
                  </div>
                  <div className="w-24 h-9 bg-[#F1F5F9] rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-[#94A3B8] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21l-7-7-7 7m7-7V3" />
              </svg>
              <p className="text-sm text-[#94A3B8]">No doctors found matching "{doctorSearch}"</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredDoctors.map(doctor => (
                <div
                  key={doctor.id}
                  className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${
                    doctor.status === "Suspended"
                      ? "border-[#FFBAB4] bg-[#FFF5F5]"
                      : "border-[#F1F5F9] bg-white"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#F0FDFA] flex items-center justify-center text-sm font-bold text-[#00685C] flex-shrink-0">
                    {doctor.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0B1C30] truncate">{doctor.fullName}</p>
                    <p className="text-xs text-[#94A3B8]">{doctor.specialty} · {doctor.email}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        doctor.status === "Active"
                          ? "bg-[#F0FDFA] text-[#0F766E]"
                          : "bg-[#FFDAD6] text-[#93000A]"
                      }`}
                    >
                      {doctor.status}
                    </span>
                    <Btn
                      onClick={() => toggleDoctorStatus(doctor)}
                      loading={doctorAction === doctor.id}
                      variant={doctor.status === "Active" ? "danger" : "success"}
                    >
                      {doctor.status === "Active" ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Suspend
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Activate
                        </>
                      )}
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

      </main>
    </div>
  );
}