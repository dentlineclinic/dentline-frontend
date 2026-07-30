// app/admin/families/create/page.tsx

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  createFamily,
  type CreateFamilyMemberRequest,
  type CreateFamilyRequest,
  type Gender,
  type FamilyRelationship,
} from "@/services/familyService";

const GENDER_OPTIONS: Gender[] = ["MALE", "FEMALE", "OTHER"];
const RELATIONSHIP_OPTIONS: FamilyRelationship[] = [
  "SON",
  "DAUGHTER",
  "SPOUSE",
  "PARENT",
  "OTHER",
];

export default function CreateFamilyPage() {
  const router = useRouter();

  const [familyName, setFamilyName] = useState("");
  const [headPatientId, setHeadPatientId] = useState("");

  const [members, setMembers] = useState<CreateFamilyMemberRequest[]>([
    {
      name: "",
      dateOfBirth: "",
      gender: "MALE",
      relationship: "OTHER",
      medicalHistory: "", // Added
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAddMore = members.length < 10;

  const updateMember = (
    index: number,
    patch: Partial<CreateFamilyMemberRequest>
  ) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const addMember = () => {
    if (!canAddMore) return;
    setMembers((prev) => [
      ...prev,
      { 
        name: "", 
        dateOfBirth: "", 
        gender: "MALE", 
        relationship: "OTHER",
        medicalHistory: "", // Added
      },
    ]);
  };

  const validate = () => {
    if (!familyName.trim()) return "Family name is required";
    if (!headPatientId.trim()) return "Head patient id is required";
    if (!members.length) return "At least one member is required";

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name?.trim()) return `Member ${i + 1}: name is required`;
      if (!m.dateOfBirth?.trim()) return `Member ${i + 1}: date of birth is required`;
      if (!m.gender) return `Member ${i + 1}: gender is required`;
      if (!m.relationship) return `Member ${i + 1}: relationship is required`;
    }

    return null;
  };

  const payload: CreateFamilyRequest = useMemo(() => {
    return {
      familyName: familyName.trim(),
      headPatientId: headPatientId.trim(),
      members: members.map((m) => ({
        name: m.name.trim(),
        dateOfBirth: (m.dateOfBirth || "").trim(),
        gender: m.gender,
        relationship: m.relationship,
        medicalHistory: (m.medicalHistory || "").trim() || undefined, // Added
      })),
    };
  }, [familyName, headPatientId, members]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      setSubmitting(true);
      const res = await createFamily(payload);

      if (res.success) {
        toast.success("Family created successfully!");
        router.push("/admin/families?created=true");
        return;
      }

      setError(res.message || "Failed to create family.");
    } catch (err: any) {
      setError(err?.message || "Failed to create family.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-4 lg:gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1C30]">Create Family</h2>
          <button
            type="button"
            onClick={() => router.push("/admin/families")}
            className="text-sm font-semibold text-[#0D9488] hover:underline"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#3D4946]">Family Name *</label>
              <input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00685C]"
                placeholder="Smith"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#3D4946]">Head Patient ID *</label>
              <input
                value={headPatientId}
                onChange={(e) => setHeadPatientId(e.target.value)}
                className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00685C]"
                placeholder="<head-patient-user-id>"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B1C30]">Members</h3>
            <button
              type="button"
              onClick={addMember}
              disabled={!canAddMore}
              className="text-sm font-semibold px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add member
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {members.map((m, idx) => (
              <div key={idx} className="border border-[#F1F5F9] rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-[#0B1C30]">Member {idx + 1}</p>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="text-xs font-semibold text-[#93000A] hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#3D4946]">Name *</label>
                    <input
                      value={m.name}
                      onChange={(e) => updateMember(idx, { name: e.target.value })}
                      className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00685C]"
                      placeholder="John Smith"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#3D4946]">Date of Birth *</label>
                    <input
                      type="date"
                      value={(m.dateOfBirth as string) || ""}
                      onChange={(e) => updateMember(idx, { dateOfBirth: e.target.value })}
                      className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00685C]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#3D4946]">Gender *</label>
                    <select
                      value={m.gender || "MALE"}
                      onChange={(e) =>
                        updateMember(idx, { gender: e.target.value as Gender })
                      }
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
                    <label className="text-sm font-semibold text-[#3D4946]">Relationship *</label>
                    <select
                      value={m.relationship || "OTHER"}
                      onChange={(e) =>
                        updateMember(idx, {
                          relationship: e.target.value as FamilyRelationship,
                        })
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
                      value={m.medicalHistory || ""}
                      onChange={(e) => updateMember(idx, { medicalHistory: e.target.value })}
                      className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00685C] resize-none"
                      placeholder="Any medical conditions, allergies, medications, etc."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/families")}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC]"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[#00685C] text-white text-sm font-semibold hover:bg-[#008375] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating…" : "Create Family"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}