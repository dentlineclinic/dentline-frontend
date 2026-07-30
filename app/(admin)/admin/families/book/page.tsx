"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAdminBookFamilyAppointment } from "@/hooks/useAppointments";
import {
  getFamilyByHeadPatient,
  type FamilyGroupDto,
  type FamilyMemberDto,
} from "@/services/familyService";
import { fetchPatients } from "@/services/patientService";
import type { AdminBookFamilyAppointmentRequest } from "@/services/appointmentService";

export const dynamic = "force-dynamic";

export default function AdminBookFamilyAppointmentPage() {
  const router = useRouter();
  const bookFamilyMutation = useAdminBookFamilyAppointment();

  // Step 1: Search & select head patient
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Step 2: Load family & select members
  const [family, setFamily] = useState<FamilyGroupDto | null>(null);
  const [loadingFamily, setLoadingFamily] = useState(false);
  const [familyError, setFamilyError] = useState<string | null>(null);

  // Step 3: Booking form
  const [appointmentDate, setAppointmentDate] = useState("");
  const [includeHeadPatient, setIncludeHeadPatient] = useState(true);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Debounced patient search
  useEffect(() => {
    if (!patientSearch.trim()) {
      setPatients([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoadingPatients(true);
      try {
        const res = await fetchPatients(0, 10, patientSearch);
        if (res.success) {
          setPatients(res.data.content || []);
        }
      } catch {
        // silent
      } finally {
        setLoadingPatients(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [patientSearch]);

  const selectPatient = async (patientId: string, patientName: string) => {
    if (!patientId) {
      toast.error("Invalid patient selected. Please try again.");
      return;
    }

    setSelectedPatient({ id: patientId, name: patientName });
    setPatientSearch("");
    setPatients([]);
    setFamily(null);
    setSelectedMemberIds([]);
    setFamilyError(null);

    setLoadingFamily(true);
    try {
      const familyRes = await getFamilyByHeadPatient(patientId);

      if (familyRes.success && familyRes.data) {
        setFamily(familyRes.data);
      } else {
        setFamilyError("This patient does not have a family group yet.");
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setFamilyError("This patient does not have a family group yet.");
      } else {
        setFamilyError(err?.message || "Failed to load family.");
      }
    } finally {
      setLoadingFamily(false);
    }
  };

  const members = Array.isArray(family?.members)
    ? (family!.members as FamilyMemberDto[])
    : [];

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectedCount = (includeHeadPatient ? 1 : 0) + selectedMemberIds.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFamilyError(null);

    if (!selectedPatient) {
      toast.error("Please select a head patient first.");
      return;
    }

    if (!appointmentDate) {
      toast.error("Please select an appointment date.");
      return;
    }

    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(appointmentDate) < today) {
      toast.error("Appointment date cannot be in the past.");
      return;
    }

    if (selectedMemberIds.length === 0 && !includeHeadPatient) {
      toast.error(
        "Please select at least one family member or the head patient."
      );
      return;
    }

    // Show confirmation
    const confirmMessage = `Are you sure you want to book ${selectedCount} appointment(s) for ${selectedPatient.name} on ${new Date(appointmentDate).toLocaleDateString()}?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setSubmitting(true);

    try {
      const payload: AdminBookFamilyAppointmentRequest = {
        headPatientId: selectedPatient.id,
        appointmentDate,
        includeHeadPatient,
        familyMemberIds: selectedMemberIds,
      };

      const res = await bookFamilyMutation.mutateAsync(payload);

      if (res.success) {
        const count = res.data?.length || 0;
        toast.success(
          `${count} family appointment${count > 1 ? "s" : ""} booked successfully!`
        );
        router.push("/admin/families");
      } else {
        toast.error(res.message || "Failed to book family appointment.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const clearAll = () => {
    setSelectedPatient(null);
    setFamily(null);
    setFamilyError(null);
    setAppointmentDate("");
    setIncludeHeadPatient(true);
    setSelectedMemberIds([]);
  };

  // Helper to get patient ID from various possible fields
  const getPatientId = (patient: any): string | null => {
    return patient?.id || patient?.patientId || patient?.shortId || patient?.userId || null;
  };

  const getPatientName = (patient: any): string => {
    return patient?.fullName || patient?.name || "Unknown Patient";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-4 lg:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1C30]">
              Book Family Appointment
            </h2>
            <p className="text-sm text-[#94A3B8] mt-1">
              Book appointments for a patient and their family members
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/families")}
            className="text-sm font-semibold text-[#0D9488] hover:underline"
          >
            ← Back to Families
          </button>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 sm:p-8 shadow-sm">
            {/* Step 1: Select Head Patient */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#0B1C30] mb-3">
                 Select Head Patient
              </h3>

              {selectedPatient ? (
                <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0B1C30]">
                      {selectedPatient.name}
                    </p>
                    <p className="text-xs text-[#0D9488]">
                      Patient ID: {selectedPatient.id ? selectedPatient.id.slice(0, 8) : "N/A"}...
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs font-semibold text-[#93000A] hover:underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search for a patient by name..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full bg-white border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
                    autoFocus
                  />
                  {patientSearch.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#F1F5F9] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {loadingPatients ? (
                        <div className="p-4 text-sm text-[#94A3B8] text-center">
                          Searching...
                        </div>
                      ) : patients.length === 0 ? (
                        <div className="p-4 text-sm text-[#94A3B8] text-center">
                          No patients found
                        </div>
                      ) : (
                        patients.map((p, index) => {
                          const patientId = getPatientId(p);
                          const patientName = getPatientName(p);
                          
                          return (
                            <button
                              key={patientId || `patient-${index}`}
                              type="button"
                              onClick={() => {
                                if (patientId) {
                                  selectPatient(patientId, patientName);
                                } else {
                                  toast.error("Invalid patient data. Please try again.");
                                }
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-[#F8FAFC] border-b border-[#F1F5F9] last:border-b-0 transition-colors"
                            >
                              <p className="text-sm font-semibold text-[#0B1C30]">
                                {patientName}
                              </p>
                              <p className="text-xs text-[#94A3B8]">
                                {p.referenceCode || p.email || ""}
                              </p>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2 & 3: Booking Form */}
            {selectedPatient && (
              <>
                {loadingFamily ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00685C]"></div>
                    <p className="mt-2 text-sm text-[#94A3B8]">
                      Loading family members...
                    </p>
                  </div>
                ) : familyError ? (
                  <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                    {familyError}
                    {familyError === "This patient does not have a family group yet." && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/families/create`)}
                          className="text-xs font-semibold text-[#0D9488] hover:underline"
                        >
                          + Create Family Group
                        </button>
                      </div>
                    )}
                  </div>
                ) : family ? (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <hr className="border-[#F1F5F9]" />

                    <h3 className="text-base font-bold text-[#0B1C30]">
                      Step 2: Configure Appointments
                    </h3>

                    {/* Family Info */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-[#0B1C30]">
                            {family.familyName}
                          </p>
                          <p className="text-xs text-[#94A3B8] mt-0.5">
                            Head: {family.headPatientName || "—"} •{" "}
                            {members.length} member
                            {members.length === 1 ? "" : "s"}
                          </p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0F766E]">
                          {selectedCount} selected
                        </span>
                      </div>
                    </div>

                    {/* Appointment Date */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-[#3D4946]">
                        Appointment Date *
                      </label>
                      <input
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
                      />
                    </div>

                    {/* Include Head Patient Toggle */}
                    <div className="bg-white border border-[#F1F5F9] rounded-xl p-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeHeadPatient}
                          onChange={(e) =>
                            setIncludeHeadPatient(e.target.checked)
                          }
                          className="w-5 h-5 rounded border-[#BDC9C5] text-[#00685C] focus:ring-[#00685C]"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#0B1C30]">
                            Include {family.headPatientName || "head patient"}
                          </p>
                          <p className="text-xs text-[#94A3B8]">
                            Book an appointment for the head patient as well
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Family Members Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-[#0B1C30]">
                          Select Family Members
                        </h4>
                        {selectedMemberIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedMemberIds([])}
                            className="text-xs text-[#0D9488] hover:underline"
                          >
                            Clear selection
                          </button>
                        )}
                      </div>

                      {members.length === 0 ? (
                        <p className="text-sm text-[#94A3B8]">
                          No family members found in this group.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {members.map((m, index) => {
                            const memberId = String(m.id);
                            const isSelected =
                              selectedMemberIds.includes(memberId);

                            return (
                              <label
                                key={m.id || `member-${index}`}
                                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-[#00685C] bg-[#F0FDFA]"
                                    : "border-[#F1F5F9] bg-white hover:border-[#00685C]/30"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleMember(memberId)}
                                  className="w-5 h-5 rounded border-[#BDC9C5] text-[#00685C] focus:ring-[#00685C]"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-[#0B1C30]">
                                    {m.name || "—"}
                                  </p>
                                  <p className="text-xs text-[#94A3B8]">
                                    {m.relationship || "—"} • {m.gender || "—"}
                                    {m.dateOfBirth
                                      ? ` • ${new Date(m.dateOfBirth).toLocaleDateString()}`
                                      : ""}
                                    {m.linkedPatientId && (
                                      <span className="ml-2 text-[#00685C]">
                                        • Patient ID:{" "}
                                        {m.linkedPatientId.slice(0, 8)}...
                                      </span>
                                    )}
                                  </p>
                                </div>
                                {m.promoted && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    ✓ Account
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Selected Summary */}
                    {selectedCount > 0 && (
                      <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl p-3">
                        <p className="text-sm font-medium text-[#0B1C30]">
                          Booking for: {selectedPatient.name}
                          {includeHeadPatient && " (Head Patient)"}
                          {selectedMemberIds.length > 0 && ` + ${selectedMemberIds.length} family member(s)`}
                        </p>
                        {selectedMemberIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {members
                              .filter(m => selectedMemberIds.includes(String(m.id)))
                              .map(m => (
                                <span key={m.id} className="text-xs bg-white px-2 py-0.5 rounded-full text-[#00685C]">
                                  {m.name}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={clearAll}
                        className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC]"
                        disabled={submitting}
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || selectedCount === 0}
                        className="bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
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
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                            Booking...
                          </span>
                        ) : (
                          `Book ${selectedCount} Appointment${selectedCount > 1 ? "s" : ""}`
                        )}
                      </button>
                    </div>
                  </form>
                ) : null}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}