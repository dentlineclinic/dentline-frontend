"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import {
  updatePatientProfile,
  changePassword,
  uploadProfilePhoto,
  fetchMyPatientProfile,
} from "@/services/patientService";
import { avatarMedium } from "@/lib/cloudinary";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

const HMO_OPTIONS = [
  { value: "RELIANCE", label: "Reliance" },
  { value: "LEADWAY", label: "Leadway" },
  { value: "REDCARE", label: "Redcare" },
  { value: "NOOR", label: "Noor" },
  { value: "LIFE_WORTH", label: "Life Worth" },
  { value: "LIFE_ACTION", label: "Life Action" },
  { value: "PHILLIPS", label: "Phillips" },
  { value: "VEO", label: "Veo" },
  { value: "ASPIRE", label: "Aspire" },
  { value: "MEDIPLAN", label: "Mediplan" },
  { value: "AVILIA", label: "Avilia" },
  { value: "THT", label: "THT" },
  { value: "HCI", label: "HCI" },
  { value: "NOVO", label: "Novo" },
  { value: "ALTU", label: "Altu" },
  { value: "AXAMANSARD", label: "Axamansard" },
];

export default function PatientProfilePage() {
  // IMPORTANT: Use userId for API calls, patientId for display only
  const [userId, setUserId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [passwordChangeReason, setPasswordChangeReason] = useState<string | null>(null);

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
  const [showLogoutCountdown, setShowLogoutCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Login type for conditional editing
  const [lastVerificationType, setLastVerificationType] = useState<"EMAIL" | "PHONE">("EMAIL");
  
  // MUST CHANGE PASSWORD FLAG
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const searchParams = useSearchParams();

  // Handle logout countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showLogoutCountdown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showLogoutCountdown && countdown === 0) {
      performLogout();
    }
    return () => clearTimeout(timer);
  }, [showLogoutCountdown, countdown]);

  const performLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    
    document.cookie = "token=; path=/; max-age=0; samesite=strict";
    document.cookie = "role=; path=/; max-age=0; samesite=strict";
    document.cookie = "refreshToken=; path=/; max-age=0; samesite=strict";
    
    window.location.href = "/login?reason=password_changed";
  };

  // Load user data from backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await fetchMyPatientProfile();
        
        if (!result.success) {
          toast.error("Failed to load profile");
          return;
        }

        const patient = result.data;
        
        // CRITICAL: Store userId for API calls, patientId for display
        setUserId(patient.userId);      // This is the User ID
        setPatientId(patient.patientId); // This is the Patient ID (for display)
        
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

        const mustChange = localStorage.getItem("mustChangePassword") === "true";
        setMustChangePassword(mustChange);

        const reason = searchParams.get("reason");
        if (reason === "must_change_password") {
          setPasswordChangeReason("You were redirected here because you need to change your temporary password.");
          toast.warning("🔒 Please change your temporary password to continue", {
            position: "top-center",
            autoClose: false,
            toastId: "must-change-password",
          });
        } else if (mustChange) {
          setPasswordChangeReason("For security reasons, you must change your temporary password before accessing the dashboard.");
          toast.warning("🔒 Temporary password detected - Please change it now", {
            position: "top-center",
            autoClose: 5000,
            toastId: "temp-password-warning",
          });
        }

        if (reason === "password_changed") {
          toast.success("✅ Password changed successfully! Please login with your new password.", {
            position: "top-center",
            autoClose: 5000,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile.");
      }
    };

    loadProfile();
  }, [searchParams]);

  // --- Profile update ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // CRITICAL: Check userId (not patientId)
    if (!userId) {
      toast.error("User not found");
      return;
    }

    setLoading(true);

    try {
      const updatePayload =
        lastVerificationType === "EMAIL"
          ? { phoneNumber }
          : { email };

      // CRITICAL: Use userId for the API call
      const result = await updatePatientProfile(userId, {
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
      toast.error(err.message || "Something went wrong. Please try again.");
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
        localStorage.removeItem("mustChangePassword");
        setMustChangePassword(false);
        setPasswordChangeReason(null);
        
        toast.success("✅ Password changed successfully! You will be logged out for security.", {
          position: "top-center",
          autoClose: 3000,
        });
        
        setShowLogoutCountdown(true);
        setCountdown(5);
        
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.message || "Failed to change password");
        setPasswordLoading(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
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
    
    // CRITICAL: Check userId (not patientId)
    if (!userId) {
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
      // CRITICAL: Use userId for the API call
      const result = await uploadProfilePhoto(userId, selectedFile);
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
      toast.error(err.message || "Upload failed. Please try again.");
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
          {/* Logout Countdown Overlay */}
          {showLogoutCountdown && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1C30] mb-2">Password Changed Successfully!</h3>
                <p className="text-[#485F83] mb-4">
                  For security reasons, you will be logged out in <span className="font-bold text-[#00685C]">{countdown}</span> seconds.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-[#00685C] h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${(countdown / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Please login again with your new password.
                </p>
                <button
                  onClick={() => performLogout()}
                  className="mt-4 text-sm text-[#00685C] hover:underline font-semibold"
                >
                  Logout now
                </button>
              </div>
            </div>
          )}

          {/* MUST CHANGE PASSWORD - CONTEXTUAL BANNER */}
          {passwordChangeReason && !showLogoutCountdown && (
            <div className="bg-[#FFF3CD] border-2 border-[#FFEAA7] rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#FFEAA7] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-[#856404]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#856404]">🔒 Password Change Required</h3>
                  <p className="text-sm text-[#856404] mt-1">
                    {passwordChangeReason}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-block bg-[#856404]/10 text-[#856404] text-xs font-semibold px-3 py-1 rounded-full">
                      ⏳ Temporary password detected
                    </span>
                    <span className="inline-block bg-[#856404]/10 text-[#856404] text-xs font-semibold px-3 py-1 rounded-full">
                      🔑 One-time change required
                    </span>
                    <span className="inline-block bg-[#856404]/10 text-[#856404] text-xs font-semibold px-3 py-1 rounded-full">
                      ⚡ Immediate action needed
                    </span>
                  </div>
                  <div className="mt-4 p-3 bg-white/50 rounded-lg border border-[#FFEAA7]">
                    <p className="text-sm text-[#856404]">
                      <span className="font-bold">💡 How to proceed:</span> Enter your current temporary password below, then create and confirm a new secure password. Your password must be at least 8 characters long.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                {mustChangePassword && !showLogoutCountdown && (
                  <p className="text-xs text-[#856404] mt-1 font-semibold">⚠️ Please change your password below</p>
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

          {/* Change Password - HIGHLIGHTED when must change password */}
          <div className={`bg-white border ${mustChangePassword ? 'border-2 border-[#FFEAA7] shadow-lg' : 'border-[#F1F5F9] shadow-sm'} rounded-xl p-8`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#0B1C30]">Change Password</h3>
              {mustChangePassword && !showLogoutCountdown && (
                <span className="bg-[#FFF3CD] text-[#856404] text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  ⚠️ Required
                </span>
              )}
            </div>

            <form onSubmit={handlePasswordChange} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className={`bg-[#EFF4FF] border ${mustChangePassword ? 'border-[#FFEAA7] focus:border-[#856404] focus:ring-2 focus:ring-[#856404]/20' : 'border-[#BDC9C5] focus:border-[#00685C]'} rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none transition-all`}
                />
                {mustChangePassword && !showLogoutCountdown && (
                  <p className="text-xs text-[#856404] mt-1 flex items-center gap-1">
                    <span>🔑</span> Enter the temporary password you received from the clinic
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C] focus:ring-2 focus:ring-[#00685C]/20 transition-all"
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
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C] focus:ring-2 focus:ring-[#00685C]/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className={`${mustChangePassword ? 'bg-[#856404] hover:bg-[#6B5300]' : 'bg-[#00685C] hover:bg-[#008375]'} text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                {passwordLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  mustChangePassword ? "⚠️ Change Temporary Password" : "Update Password"
                )}
              </button>

              {mustChangePassword && !showLogoutCountdown && (
                <div className="mt-2 p-3 bg-[#FFF3CD] border border-[#FFEAA7] rounded-lg">
                  <p className="text-xs text-[#856404]">
                    <span className="font-bold">⚠️ Important:</span> You must change your temporary password to continue using the system. 
                    After changing, you will be logged out for security reasons and must log in again with your new password.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}