"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createDoctor, ClinicalModule } from "@/services/doctorService";

export const dynamic = "force-dynamic";

const DENTAL_SPECIALTIES = [
  { value: "ORTHODONTIST", label: "Orthodontist" },
  { value: "ORAL_SURGEON", label: "Oral Surgeon" },
  { value: "PERIODONTIST", label: "Periodontist" },
  { value: "ENDODONTIST", label: "Endodontist" },
  { value: "PEDIATRIC_DENTIST", label: "Pediatric Dentist" },
];

const DERMATOLOGY_SPECIALTIES = [
  { value: "DERMATOLOGIST", label: "Dermatologist" },
  { value: "DERMATOPATHOLOGIST", label: "Dermatopathologist" },
  { value: "PEDIATRIC_DERMATOLOGIST", label: "Pediatric Dermatologist" },
  { value: "COSMETIC_DERMATOLOGIST", label: "Cosmetic Dermatologist" },
  { value: "MOHS_SURGEON", label: "Mohs Surgeon" },
];

export default function CreateDoctorPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    clinicalModule: "" as ClinicalModule | "",
    specialization: "",
    licenseNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic specialization list based on selected module
  const specializationOptions =
    form.clinicalModule === "DENTAL"
      ? DENTAL_SPECIALTIES
      : form.clinicalModule === "DERMATOLOGY"
      ? DERMATOLOGY_SPECIALTIES
      : [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // When the module changes, reset specialization (old value isn't valid for new module)
    if (name === "clinicalModule") {
      setForm(prev => ({
        ...prev,
        clinicalModule: value as ClinicalModule,
        specialization: "",
      }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Name validation
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    // Email validation
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password validation
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPasswordRegex.test(form.password)) {
      setError("Password must be at least 8 characters, include 1 capital letter and 1 number.");
      return;
    }

    // Clinical module validation
    if (!form.clinicalModule) {
      setError("Clinical module is required (Dental or Dermatology).");
      return;
    }

    // Specialization validation
    if (!form.specialization) {
      setError("Specialization is required.");
      return;
    }

    // License number validation
    if (!form.licenseNumber.trim()) {
      setError("License number is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        password: form.password,
        specialization: form.specialization,
        licenseNumber: form.licenseNumber.trim(),
        clinicalModule: form.clinicalModule as ClinicalModule,
      };

      const res = await createDoctor(payload);

      if (res.success) {
        router.push("/admin/doctors?created=true");
      } else {
        setError(res.message || "Failed to create doctor.");
      }
    } catch (err: any) {
      const message = err.message || "Failed to create doctor.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10">
        <div className="max-w-2xl">
          <Link
            href="/admin/doctors"
            className="text-sm text-[#0D9488] hover:underline mb-6 inline-block"
          >
            ← Back to Doctors
          </Link>

          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0B1C30] mb-6">
              Doctor Information
            </h3>

            {error && (
              <div className="mb-6 bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Smith"
                    value={form.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="dr.smith@dentline.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Doctor@1234"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                />
                <p className="text-xs text-[#94A3B8] mt-1">
                  Password must be at least 8 characters, include 1 capital letter and 1 number
                </p>
              </div>

              {/* ✅ NEW: Clinical Module selector */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Clinical Module
                </label>
                <select
                  name="clinicalModule"
                  value={form.clinicalModule}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                >
                  <option value="">Select clinical module</option>
                  <option value="DENTAL">Dental</option>
                  <option value="DERMATOLOGY">Dermatology</option>
                </select>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Determines which module this doctor is authorized to work in
                </p>
              </div>

              {/* ✅ Specialization — options depend on selected module */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Specialization
                </label>
                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  disabled={loading || !form.clinicalModule}
                  required
                  className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                >
                  <option value="">
                    {!form.clinicalModule
                      ? "Select clinical module first"
                      : "Select specialty"}
                  </option>
                  {specializationOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  placeholder="DDS-12345"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Doctor"}
                </button>
                <Link
                  href="/admin/doctors"
                  className="border border-[#F1F5F9] text-[#3D4946] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}