"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { updatePatientProfile, changePassword, uploadProfilePhoto } from "@/services/patientService";

export const dynamic = "force-dynamic";

export default function PatientProfilePage() {
  const [patientId, setPatientId] = useState<string | null>(null);
  
  // Profile form state — matches backend fields exactly
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  
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
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user data from localStorage
  useEffect(() => {
    // Try localStorage first; fall back to decoding the JWT
    let id = localStorage.getItem("userId");
    if (!id) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          id = payload?.id || payload?.userId || null;
          if (id) localStorage.setItem("userId", id);
        } catch {
          // ignore malformed token
        }
      }
    }

    const userName = localStorage.getItem("userName") || "";
    const userEmail = localStorage.getItem("userEmail") || "";
    const userPhone = localStorage.getItem("userPhone") || "";
    const savedPhotoUrl = localStorage.getItem("profilePhotoUrl") || "";
    const savedEmergencyName = localStorage.getItem("emergencyContactName") || "";
    const savedEmergencyPhone = localStorage.getItem("emergencyContactPhone") || "";
    const savedMedicalHistory = localStorage.getItem("medicalHistory") || "";

    setPatientId(id);
    setName(userName);
    setEmail(userEmail);
    setPhoneNumber(userPhone);
    setProfilePhotoUrl(savedPhotoUrl);
    setEmergencyContactName(savedEmergencyName);
    setEmergencyContactPhone(savedEmergencyPhone);
    setMedicalHistory(savedMedicalHistory);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) {
      setError("User not found");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updatePatientProfile(patientId, {
        phoneNumber,
        emergencyContactName,
        emergencyContactPhone,
        medicalHistory,
      });

      if (result.success) {
        setSuccess(result.message || "Profile updated successfully");
        
        // Persist updated values to localStorage
        localStorage.setItem("userPhone", phoneNumber);
        localStorage.setItem("emergencyContactName", emergencyContactName);
        localStorage.setItem("emergencyContactPhone", emergencyContactPhone);
        localStorage.setItem("medicalHistory", medicalHistory);
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }

    setPasswordLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        setSuccess(result.message || "Password changed successfully");
        
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || "Failed to change password");
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
      console.error(err);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }
    
    if (!patientId) {
      setError("User not found");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a valid image file (JPEG, PNG, WEBP)");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setPhotoLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await uploadProfilePhoto(patientId, selectedFile);

      if (result.success) {
        setSuccess(result.message || "Profile photo uploaded successfully");
        
        // result.data is PatientDto — read profilePhotoUrl directly
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
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || "Failed to upload profile photo");
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Upload failed. Please try again.";
      setError(message);
      console.error(err);
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Generate local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Get user initials for avatar
  const userInitials = name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="My Profile" subtitle="Manage your personal information" />

      <main className="flex-1 p-10">
        <div className="max-w-2xl flex flex-col gap-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="flex items-center gap-3 bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] px-4 py-3 rounded-xl text-sm font-semibold">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-3 bg-[#FFDAD6] border border-[#FFBAB4] text-[#93000A] px-4 py-3 rounded-xl text-sm font-semibold">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Profile Photo Upload */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0B1C30] mb-6">Profile Photo</h3>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#CCFBF1] flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoPreview || profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview || profilePhotoUrl}
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
                <div className="text-sm text-[#00685C]">
                  Selected: {selectedFile.name}
                </div>
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
              {/* Name — read-only, comes from backend */}
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

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#94A3B8] cursor-not-allowed"
                />
                <p className="text-xs text-[#94A3B8]">Email cannot be changed</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                />
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
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </p>
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