"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/hooks/useRegister";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

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

export default function CompleteRegistrationPage() {
  const router = useRouter();
  const mutation = useRegister();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [hmo, setHmo] = useState("");
  const [hmoId, setHmoId] = useState("");
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  // Guard: redirect back if OTP not verified
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("reg_email");
    const verified = sessionStorage.getItem("reg_otp_verified");

    if (!storedEmail || !verified) {
      router.replace("/register/request-otp");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Full name is required.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
    if (!phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
    if (!dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
    if (!gender) errors.gender = "Please select a gender.";
    if (!emergencyContactName.trim())
      errors.emergencyContactName = "Emergency contact name is required.";
    if (!emergencyContactPhone.trim())
      errors.emergencyContactPhone = "Emergency contact phone is required.";
    

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    setClientErrors({});

    const payload: Parameters<typeof mutation.mutate>[0] = {
      name: name.trim(),
      email,
      password,
      phoneNumber: phoneNumber.trim(),
      dateOfBirth,
      gender,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      medicalHistory: medicalHistory.trim(),
      hmo,
      hmoId: hmoId.trim(),
    };

    if (referenceCode.trim()) {
      payload.referenceCode = referenceCode.trim();
    }

    mutation.mutate(payload, {
      onSuccess: () => {
        sessionStorage.removeItem("reg_email");
        sessionStorage.removeItem("reg_otp_verified");
        router.push("/login");
      },
    });
  };

  const serverError =
    mutation.isError && mutation.error instanceof Error
      ? mutation.error.message
      : mutation.isError
      ? "Registration failed. Please check your details and try again."
      : null;

  const fieldClass = (field: string) =>
    `w-full bg-[#EFF4FF] border rounded-lg px-4 py-3 text-base text-[#0B1C30] outline-none transition-colors ${
      clientErrors[field]
        ? "border-[#93000A] focus:border-[#BA1A1A]"
        : "border-[#BDC9C5] focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C]"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#008375]/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BBD3FD]/20 rounded-full blur-[80px]" />
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-[600px] bg-white rounded-xl shadow-xl border border-[#BDC9C5]/30 p-10">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-[#0F766E] text-white text-xs font-bold flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-[#0F766E]">Email</span>
            </div>
            <div className="flex-1 h-px bg-[#00685C]" />
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-[#0F766E] text-white text-xs font-bold flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-[#0F766E]">Verify</span>
            </div>
            <div className="flex-1 h-px bg-[#00685C]" />
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-[#00685C] text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-semibold text-[#00685C]">Details</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-[#0D9488] font-bold text-xl">
              Dentline Clinic
            </Link>
            <h2 className="text-3xl font-bold text-[#0B1C30] mt-4">Complete Your Profile</h2>
            <p className="text-base text-[#485F83] mt-1">
              Fill in your details to finish creating your Dentline account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Server error */}
            {serverError && (
              <div className="bg-[#FFDAD6] border border-[#FCA5A5] text-[#93000A] px-4 py-3 rounded-lg text-sm font-semibold">
                {serverError}
              </div>
            )}

            {/* Section: Account Info */}
            <div className="flex flex-col gap-1 pb-1">
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
                Account Information
              </p>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">
                Full Name <span className="text-[#93000A]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className={fieldClass("name")}
              />
              {clientErrors.name && (
                <p className="text-xs text-[#93000A] mt-0.5">{clientErrors.name}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-12 pr-4 py-3 text-base text-[#6B7280] outline-none cursor-not-allowed"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">Verified email — cannot be changed.</p>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">
                Password <span className="text-[#93000A]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className={`${fieldClass("password")} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#00685C]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {clientErrors.password && (
                <p className="text-xs text-[#93000A] mt-0.5">{clientErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">
                Confirm Password <span className="text-[#93000A]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className={`${fieldClass("confirmPassword")} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#00685C]"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {clientErrors.confirmPassword && (
                <p className="text-xs text-[#93000A] mt-0.5">{clientErrors.confirmPassword}</p>
              )}
            </div>

            {/* Section: Personal Info */}
            <div className="flex flex-col gap-1 pt-2 pb-1">
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
                Personal Information
              </p>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">
                Phone Number <span className="text-[#93000A]">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className={fieldClass("phoneNumber")}
              />
              {clientErrors.phoneNumber && (
                <p className="text-xs text-[#93000A] mt-0.5">{clientErrors.phoneNumber}</p>
              )}
            </div>

            {/* Date of Birth + Gender (side by side on md+) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Date of Birth <span className="text-[#93000A]">*</span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={fieldClass("dateOfBirth")}
                />
                {clientErrors.dateOfBirth && (
                  <p className="text-xs text-[#93000A] mt-0.5">{clientErrors.dateOfBirth}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Gender <span className="text-[#93000A]">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`${fieldClass("gender")} appearance-none`}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {clientErrors.gender && (
                  <p className="text-xs text-[#93000A] mt-0.5">{clientErrors.gender}</p>
                )}
              </div>
            </div>

            {/* Section: Emergency Contact */}
            <div className="flex flex-col gap-1 pt-2 pb-1">
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
                Emergency Contact
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Contact Name <span className="text-[#93000A]">*</span>
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Jane Doe"
                  className={fieldClass("emergencyContactName")}
                />
                {clientErrors.emergencyContactName && (
                  <p className="text-xs text-[#93000A] mt-0.5">
                    {clientErrors.emergencyContactName}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Contact Phone <span className="text-[#93000A]">*</span>
                </label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+0987654321"
                  className={fieldClass("emergencyContactPhone")}
                />
                {clientErrors.emergencyContactPhone && (
                  <p className="text-xs text-[#93000A] mt-0.5">
                    {clientErrors.emergencyContactPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Section: Medical & Optional */}
            <div className="flex flex-col gap-1 pt-2 pb-1">
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
                Medical & Optional
              </p>
            </div>

            {/* Medical History */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">Medical History / Allergies</label>
              <textarea
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="List any known conditions, allergies, or medications (or type 'None')"
                rows={3}
                className="w-full bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-base text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors resize-none"
              />
            </div>

            {/* HMO Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  HMO <span className="text-[#93000A]">*</span>
                </label>
                <select
                  value={hmo}
                  onChange={(e) => setHmo(e.target.value)}
                  className={`${fieldClass("hmo")} appearance-none`}
                >
                  <option value="">Select HMO</option>
                  {HMO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {clientErrors.hmo && (
                  <p className="text-xs text-[#93000A]">{clientErrors.hmo}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  HMO ID <span className="text-[#93000A]">*</span>
                </label>
                <input
                  type="text"
                  value={hmoId}
                  onChange={(e) => setHmoId(e.target.value)}
                  placeholder="Enter your HMO ID"
                  className={fieldClass("hmoId")}
                />
                {clientErrors.hmoId && (
                  <p className="text-xs text-[#93000A]">{clientErrors.hmoId}</p>
                )}
              </div>
            </div>

            {/* Reference Code */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#3D4946]">
                Reference Code{" "}
                <span className="text-xs font-normal text-[#94A3B8]">(optional)</span>
              </label>
              <input
                type="text"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                placeholder="REF-ABC123"
                className="w-full bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-base text-[#0B1C30] outline-none focus:border-[#00685C] focus:ring-1 focus:ring-[#00685C] transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-[#00685C] text-white font-semibold text-base py-4 rounded-lg shadow-sm hover:bg-[#008375] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {mutation.isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-base text-[#485F83] text-center mt-8">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#00685C] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <footer className="border-t border-[#BDC9C5]/20 px-6 py-8">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-sm text-[#485F83] text-center">
            © 2024 Dentline Clinic. Clinical Excellence Guaranteed.
          </p>
        </div>
      </footer>
    </div>
  );
}