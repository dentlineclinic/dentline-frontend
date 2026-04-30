"use client";

import { useEffect, useState } from "react";

type Patient = {
  id: string;
  shortId: string;
  fullName: string;
  initials: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalHistory: string;
  referenceCode: string;
  referencePoints: number;
  lastVisit: string;
  status: string;
};

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">{label}</span>
      <span className="text-sm text-[#0B1C30] font-medium">{value}</span>
    </div>
  );
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [selected, setSelected] = useState<Patient | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/patients", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
        });
        const result = await res.json();
        if (result.success) setPatients(result.data);
        else setError(result.message);
      } catch {
        setError("Failed to load patients.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visible = patients.filter(p => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.shortId.toLowerCase().includes(search.toLowerCase()) ||
      p.referenceCode.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === "All" || p.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-4 lg:gap-6">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="search"
              placeholder="Search by name, email or ref code…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-full sm:w-72"
            />
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#3D4946] outline-none"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <p className="text-sm text-[#3D4946]">
            {loading ? "Loading…" : `${visible.length} patients`}
          </p>
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Table — slim columns: Name, Email, Gender, DOB */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
            <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
              <tr>
                {["NAME", "EMAIL", "GENDER", "DATE OF BIRTH", "STATUS", ""].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-t border-[#F8FAFC]">
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                    No patients found.
                  </td>
                </tr>
              ) : (
                visible.map((p, i) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`${i > 0 ? "border-t border-[#F8FAFC]" : ""} hover:bg-[#F8FAFC] transition-colors cursor-pointer ${selected?.id === p.id ? "bg-[#F0FDFA]" : ""}`}
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
                          {p.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0B1C30]">{p.fullName}</p>
                          <p className="text-xs text-[#94A3B8]">{p.shortId}</p>
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-6 py-4 text-sm text-[#3D4946]">{p.email}</td>
                    {/* Gender */}
                    <td className="px-6 py-4 text-sm text-[#3D4946]">{p.gender}</td>
                    {/* DOB */}
                    <td className="px-6 py-4 text-sm text-[#3D4946]">
                      {new Date(p.dateOfBirth).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.status === "Active" ? "bg-[#F0FDFA] text-[#0F766E]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                        {p.status}
                      </span>
                    </td>
                    {/* Chevron hint */}
                    <td className="px-6 py-4 text-right">
                      <svg className="w-4 h-4 text-[#94A3B8] inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </main>

      {/* ── OVERLAY ── */}
      {selected && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
          onClick={() => setSelected(null)}
        />
      )}

      {/* ── DETAIL PANEL ── */}
      {selected && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
            <h2 className="text-base font-bold text-[#0B1C30]">Patient Details</h2>
            <button
              onClick={() => setSelected(null)}
              className="text-[#94A3B8] hover:text-[#475569]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xl font-bold text-[#0F766E] flex-shrink-0">
                {selected.initials}
              </div>
              <div>
                <p className="text-base font-bold text-[#0B1C30]">{selected.fullName}</p>
                <p className="text-xs text-[#94A3B8]">{selected.shortId} · {selected.referenceCode}</p>
                <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${selected.status === "Active" ? "bg-[#F0FDFA] text-[#0F766E]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                  {selected.status}
                </span>
              </div>
            </div>

            {/* Personal info */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest border-b border-[#F1F5F9] pb-2">
                Personal Information
              </p>
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Phone Number" value={selected.phoneNumber} />
              <DetailRow label="Date of Birth" value={new Date(selected.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
              <DetailRow label="Gender" value={selected.gender} />
              <DetailRow label="Last Visit" value={selected.lastVisit} />
            </div>

            {/* Emergency contact */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest border-b border-[#F1F5F9] pb-2">
                Emergency Contact
              </p>
              <DetailRow label="Name" value={selected.emergencyContactName} />
              <DetailRow label="Phone" value={selected.emergencyContactPhone} />
            </div>

            {/* Medical history */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest border-b border-[#F1F5F9] pb-2">
                Medical History
              </p>
              <p className="text-sm text-[#485F83] leading-relaxed bg-[#F8FAFC] rounded-lg p-4">
                {selected.medicalHistory}
              </p>
            </div>

            {/* Rewards */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest border-b border-[#F1F5F9] pb-2">
                Rewards
              </p>
              <div className="flex items-center justify-between bg-[#F0FDFA] rounded-xl px-5 py-4">
                <div>
                  <p className="text-xs text-[#3D4946]">Reference Code</p>
                  <p className="text-sm font-bold text-[#0B1C30] mt-0.5">{selected.referenceCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#3D4946]">Reference Points</p>
                  <p className="text-2xl font-bold text-[#00685C]">{selected.referencePoints}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
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
