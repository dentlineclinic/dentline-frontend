"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import {
  updatePatientProfile,
  changePassword,
  uploadProfilePhoto,
  fetchPatientProfile,
} from "@/services/patientService";
import { avatarMedium } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const HMO_OPTIONS = [
  { value: "RELIANCE", label: "Reliance" },
  { value: "LEADWAY", label: "Leadway" },
  { value: "REDCARE", label: "Redcare" },
  { value: "NOOR", label: "Noor" },
  { value: "LIFE_WORTH", label: "Life Worth" },
  { value: "LIFE_ACTION", label: "Life Action" },
  { value: "PHILLIPS", label: "Phillips" },
  { value: "VEO", label: "VEO" },
  { value: "ASPIRE", label: "Aspire" },
  { value: "MEDIPLAN", label: "Mediplan" },
  { value: "AVILIA", label: "Avilia" },
  { value: "THT", label: "THT" },
  { value: "HCI", label: "HCI" },
];

export default function PatientProfilePage() {
  const [patientId, setPatientId] = useState<string | null>(null);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [hmo, setHmo] = useState("");
  const [hmoId, setHmoId] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Photo upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Login type for conditional editing
  const [lastVerificationType, setLastVerificationType] = useState<"EMAIL" | "PHONE">("EMAIL");

  // Load user data from backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        let id = localStorage.getItem("userId");

        if (!id) {
          const token = localStorage.getItem("token");
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split(".")[1]));
              id = payload?.id || payload?.userId || null;
              if (id) localStorage.setItem("userId", id);
            } catch {
              // ignore
            }
          }
        }

        if (!id) return;

        setPatientId(id);

        const result = await fetchPatientProfile(id);
        if (!result.success) return;

        const patient = result.data;
        setName(patient.name);
        setEmail(patient.email);
        setPhoneNumber(patient.phoneNumber ?? "");
        setEmergencyContactName(patient.emergencyContactName ?? "");
        setEmergencyContactPhone(patient.emergencyContactPhone ?? "");
        setMedicalHistory(patient.medicalHistory ?? "");
        setHmo(patient.hmo ?? "");
        setHmoId(patient.hmoId ?? "");
        setProfilePhotoUrl(patient.profilePhotoUrl ?? "");
        setLastVerificationType(patient.lastVerificationType!);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile.");
      }
    };

    loadProfile();
  }, []);

  // --- Profile update ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId) {
      toast.error("User not found");
      return;
    }

    setLoading(true);

    try {
      const updatePayload =
        lastVerificationType === "EMAIL"
          ? { phoneNumber }
          : { email };

      const result = await updatePatientProfile(patientId, {
        ...updatePayload,
        emergencyContactName,
        emergencyContactPhone,
        medicalHistory,
        hmo,
        hmoId,
      });

      if (result.success) {
        toast.success(result.message || "Profile updated successfully");

        const patient = result.data;
        setEmail(patient.email);
        setPhoneNumber(patient.phoneNumber ?? "");
        setEmergencyContactName(patient.emergencyContactName ?? "");
        setEmergencyContactPhone(patient.emergencyContactPhone ?? "");
        setMedicalHistory(patient.medicalHistory ?? "");
        setHmo(patient.hmo ?? "");
        setHmoId(patient.hmoId ?? "");
        setProfilePhotoUrl(patient.profilePhotoUrl ?? "");

        localStorage.setItem("userEmail", patient.email);
        localStorage.setItem("userPhone", patient.phoneNumber ?? "");
        localStorage.setItem("emergencyContactName", patient.emergencyContactName ?? "");
        localStorage.setItem("emergencyContactPhone", patient.emergencyContactPhone ?? "");
        localStorage.setItem("medicalHistory", patient.medicalHistory ?? "");
        localStorage.setItem("hmo", patient.hmo ?? "");
        localStorage.setItem("hmoId", patient.hmoId ?? "");
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Password change ---
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
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    setPasswordLoading(true);

    try {
      const result = await changePassword({ currentPassword, newPassword });
      if (result.success) {
        toast.success("Password changed. Logging you out…");
        setTimeout(() => {
          localStorage.clear();
          document.cookie = "token=; path=/; max-age=0; samesite=strict";
          document.cookie = "role=; path=/; max-age=0; samesite=strict";
          window.location.href = "/login";
        }, 2000);
      } else {
        toast.error(result.message || "Failed to change password");
        setPasswordLoading(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
      setPasswordLoading(false);
    }
  };

  // --- Photo upload ---
  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!patientId) {
      toast.error("User not found");
      return;
    }
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
      const result = await uploadProfilePhoto(patientId, selectedFile);
      if (result.success) {
        toast.success(result.message || "Profile photo uploaded successfully");
        const newPhotoUrl = result.data?.profilePhotoUrl ?? "";
        if (newPhotoUrl) {
          setProfilePhotoUrl(newPhotoUrl);
          localStorage.setItem("profilePhotoUrl", newPhotoUrl);
          window.dispatchEvent(new Event("user-auth-updated"));
        }
        setSelectedFile(null);
        setPhotoPreview(null);
        const fileInput = document.getElementById("profile-photo") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(result.message || "Failed to upload profile photo");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setPhotoLoading(false);
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

  const userInitials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  // --- Render ---
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="My Profile" subtitle="Manage your personal information" />

      <main className="flex-1 p-10">
        <div className="max-w-2xl flex flex-col gap-6">
          {/* Profile Photo Upload */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0B1C30] mb-6">Profile Photo</h3>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#CCFBF1] flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoPreview || profilePhotoUrl ? (
                  <img
                    src={photoPreview || avatarMedium(profilePhotoUrl)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-[#0F766E]">{userInitials}</span>
                )}
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#0B1C30]">{name || "Patient"}</h4>
                <p className="text-sm text-[#3D4946]">Patient ID: {patientId || "Loading..."}</p>
                {profilePhotoUrl && !photoPreview && (
                  <p className="text-xs text-[#0D9488] mt-1">✓ Profile photo set</p>
                )}
              </div>
            </div>

            <form onSubmit={handlePhotoUpload} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Upload Photo</label>
                <input
                  type="file"
                  id="profile-photo"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFileSelect}
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00685C] file:text-white hover:file:bg-[#008375]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: JPEG, PNG, WEBP. Max size: 5MB
                </p>
              </div>
              {selectedFile && (
                <div className="text-sm text-[#00685C]">Selected: {selectedFile.name}</div>
              )}
              <button
                type="submit"
                disabled={photoLoading}
                className="bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {photoLoading ? "Uploading..." : "Upload Photo"}
              </button>
            </form>
          </div>

          {/* Personal Information */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0B1C30] mb-6">Personal Information</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Name — read‑only */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Full Name</label>
                <input
                  type="text"
                  value={name}
                  disabled
                  className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#94A3B8] cursor-not-allowed"
                />
                <p className="text-xs text-[#94A3B8]">Name cannot be changed here</p>
              </div>

              {/* Login identifier (read‑only) */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">User Login</label>
                <input
                  type={lastVerificationType === "EMAIL" ? "email" : "tel"}
                  value={lastVerificationType === "EMAIL" ? email : phoneNumber}
                  disabled
                  className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#94A3B8] cursor-not-allowed"
                />
                <p className="text-xs text-[#94A3B8]">
                  {lastVerificationType === "EMAIL"
                    ? "You log in with your email address."
                    : "You log in with your phone number."}
                </p>
              </div>

              {/* Editable identifier */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  {lastVerificationType === "EMAIL" ? "Phone Number" : "Email Address"}
                </label>
                <input
                  type={lastVerificationType === "EMAIL" ? "tel" : "email"}
                  value={lastVerificationType === "EMAIL" ? phoneNumber : email}
                  onChange={(e) =>
                    lastVerificationType === "EMAIL"
                      ? setPhoneNumber(e.target.value)
                      : setEmail(e.target.value)
                  }
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                />
                <p className="text-xs text-[#94A3B8]">
                  {lastVerificationType === "EMAIL"
                    ? "You may update your phone number because you log in with your email."
                    : "You may update your email because you log in with your phone number."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Full name"
                    className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Medical History</label>
                <textarea
                  rows={4}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Any known allergies, conditions, or previous treatments…"
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">HMO</label>
                  <select
                    value={hmo}
                    onChange={(e) => setHmo(e.target.value)}
                    className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  >
                    <option value="">Select HMO</option>
                    {HMO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">HMO ID</label>
                  <input
                    type="text"
                    value={hmoId}
                    onChange={(e) => setHmoId(e.target.value)}
                    placeholder="Enter HMO ID"
                    className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                  />
                </div>
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
                {loading ? "Saving…" : "Save Changes"}
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
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}