"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";
import { fetchPatientDashboard, type PatientHistoryDto } from "@/services/patientService";

export const dynamic = "force-dynamic";

type DisplayHistory = {
  id: string;
  diagnosis: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-[#FEF3C7] text-[#92400E]",
  COMPLETED: "bg-[#DCFCE7] text-[#166534]",
  CANCELLED: "bg-[#F1F5F9] text-[#475569]",
};

function formatDate(raw: string | null | undefined) {
  if (!raw) return { date: "—", time: "—" };
  const d = new Date(raw);
  if (isNaN(d.getTime())) return { date: "—", time: "—" };
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function PatientDashboard() {
  const [userName, setUserName] = useState("");
  const [completedAppointments, setCompletedAppointments] = useState<number | null>(null);
  const [totalAppointments, setTotalAppointments] = useState<number | null>(null);
  const [lastAppointmentDate, setLastAppointmentDate] = useState<string>("—");
  const [recentHistories, setRecentHistories] = useState<DisplayHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchPatientDashboard();
        
        if (response.success && response.data) {
          const { patientName, profilePhotoUrl, completedAppointments, totalAppointments, lastAppointmentDate, recentHistories } = response.data;
          
          // Update patient name in localStorage and state
          setUserName(patientName);
          localStorage.setItem("userName", patientName);

          // Update profile photo if the backend returned one
          if (profilePhotoUrl) {
            localStorage.setItem("profilePhotoUrl", profilePhotoUrl);
          }
          
          // Dispatch event to update TopBar
          window.dispatchEvent(new Event("user-auth-updated"));
          
          // Set dashboard stats
          setCompletedAppointments(completedAppointments);
          setTotalAppointments(totalAppointments);
          
          // Format last appointment date
          if (lastAppointmentDate) {
            const { date } = formatDate(lastAppointmentDate);
            setLastAppointmentDate(date);
          }
          
          // Format recent histories
          setRecentHistories(
            recentHistories.map((h: PatientHistoryDto) => {
              const { date, time } = formatDate(h.appointmentDate);
              return {
                id: h.id,
                diagnosis: h.diagnosis || "General Checkup",
                doctorName: h.doctorName || "Unassigned",
                date,
                time,
                status: h.status || "PENDING",
              };
            })
          );
        }
      } catch (error) {
        console.error("Failed to load patient dashboard:", error);
        // Fall back to localStorage if available
        setUserName(localStorage.getItem("userName") ?? "");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const displayName = userName || "there";

  const stats = [
    { label: "Total Appointments",     value: totalAppointments === null     ? "—" : String(totalAppointments),     icon: "🦷" },
    { label: "Completed Appointments", value: completedAppointments === null ? "—" : String(completedAppointments), icon: "📅" },
    { label: "Next Visit",             value: lastAppointmentDate,                                                  icon: "⏰" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="My Dashboard" subtitle="Welcome back" />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6 lg:gap-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#00685C] to-[#008375] rounded-xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            {getGreeting()}, {displayName}! 👋
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            {totalAppointments === null
              ? "Loading your appointments…"
              : totalAppointments === 0
              ? "You have no appointments yet."
              : `You have ${totalAppointments} appointment${totalAppointments !== 1 ? "s" : ""} on record.`}
          </p>
          <Link
            href="/patient/book"
            className="inline-block mt-4 bg-white text-[#00685C] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Book New Appointment
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm flex items-center gap-4"
            >
              <div className="text-3xl">{stat.icon}</div>
              <div>
                {loading ? (
                  <div className="h-8 w-16 bg-[#F1F5F9] rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-[#0B1C30]">{stat.value}</p>
                )}
                <p className="text-sm text-[#3D4946]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Histories */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold text-[#0B1C30]">
              Recent Medical Histories
            </h3>
            <Link href="/patient/history" className="text-sm text-[#0D9488] hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
                  <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-1/2 mb-2" />
                  <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/3" />
                </div>
              ))}
            </div>
          ) : recentHistories.length === 0 ? (
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm text-center">
              <p className="text-sm text-[#94A3B8]">No medical histories found.</p>
              <Link
                href="/patient/book"
                className="inline-block mt-3 text-sm font-semibold text-[#00685C] hover:underline"
              >
                Book your first appointment →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentHistories.map((history) => (
                <div
                  key={history.id}
                  className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-[#0B1C30]">{history.diagnosis}</p>
                      <p className="text-xs sm:text-sm text-[#3D4946]">{history.doctorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#0B1C30]">{history.date}</p>
                      <p className="text-xs text-[#94A3B8]">{history.time}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[history.status] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                      {history.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-[#0B1C30]">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Book Appointment", href: "/patient/book",        icon: "📅" },
              { label: "View History",     href: "/patient/history",     icon: "📋" },
              { label: "My Profile",       href: "/patient/profile",     icon: "👤" },
              { label: "Contact Clinic",   href: "/contact",             icon: "📞" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 text-center shadow-sm hover:shadow-md hover:border-[#00685C]/20 transition-all"
              >
                <div className="text-2xl sm:text-3xl mb-2">{action.icon}</div>
                <p className="text-xs sm:text-sm font-semibold text-[#0B1C30]">{action.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
