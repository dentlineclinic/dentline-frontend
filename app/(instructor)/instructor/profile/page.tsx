"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import { changePassword } from "@/services/authService";
import {
  useMyPilatesInstructorProfile,
  useUploadPilatesInstructorPhoto,
} from "@/hooks/usePilates";
import { avatarMedium } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export default function InstructorProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcedChange = searchParams.get("reason") === "must_change_password";

  // ── Password state ──────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Photo state ─────────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data ────────────────────────────────────────────────────────────────
  const { data: profileRes, isLoading: loadingProfile } =
    useMyPilatesInstructorProfile();
  const instructor = profileRes?.data;
  const instructorId = instructor?.id ?? "";

  const uploadPhoto = useUploadPilatesInstructorPhoto();

  // Cleanup the blob URL when the component unmounts
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must be different from the current one");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });

      toast.success("Password changed. Logging you out…");

      setTimeout(() => {
        localStorage.clear();
        document.cookie = "token=; path=/; max-age=0; samesite=strict";
        document.cookie = "role=; path=/; max-age=0; samesite=strict";
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password");
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }
    if (!instructorId) {
      toast.error("Instructor ID not loaded yet");
      return;
    }

    try {
      await uploadPhoto.mutateAsync({ id: instructorId, file: selectedFile });
      toast.success("Profile photo updated");
      setSelectedFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photo");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  const displayName = instructor?.name ?? "";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PI";

  const currentPhoto = photoPreview || instructor?.profilePhotoUrl;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Account Settings"
        subtitle={displayName ? `Welcome, ${displayName.split(" ")[0]}` : "Manage your profile"}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6 max-w-2xl">
        {forcedChange && (
          <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-xl p-5">
            <p className="text-sm font-bold text-[#92400E] mb-1">
              You must change your password before continuing
            </p>
            <p className="text-xs text-[#3D4946]">
              Your account was created with a temporary password. Please set a
              new password to access your dashboard. You will be logged out
              after the change and asked to sign in again.
            </p>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            PROFILE PHOTO
        ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-[#0B1C30] mb-6">
            Profile Photo
          </h2>

          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-full bg-[#CCFBF1] flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-[#E2E8F0]">
              {currentPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    photoPreview
                      ? photoPreview
                      : avatarMedium(currentPhoto ?? "")
                  }
                  alt={displayName || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-[#0F766E]">
                  {initials}
                </span>
              )}
            </div>
            <div>
              <p className="text-base font-bold text-[#0B1C30]">
                {loadingProfile ? "Loading…" : displayName || "Instructor"}
              </p>
              {instructor?.profilePhotoUrl && !photoPreview ? (
                <p className="text-xs text-[#0D9488] mt-1">✓ Profile photo set</p>
              ) : (
                <p className="text-xs text-[#94A3B8] mt-1">
                  {photoPreview ? "Preview — click Upload to save" : "No photo uploaded yet"}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">
                Choose Photo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00685C] file:text-white hover:file:bg-[#008375] cursor-pointer"
              />
              <p className="text-xs text-[#94A3B8]">JPEG, PNG or WEBP · Max 5 MB</p>
            </div>

            {selectedFile && (
              <p className="text-sm text-[#00685C] font-medium">
                Selected: {selectedFile.name}
              </p>
            )}

            <button
              type="button"
              onClick={handlePhotoUpload}
              disabled={uploadPhoto.isPending || !selectedFile}
              className="flex items-center gap-2 bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadPhoto.isPending && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {uploadPhoto.isPending ? "Uploading…" : "Upload Photo"}
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            CHANGE PASSWORD
        ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-[#0B1C30] mb-4">
            Change Password
          </h2>

          {instructor?.email && (
            <div className="bg-[#F8FAFC] rounded-lg p-4 mb-5">
              <p className="text-xs text-[#94A3B8]">Signed in as</p>
              <p className="text-sm font-semibold text-[#0B1C30]">
                {instructor.email}
              </p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">
                Current Password <span className="text-[#93000A]">*</span>
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Your current password"
                className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">
                New Password <span className="text-[#93000A]">*</span>
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
              />
              <p className="text-xs text-[#94A3B8]">At least 8 characters</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">
                Confirm New Password <span className="text-[#93000A]">*</span>
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                className="w-4 h-4 text-[#00685C] rounded border-[#E2E8F0] focus:ring-[#00685C]"
              />
              <span className="text-sm text-[#3D4946]">Show passwords</span>
            </label>

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {submitting ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}