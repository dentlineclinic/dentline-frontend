// components/modals/AdminFamilyModal.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import type {
  FamilyGroupDto,
  FamilyMemberDto,
  FamilyRelationship,
  Gender,
} from "@/services/familyService";
import {
  addMemberToFamily,
  getFamily,
  promoteFamilyMember,
  type AddFamilyMemberRequest,
} from "@/services/familyService";

const GENDER_OPTIONS: Gender[] = ["MALE", "FEMALE", "OTHER"];
const RELATIONSHIP_OPTIONS: FamilyRelationship[] = [
  "SON",
  "DAUGHTER",
  "SPOUSE",
  "PARENT",
  "OTHER",
];

type Props = {
  isOpen: boolean;
  familyId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function AdminFamilyModal({
  isOpen,
  familyId,
  onClose,
  onUpdated,
}: Props) {
  const [family, setFamily] = useState<FamilyGroupDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track which member is being promoted
  const [promotingMemberId, setPromotingMemberId] = useState<string | null>(
    null
  );
  
  // Promotion form data for each member
  const [promoteData, setPromoteData] = useState<
    Record<string, { email: string; password: string }>
  >({});

  // Track which member's promotion form is visible
  const [showPromotionForm, setShowPromotionForm] = useState<string | null>(null);

  const [addMemberName, setAddMemberName] = useState("");
  const [addMemberDob, setAddMemberDob] = useState("");
  const [addMemberGender, setAddMemberGender] = useState<Gender>("MALE");
  const [addMemberRelationship, setAddMemberRelationship] = useState<
    FamilyRelationship
  >("OTHER");
  const [addMemberMedicalHistory, setAddMemberMedicalHistory] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const canAdd = useMemo(() => {
    const count = Array.isArray(family?.members) ? family?.members?.length : 0;
    return count < 10;
  }, [family]);

  const fetchFamily = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFamily(id);
      if (res.success) {
        setFamily(res.data);
      } else {
        setError(res.message || "Failed to load family.");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load family.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !familyId) return;
    fetchFamily(familyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, familyId]);

  const refreshAfterMutation = async () => {
    if (familyId) await fetchFamily(familyId);
    onUpdated?.();
  };

  // Show promotion form for a member
  const showPromotionFormForMember = (memberId: string) => {
    if (!promoteData[memberId]) {
      setPromoteData((prev) => ({
        ...prev,
        [memberId]: { email: "", password: "" },
      }));
    }
    setShowPromotionForm(memberId);
  };

  // Hide promotion form
  const hidePromotionForm = (memberId: string) => {
    setShowPromotionForm(null);
    setPromoteData((prev) => {
      const newState = { ...prev };
      delete newState[memberId];
      return newState;
    });
  };

  const onClickPromote = async (memberId: string) => {
    const data = promoteData[memberId];
    if (!data) return;

    const email = data.email.trim();
    const password = data.password.trim();

    // Validation
    if (!email) {
      toast.error("Email is required.");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setPromotingMemberId(memberId);
    try {
      const res = await promoteFamilyMember(memberId, {
        email: email,
        password: password,
      });

      if (res.success) {
        toast.success("Family member promoted successfully!");
        hidePromotionForm(memberId);
        setPromotingMemberId(null);
        await refreshAfterMutation();
      } else {
        toast.error(res.message || "Failed to promote member.");
        setPromotingMemberId(null);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to promote member.");
      setPromotingMemberId(null);
    }
  };

  const onClickAddMember = async () => {
    if (!familyId) return;
    if (!addMemberName.trim()) {
      toast.error("Member name is required");
      return;
    }

    if (!addMemberDob.trim()) {
      toast.error("Date of birth is required");
      return;
    }

    if (!canAdd) {
      toast.error("Maximum of 10 family members reached.");
      return;
    }

    setAddingMember(true);
    try {
      const payload: AddFamilyMemberRequest = {
        name: addMemberName.trim(),
        dateOfBirth: addMemberDob,
        gender: addMemberGender,
        relationship: addMemberRelationship,
      };

      if (addMemberMedicalHistory.trim()) {
        payload.medicalHistory = addMemberMedicalHistory.trim();
      }

      const res = await addMemberToFamily(familyId, payload);

      if (res.success) {
        toast.success("Family member added successfully!");
        setAddMemberName("");
        setAddMemberDob("");
        setAddMemberGender("MALE");
        setAddMemberRelationship("OTHER");
        setAddMemberMedicalHistory("");
        await refreshAfterMutation();
      } else {
        toast.error(res.message || "Failed to add member.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to add member.");
    } finally {
      setAddingMember(false);
    }
  };

  const members: FamilyMemberDto[] = Array.isArray(family?.members)
    ? (family!.members as FamilyMemberDto[])
    : [];

  const renderMemberCard = (m: FamilyMemberDto) => {
    const memberId = String(m.id);
    
    // ONLY use the promoted field - NOT linkedPatientId
    const isPromoted = m.promoted === true;
    
    const isPromoting = promotingMemberId === memberId;
    const showForm = showPromotionForm === memberId;
    const promoteFormData = promoteData[memberId] || { email: "", password: "" };

    return (
      <div
        key={m.id}
        className={`bg-white border rounded-xl p-4 flex flex-col gap-3 ${
          isPromoted ? 'border-green-200 bg-green-50' : 'border-[#F1F5F9]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-[#0B1C30]">{m.name || "—"}</p>
              {isPromoted && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  ✓ Promoted
                </span>
              )}
              {m.linkedPatientId && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Patient ID: {m.linkedPatientId.slice(0, 8)}
                </span>
              )}
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              DOB: {m.dateOfBirth ? new Date(m.dateOfBirth).toLocaleDateString() : "—"}
            </p>
            <p className="text-xs text-[#94A3B8]">
              Gender: {m.gender || "—"} • Relationship: {m.relationship || "—"}
            </p>
            {m.medicalHistory && (
              <p className="text-xs text-[#6B7280] mt-1 border-t border-[#F1F5F9] pt-1">
                <span className="font-semibold">Medical History:</span> {m.medicalHistory}
              </p>
            )}
            {/* Show status: has patient record but not promoted */}
            {!isPromoted && m.linkedPatientId && (
              <p className="text-xs text-[#F59E0B] mt-1">
                ⚠️ Has medical record - needs to be promoted to create user account
              </p>
            )}
          </div>
          
          {/* Promote Button - Show if NOT promoted */}
          {!isPromoted && !showForm && (
            <button
              onClick={() => showPromotionFormForMember(memberId)}
              className="bg-[#00685C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#008375] transition-colors whitespace-nowrap"
            >
              Promote
            </button>
          )}
        </div>

        {/* Promotion Form - Shows when Promote button is clicked */}
        {!isPromoted && showForm && (
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#0B1C30]">
                Create Patient Account
              </p>
              {isPromoting && (
                <span className="text-xs text-[#0D9488] animate-pulse">Processing...</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#3D4946] font-semibold">
                  Email *
                </label>
                <input
                  type="email"
                  value={promoteFormData.email}
                  onChange={(e) =>
                    setPromoteData((prev) => ({
                      ...prev,
                      [memberId]: { ...prev[memberId], email: e.target.value },
                    }))
                  }
                  className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00685C]"
                  placeholder="email@example.com"
                  disabled={isPromoting}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#3D4946] font-semibold">
                  Password *
                </label>
                <input
                  type="password"
                  value={promoteFormData.password}
                  onChange={(e) =>
                    setPromoteData((prev) => ({
                      ...prev,
                      [memberId]: { ...prev[memberId], password: e.target.value },
                    }))
                  }
                  className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00685C]"
                  placeholder="Min 6 characters"
                  disabled={isPromoting}
                />
                <p className="text-xs text-[#94A3B8]">
                  Must be at least 6 characters
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => hidePromotionForm(memberId)}
                className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] transition-colors"
                disabled={isPromoting}
              >
                Cancel
              </button>
              <button
                disabled={isPromoting}
                onClick={() => onClickPromote(memberId)}
                className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPromoting ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Promoting...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Family"
      subtitle={family?.familyName ? `Family name: ${family.familyName}` : undefined}
      size="xl"
    >
      {loading && (
        <div className="flex justify-center py-8">
          <div className="inline-flex items-center gap-2 text-xs text-[#0D9488] bg-[#F0FDFA] px-3 py-1 rounded-full">
            <svg
              className="animate-spin h-3 w-3"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading…
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && family && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] font-semibold">Family Name</p>
              <p className="text-sm font-bold text-[#0B1C30] mt-1">
                {family.familyName}
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] font-semibold">Head Patient</p>
              <p className="text-sm font-bold text-[#0B1C30] mt-1">
                {family.headPatientName || "—"}
              </p>
              {family.headPatientReferenceCode && (
                <p className="text-xs text-[#94A3B8] mt-1">
                  Ref: {family.headPatientReferenceCode}
                </p>
              )}
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] font-semibold">Members</p>
              <p className="text-sm font-bold text-[#0B1C30] mt-1">
                {members.length} member{members.length === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-[#0D9488] mt-1">
                {members.filter(m => m.promoted === true).length} promoted
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#0B1C30] mb-3">
              Family Members
              <span className="text-sm font-normal text-[#94A3B8] ml-2">
                ({members.filter(m => m.promoted === true).length} promoted)
              </span>
            </h3>

            {members.length === 0 ? (
              <div className="text-sm text-[#94A3B8]">No members found.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {members.map((m) => renderMemberCard(m))}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#F1F5F9] rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#0B1C30]">
                  Add Family Member
                </h3>
                <p className="text-sm text-[#94A3B8] mt-1">
                  Adds a dependent member to this family. They can be promoted to a patient later.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0F766E]">
                {members.length}/10
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#3D4946]">Full Name *</label>
                <input
                  value={addMemberName}
                  onChange={(e) => setAddMemberName(e.target.value)}
                  className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00685C]"
                  placeholder="John Smith"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={addMemberDob}
                  onChange={(e) => setAddMemberDob(e.target.value)}
                  className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00685C]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#3D4946]">Gender *</label>
                <select
                  value={addMemberGender}
                  onChange={(e) => setAddMemberGender(e.target.value as Gender)}
                  className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00685C]"
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Relationship *
                </label>
                <select
                  value={addMemberRelationship}
                  onChange={(e) =>
                    setAddMemberRelationship(
                      e.target.value as FamilyRelationship
                    )
                  }
                  className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00685C]"
                >
                  {RELATIONSHIP_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Medical History
                </label>
                <textarea
                  value={addMemberMedicalHistory}
                  onChange={(e) => setAddMemberMedicalHistory(e.target.value)}
                  className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00685C] resize-none"
                  placeholder="Any medical conditions, allergies, medications, etc."
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                disabled={addingMember || !canAdd}
                onClick={onClickAddMember}
                className="flex items-center gap-2 bg-[#00685C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingMember ? "Adding…" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}