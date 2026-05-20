"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import { changePassword, uploadDoctorProfilePhoto } from "@/services/doctorService";
import { getDoctorId } from "@/services/authService";
import { avatarMedium } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export default function DoctorSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDoctorName(localStorage.getItem("userName") ?? "");
    setProfilePhotoUrl(localStorage.getItem("profilePhotoUrl") ?? "");
    setDoctorId(getDoctorId());
  }, []);

  const initials = doctorName
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DR";

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({ currentPassword, newPassword });
      if (res.success) {
        toast.success("Password changed. Logging you out…");
        // Clear all session data and redirect to login
        setTimeout(() => {
          localStorage.clear();
          document.cookie = "token=; path=/; max-age=0; samesite=strict";
          document.cookie = "role=; path=/; max-age=0; samesite=strict";
          window.location.href = "/login";
        }, 2000);
      } else {
        toast.error(res.message || "Failed to change password");
        setLoading(false);
      }
    } catch {
      toast.error("Failed to change password");
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) { toast.error("Please select a file to upload"); return; }
    if (!doctorId) { toast.error("Doctor ID not found"); return; }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, WEBP)");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setPhotoLoading(true);
    try {
      const res = await uploadDoctorProfilePhoto(doctorId, selectedFile);
      if (res.success) {
        const newPhotoUrl = res.data?.profilePhotoUrl ?? "";
        if (newPhotoUrl) {
          setProfilePhotoUrl(newPhotoUrl);
          localStorage.setItem("profilePhotoUrl", newPhotoUrl);
          window.dispatchEvent(new Event("user-auth-updated"));
        }
        toast.success(res.message || "Profile photo uploaded successfully");
        setSelectedFile(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        toast.error(res.message || "Failed to upload profile photo");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Account Settings" subtitle="Manage your profile and preferences" />

      <main className="flex-1 p-10">
        <div className="max-w-2xl flex flex-col gap-6">

          {/* Profile Photo */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0B1C30] mb-6">Profile Photo</h3>

            {/* Avatar preview */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#CCFBF1] flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-[#E2E8F0]">
                {photoPreview || profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview || avatarMedium(profilePhotoUrl)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-[#0F766E]">{initials}</span>
                )}
              </div>
              <div>
                <p className="text-base font-bold text-[#0B1C30]">{doctorName || "Doctor"}</p>
                {profilePhotoUrl && !photoPreview
                  ? <p className="text-xs text-[#0D9488] mt-1">✓ Profile photo set</p>
                  : <p className="text-xs text-[#94A3B8] mt-1">No photo uploaded yet</p>
                }
              </div>
            </div>

            <form onSubmit={handlePhotoUpload} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Choose Photo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="profile-photo"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFileSelect}
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00685C] file:text-white hover:file:bg-[#008375] cursor-pointer"
                />
                <p className="text-xs text-[#94A3B8]">JPEG, PNG or WEBP · Max 5 MB</p>
              </div>
              {selectedFile && (
                <p className="text-sm text-[#00685C] font-medium">Selected: {selectedFile.name}</p>
              )}
              <button
                type="submit"
                disabled={photoLoading || !selectedFile}
                className="flex items-center gap-2 bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {photoLoading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {photoLoading ? "Uploading…" : "Upload Photo"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0B1C30] mb-6">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
                />
                <p className="text-xs text-[#94A3B8]">At least 8 characters</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}