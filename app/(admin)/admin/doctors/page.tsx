"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Doctor = {
  id: string;
  shortId: string;
  fullName: string;
  initials: string;
  specialty: string;
  email: string;
  patients: number;
  status: string;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/doctors", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
        });
        const result = await res.json();
        if (result.success) setDoctors(result.data);
        else setError(result.message);
      } catch {
        setError("Failed to load doctors.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visible = doctors.filter(d =>
    d.fullName.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <input
            type="search"
            placeholder="Search doctors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-full sm:w-72"
          />
          <Link
            href="/admin/doctors/create"
            className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors"
          >
            + Add Doctor
          </Link>
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#F1F5F9] animate-pulse flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="text-sm text-[#94A3B8] text-center py-10">No doctors found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {visible.map(doc => (
              <div key={doc.id} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#F0FDFA] flex items-center justify-center text-lg font-bold text-[#00685C] flex-shrink-0">
                  {doc.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[#0B1C30]">{doc.fullName}</h3>
                      <p className="text-sm text-[#0D9488] font-semibold">{doc.specialty}</p>
                      <p className="text-xs text-[#3D4946] mt-1">{doc.email}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${doc.status === "Active" ? "bg-[#F0FDFA] text-[#0F766E]" : "bg-[#FFDAD6] text-[#93000A]"}`}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-[#3D4946]">
                      <span className="font-semibold text-[#0B1C30]">{doc.patients}</span> patients
                    </p>
                    <button className="text-xs text-[#0D9488] hover:underline font-semibold">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
