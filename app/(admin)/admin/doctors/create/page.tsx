"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createDoctor } from "@/services/doctorService";

export const dynamic = "force-dynamic";

export default function CreateDoctorPage() {
  const router = useRouter();
  
  // ✅ Updated state with specialization and licenseNumber
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    specialization: "",
    licenseNumber: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit handler with complete validation
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

    // ✅ Specialization validation
    if (!form.specialization) {
      setError("Specialization is required.");
      return;
    }

    // ✅ License number validation
    if (!form.licenseNumber.trim()) {
      setError("License number is required.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Complete payload with all required fields
      const payload = {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        password: form.password,
        specialization: form.specialization,
        licenseNumber: form.licenseNumber.trim(),
      };

      const res = await createDoctor(payload);

      if (res.success) {
        router.push("/admin/doctors?created=true");
      } else {
        setError(res.message || "Failed to create doctor.");
      }
    } catch (err: any) {
      const message =
        err.message ||
        "Failed to create doctor.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-10">
        <div className="max-w-2xl">
          <Link href="/admin/doctors" className="text-sm text-[#0D9488] hover:underline mb-6 inline-block">
            ← Back to Doctors
          </Link>

          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0B1C30] mb-6">Doctor Information</h3>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Form with onSubmit */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">First Name</label>
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
                  <label className="text-sm font-semibold text-[#3D4946]">Last Name</label>
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
                <label className="text-sm font-semibold text-[#3D4946]">Email Address</label>
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

              {/* Password field */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Password</label>
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

              {/* ✅ Specialization field - REQUIRED */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Specialization</label>
                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-3 text-sm text-[#0B1C30] outline-none focus:border-[#00685C] disabled:opacity-50"
                >
                  <option value="">Select specialty</option>
                  <option value="ORTHODONTIST">Orthodontist</option>
                  <option value="ORAL_SURGEON">Oral Surgeon</option>
                  <option value="PERIODONTIST">Periodontist</option>
                  <option value="ENDODONTIST">Endodontist</option>
                  <option value="PEDIATRIC_DENTIST">Pediatric Dentist</option>
                </select>
              </div>

              {/* ✅ License Number field - REQUIRED */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">License Number</label>
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