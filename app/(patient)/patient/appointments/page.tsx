"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";

type PatientHistory = {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  appointmentDate: string;
  status: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  BOOKED: "bg-[#E5EEFF] text-[#435B7E]",
  COMPLETE: "bg-[#F0FDFA] text-[#0F766E]",
};

// Demo data for testing
const DEMO_HISTORIES: PatientHistory[] = [
  {
    id: "1",
    patientId: "PAT001",
    patientName: "John Smith",
    appointmentId: "APT2024001",
    appointmentDate: "2024-03-15",
    status: "COMPLETE",
    createdAt: "2024-03-15T10:30:00Z"
  },
  {
    id: "2",
    patientId: "PAT001",
    patientName: "John Smith",
    appointmentId: "APT2024012",
    appointmentDate: "2024-02-10",
    status: "COMPLETE",
    createdAt: "2024-02-10T14:15:00Z"
  },
  {
    id: "3",
    patientId: "PAT001",
    patientName: "John Smith",
    appointmentId: "APT2024025",
    appointmentDate: "2024-03-20",
    status: "BOOKED",
    createdAt: "2024-03-20T09:00:00Z"
  },
  {
    id: "4",
    patientId: "PAT001",
    patientName: "John Smith",
    appointmentId: "APT2024038",
    appointmentDate: "2024-04-05",
    status: "BOOKED",
    createdAt: "2024-03-25T11:45:00Z"
  },
  {
    id: "5",
    patientId: "PAT001",
    patientName: "John Smith",
    appointmentId: "APT2024041",
    appointmentDate: "2024-04-12",
    status: "COMPLETE",
    createdAt: "2024-04-12T13:30:00Z"
  },
  {
    id: "6",
    patientId: "PAT001",
    patientName: "John Smith",
    appointmentId: "APT2024055",
    appointmentDate: "2024-04-18",
    status: "BOOKED",
    createdAt: "2024-04-18T15:20:00Z"
  },
  {
    id: "7",
    patientId: "PAT001",
    patientName: "John Smith",
    appointmentId: "APT2024062",
    appointmentDate: "2024-05-01",
    status: "BOOKED",
    createdAt: "2024-05-01T10:00:00Z"
  },
  {
    id: "8",
    patientId: "PAT001",
    patientName: "John Smith",
    appointmentId: "APT2024078",
    appointmentDate: "2024-05-15",
    status: "BOOKED",
    createdAt: "2024-05-10T08:45:00Z"
  }
];

export default function AppointmentHistoryPage() {
  const [histories, setHistories] = useState<PatientHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [userName, setUserName] = useState("Patient");
  const [useDemoData, setUseDemoData] = useState(true);

  useEffect(() => {
    const loadHistories = async () => {
      setLoading(true);
      
      if (useDemoData) {
        setTimeout(() => {
          setHistories(DEMO_HISTORIES);
          setUserName("John Smith");
          setLoading(false);
          setError(null);
        }, 800);
        return;
      }

      try {
        const userId = localStorage.getItem("userId");
        const name = localStorage.getItem("userName") || "Patient";
        setUserName(name);

        if (!userId) {
          setError("Please log in to view your history");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const res = await fetch(`/api/patient-history/patient/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        
        if (result.success) {
          setHistories(result.data.content || []);
        } else {
          setError(result.message || "Failed to load appointment history");
        }
      } catch (err) {
        setError("Failed to load appointment history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHistories();
  }, [useDemoData]);

  const filteredHistories = histories.filter((h) => {
    if (statusFilter === "All") return true;
    return h.status === statusFilter;
  });

  const completedCount = histories.filter(h => h.status === "COMPLETE").length;
  const bookedCount = histories.filter(h => h.status === "BOOKED").length;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar 
        title="My Appointments" 
        subtitle="View all your scheduled and past appointments" 
        userName={userName} 
        userRole="Patient" 
      />

      <main className="flex-1 p-10 flex flex-col gap-6">
        {/* Demo Data Toggle Button */}
        {!loading && (
          <div className="flex justify-end">
            <button
              onClick={() => setUseDemoData(!useDemoData)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                useDemoData
                  ? "bg-[#00685C] text-white"
                  : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
              }`}
            >
              {useDemoData ? "Using Demo Data ✓" : "Switch to Demo Data"}
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        {!loading && histories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#3D4946]">Total Appointments</p>
                  <p className="text-2xl font-bold text-[#0B1C30] mt-1">
                    {histories.length}
                  </p>
                  <p className="text-xs text-[#0D9488] mt-1">
                    {completedCount} completed
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#3D4946]">Appointment Status</p>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
                      <span className="text-xs text-[#3D4946]">Complete: {completedCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#435B7E]"></span>
                      <span className="text-xs text-[#3D4946]">Booked: {bookedCount}</span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-3 flex-wrap">
          {["All", "BOOKED", "COMPLETE"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                f === statusFilter
                  ? "bg-[#00685C] text-white"
                  : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
              }`}
            >
              {f === "All" ? "All Appointments" : f}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-4 bg-[#F1F5F9] rounded w-40" />
                      <div className="h-3 bg-[#F1F5F9] rounded w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-[#F1F5F9] rounded w-24" />
                      <div className="h-3 bg-[#F1F5F9] rounded w-16" />
                    </div>
                    <div className="h-6 bg-[#F1F5F9] rounded-full w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredHistories.length === 0 ? (
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 shadow-sm text-center">
            <svg
              className="w-16 h-16 mx-auto text-[#94A3B8] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm text-[#94A3B8] mb-2">No appointments found</p>
            <p className="text-xs text-[#94A3B8]">Try changing the filter or check back later</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredHistories.map((history) => (
              <div
                key={history.id}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-[#00685C]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#0B1C30]">
                        Appointment #{history.appointmentId.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-[#00685C] font-medium mt-1">
                        {new Date(history.appointmentDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-[#3D4946] mt-1">
                        Booked on: {new Date(history.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-left md:text-right">
                      <p className="text-sm font-semibold text-[#0B1C30]">Status</p>
                      <span
                        className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-1 ${
                          statusColors[history.status] || "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {history.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && histories.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#3D4946]">
              Showing {filteredHistories.length} of {histories.length} appointments
            </p>
            {statusFilter !== "All" && filteredHistories.length > 0 && (
              <button
                onClick={() => setStatusFilter("All")}
                className="text-xs text-[#0D9488] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}