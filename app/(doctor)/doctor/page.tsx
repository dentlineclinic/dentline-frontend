"use client";

import { useEffect } from "react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useDoctorDashboard } from "@/hooks/useDashboard";
import { STATUS_COLORS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default function DoctorDashboard() {
  const { data: response, isLoading: loading, error: queryError } = useDoctorDashboard();

  const dashboard = response?.data ?? null;
  const error = queryError ? (queryError as Error).message || "Failed to load dashboard." : null;

  // Sync name + photo to localStorage so TopBar updates
  useEffect(() => {
    if (!dashboard) return;
    if (dashboard.doctorName) localStorage.setItem("userName", dashboard.doctorName);
    if (dashboard.profilePhotoUrl) localStorage.setItem("profilePhotoUrl", dashboard.profilePhotoUrl);
    window.dispatchEvent(new Event("user-auth-updated"));
  }, [dashboard]);

  const stats = [
    {
      label: "Assigned Today",
      value: dashboard?.todayAssignedAppointments?.toString() ?? "0",
      color: "text-[#00685C]",
    },
    {
      label: "Completed",
      value: dashboard?.completedHistories?.toString() ?? "0",
      color: "text-[#0B1C30]",
    },
    {
      label: "Pending",
      value: dashboard?.pendingHistories?.toString() ?? "0",
      color: "text-[#435B7E]",
    },
    {
      label: "Rating",
      value: dashboard?.averageRating != null
        ? `${Number(dashboard.averageRating).toFixed(1)} / 5`
        : "—",
      color: "text-[#0D9488]",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Doctor Dashboard"
        subtitle={dashboard?.today
          ? new Date(dashboard.today).toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })
          : "Overview"}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6 lg:gap-8">

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm">
              {loading ? (
                <div className="h-8 sm:h-10 bg-[#F1F5F9] rounded animate-pulse mb-2" />
              ) : (
                <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              )}
              <p className="text-xs sm:text-sm text-[#3D4946] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Today's Assigned Appointments */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold text-[#0B1C30]">
              Today&apos;s Assigned Appointments
            </h3>
            <Link href="/doctor/appointments" className="text-xs sm:text-sm text-[#0D9488] hover:underline">
              View Full Schedule
            </Link>
          </div>

          <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                  <tr>
                    {["PATIENT", "DATE", "STATUS"].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-t border-[#F8FAFC]">
                        {[...Array(3)].map((__, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : !dashboard?.todayAppointments?.length ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                        No appointments assigned to you today.
                      </td>
                    </tr>
                  ) : (
                    dashboard.todayAppointments.map((appt, i) => (
                      <tr
                        key={appt.id}
                        className={`${i > 0 ? "border-t border-[#F8FAFC]" : ""} hover:bg-[#F8FAFC] transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
                              {appt.patientName
                                .split(" ")
                                .map((n: string) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#0B1C30]">{appt.patientName}</p>
                              <p className="text-xs text-[#94A3B8]">{appt.patientId.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#0B1C30]">
                            {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                              month: "short", day: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-[#94A3B8]">
                            {new Date(appt.appointmentDate).toLocaleTimeString([], {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[appt.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                            {appt.status}
                          </span>
                        </td>
                        
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <Link href="/doctor/patients" className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-[#F0FDFA] rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-[#0B1C30]">Patient Records</h4>
            <p className="text-sm text-[#3D4946] mt-1">View and update patient history</p>
          </Link>

          <Link href="/doctor/reviews" className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-[#F0FDFA] rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-[#0B1C30]">Patient Reviews</h4>
            <p className="text-sm text-[#3D4946] mt-1">Read patient feedback</p>
          </Link>

          <Link href="/doctor/settings" className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-[#F0FDFA] rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-[#0B1C30]">Account Settings</h4>
            <p className="text-sm text-[#3D4946] mt-1">Manage your profile</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
