"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchPatients, createPatient } from "@/services/patientService";

export const dynamic = "force-dynamic";

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

type CreatePatientForm = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
};

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">{label}</span>
      <span className="text-sm text-[#0B1C30] font-medium">{value}</span>
    </div>
  );
}

// ✅ New component for ID row with copy button
function IdDetailRow({ label, id, shortId }: { label: string; id: string; shortId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#0B1C30] font-medium font-mono">{id}</span>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-[#F1F5F9] rounded transition-colors group"
          title="Copy ID"
        >
          {copied ? (
            <svg className="w-4 h-4 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-[#94A3B8] group-hover:text-[#3D4946]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
      <span className="text-xs text-[#94A3B8]">Short ID: {shortId}</span>
    </div>
  );
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [selected, setSelected] = useState<Patient | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  // Create patient panel state
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePatientForm>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [showPageSuccess, setShowPageSuccess] = useState(false);

  const loadPatients = useCallback(async (pageNum: number, pageSize: number, searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPatients(pageNum, pageSize, searchTerm);

      if (response.success && response.data) {
        const mapped = response.data.content.map((p: any) => ({
          id: p.id,
          shortId: `PAT-${p.id.slice(0, 6).toUpperCase()}`,
          fullName: p.name,
          initials: p.name
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
          email: p.email,
          status: p.status || "Active",
          phoneNumber: p.phoneNumber || p.phone || "N/A",
          dateOfBirth: p.dateOfBirth || p.dob || new Date().toISOString(),
          gender: p.gender || "Unknown",
          emergencyContactName: p.emergencyContactName || p.emergency_contact_name || "N/A",
          emergencyContactPhone: p.emergencyContactPhone || p.emergency_contact_phone || "N/A",
          medicalHistory: p.medicalHistory || p.medical_history || "No history",
          referenceCode: p.referenceCode || p.reference_code || "N/A",
          referencePoints: p.referencePoints ?? p.reference_points ?? 0,
          lastVisit: p.lastVisit || p.last_visit || "N/A",
        }));

        setPatients(mapped);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.message || "Failed to load patients.");
      }
    } catch (err) {
      setError("Failed to load patients.");
      console.error("Error loading patients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and search/pagination changes

  useEffect(() => {
    loadPatients(page, size, search);
  }, [page, size, search, loadPatients]);

  // Reset to first page when gender filter changes
  useEffect(() => {
    if (page !== 0) {
      setPage(0);
    }
  }, [genderFilter]);

  // Open create patient panel
  const openCreatePanel = () => {
    setCreateForm({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "",
    });
    setCreateError(null);
    setCreateSuccess(null);
    setShowCreatePanel(true);
  };

  // Close create patient panel
  const closeCreatePanel = () => {
    if (!creating) {
      setShowCreatePanel(false);
      setCreateError(null);
      setCreateSuccess(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Strong password validation
  const validatePassword = (password: string) => {
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongPasswordRegex.test(password);
  };

  // Handle form submission
  const handleCreatePatient = async () => {
    // Validation
    if (!createForm.name.trim()) {
      setCreateError("Name is required.");
      return;
    }
    if (!createForm.email.trim()) {
      setCreateError("Email is required.");
      return;
    }
    if (!createForm.password.trim()) {
      setCreateError("Password is required.");
      return;
    }
    if (!validatePassword(createForm.password)) {
      setCreateError("Password must be at least 8 characters, include a capital letter and a number.");
      return;
    }
    if (!createForm.phoneNumber.trim()) {
      setCreateError("Phone number is required.");
      return;
    }
    if (!createForm.dateOfBirth) {
      setCreateError("Date of birth is required.");
      return;
    }
    if (!createForm.gender) {
      setCreateError("Gender is required.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const normalizedPayload = {
        ...createForm,
        phoneNumber: createForm.phoneNumber.replace(/\s+/g, ""),
      };

      const response = await createPatient(normalizedPayload);

      if (response.success) {
        setCreateSuccess("Patient created successfully!");
        setShowPageSuccess(true);
        setTimeout(() => setShowPageSuccess(false), 5000);

        setTimeout(() => {
          setShowCreatePanel(false);
          setPage(0);
          loadPatients(0, size, search);
          setCreateForm({
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
            dateOfBirth: "",
            gender: "",
          });
        }, 1000);
      } else {
        setCreateError(response.message || "Failed to create patient.");
      }
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || "Failed to create patient.");
    } finally {
      setCreating(false);
    }
  };

  const visible = patients.filter(p => {
    const matchesGender = genderFilter === "All" || p.gender === genderFilter;
    return matchesGender;
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-4 lg:gap-6">

        {/* Success banner */}
        {showPageSuccess && (
          <div className="flex items-center gap-3 bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] px-4 py-3 rounded-lg text-sm font-semibold">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Patient created successfully!
            <button
              onClick={() => setShowPageSuccess(false)}
              className="ml-auto text-[#166534] hover:text-[#14532D]"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex gap-2">
              <input
                type="search"
                placeholder="Search patient name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-full sm:w-72"
              />

              <button
                onClick={() => {
                  setPage(0);
                  setSearch(searchInput);
                }}
                className="bg-[#00685C] text-white px-4 py-2 rounded-lg hover:bg-[#008375]"
              >
                Search
              </button>
            </div>
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#3D4946] outline-none"
            >
              <option value="All">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex gap-3">
            <p className="text-sm text-[#3D4946] self-center">
              {loading ? "Loading…" : `${visible.length} patients`}
            </p>
            <button
              onClick={openCreatePanel}
              className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors"
            >
              + Create Patient
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
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
                      <td className="px-6 py-4 text-sm text-[#3D4946]">{p.email}</td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">{p.gender}</td>
                      <td className="px-6 py-4 text-sm text-[#3D4946]">
                        {p.dateOfBirth !== "N/A"
                          ? new Date(p.dateOfBirth).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })
                          : "N/A"
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.status === "Active" ? "bg-[#F0FDFA] text-[#0F766E]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                          {p.status}
                        </span>
                      </td>
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

        {/* Pagination UI */}
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
            Showing {visible.length} of {patients.length} patients
          </p>
        )}
      </main>

      {/* OVERLAY for detail panel */}
      {selected && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
          onClick={() => setSelected(null)}
        />
      )}

      {/* OVERLAY for create panel */}
      {showCreatePanel && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
          onClick={closeCreatePanel}
        />
      )}

      {/* DETAIL PANEL */}
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
                <p className="text-xs text-[#94A3B8]">{selected.shortId}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${selected.status === "Active" ? "bg-[#F0FDFA] text-[#0F766E]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                    {selected.status}
                  </span>
                  {selected.referenceCode !== "N/A" && (
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-[#E5EEFF] text-[#1E40AF]">
                      Code: {selected.referenceCode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Personal info */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-bold text-[#3D4946] uppercase tracking-widest border-b border-[#F1F5F9] pb-2">
                Personal Information
              </p>

              {/* ✅ NEW: Patient ID row with copy button and short ID */}
              <IdDetailRow label="Patient ID" id={selected.id} shortId={selected.shortId} />

              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Phone Number" value={selected.phoneNumber} />
              <DetailRow label="Date of Birth" value={
                selected.dateOfBirth !== "N/A"
                  ? new Date(selected.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                  : "N/A"
              } />
              <DetailRow label="Gender" value={selected.gender} />
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
                  <p className="text-sm font-bold text-[#0B1C30] mt-0.5 font-mono">
                    {selected.referenceCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#3D4946]">Reference Points</p>
                  <p className="text-2xl font-bold text-[#00685C]">
                    {selected.referencePoints}
                  </p>
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

      {/* CREATE PATIENT PANEL */}
      {showCreatePanel && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
            <h2 className="text-base font-bold text-[#0B1C30]">Create New Patient</h2>
            <button
              onClick={closeCreatePanel}
              disabled={creating}
              className="text-[#94A3B8] hover:text-[#475569] disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body - Form */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Success Message */}
            {createSuccess && (
              <div className="mb-4 bg-[#DCFCE7] text-[#166534] text-sm font-semibold px-4 py-3 rounded-lg">
                {createSuccess}
              </div>
            )}

            {/* Error Message */}
            {createError && (
              <div className="mb-4 bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                {createError}
              </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                  Full Name <span className="text-[#93000A]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={createForm.name}
                  onChange={handleInputChange}
                  disabled={creating}
                  placeholder="Enter patient's full name"
                  className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                  Email Address <span className="text-[#93000A]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={createForm.email}
                  onChange={handleInputChange}
                  disabled={creating}
                  placeholder="patient@example.com"
                  className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                  Password <span className="text-[#93000A]">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={createForm.password}
                  onChange={handleInputChange}
                  disabled={creating}
                  placeholder="Minimum 8 characters, 1 capital letter, 1 number"
                  className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                  required
                />
                <p className="text-xs text-[#94A3B8] mt-1">
                  Password must be at least 8 characters, include a capital letter and a number
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                  Phone Number <span className="text-[#93000A]">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={createForm.phoneNumber}
                  onChange={handleInputChange}
                  disabled={creating}
                  placeholder="+2348012345678"
                  className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                  required
                />
                <p className="text-xs text-[#94A3B8] mt-1">Format: +2348012345678 (no spaces)</p>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                  Date of Birth <span className="text-[#93000A]">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={createForm.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={creating}
                  className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
                  Gender <span className="text-[#93000A]">*</span>
                </label>
                <select
                  name="gender"
                  value={createForm.gender}
                  onChange={handleInputChange}
                  disabled={creating}
                  className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#F1F5F9] flex gap-3">
            <button
              onClick={closeCreatePanel}
              disabled={creating}
              className="flex-1 py-2.5 text-sm font-semibold text-[#3D4946] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePatient}
              disabled={creating}
              className="flex-1 flex items-center justify-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50"
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
                'Create Patient'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}