"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminDashboard, type AdminDashboardAppointment } from "@/services/adminService";
import { STATUS_COLORS } from "@/lib/constants";
import { formatDateSplit, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

type DashboardAppointment = {
  id: string;
  shortId: string;
  patientName: string;
  initials: string;
  doctorName: string;
  note: string;
  date: string;
  time: string;
  status: string;
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

export default function AdminDashboard() {
  const [totalPatients, setTotalPatients]           = useState<number | null>(null);
  const [dailyAppointments, setDailyAppointments]   = useState<number | null>(null);
  const [monthlyRevenue, setMonthlyRevenue]         = useState<number | null>(null);
  const [satisfaction, setSatisfaction]             = useState<number | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<DashboardAppointment[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState<string | null>(null);

  useEffect(() => {
    fetchAdminDashboard()
      .then((res) => {
        if (!res.success) {
          setError(res.message || "Failed to load dashboard data.");
          return;
        }

        const d = res.data;
        setTotalPatients(d.totalPatients);
        setDailyAppointments(d.todayAppointments);
        setMonthlyRevenue(d.monthlyRevenue);
        setSatisfaction(d.satisfactionRatePercent);

        setRecentAppointments(
          (d.latestAppointments ?? []).map((a: AdminDashboardAppointment) => {
            const { date, time } = formatDateSplit(a.appointmentDate);
            return {
              id: a.id,
              shortId: `APT-${a.id.slice(0, 6).toUpperCase()}`,
              patientName: a.patientName || "Unknown",
              initials: getInitials(a.patientName || ""),
              doctorName: a.doctorName || "Unassigned",
              note: a.reason || a.observation || "—",
              date,
              time,
              status: a.status || "BOOKED",
            };
          })
        );
      })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Total Patients",
      value: totalPatients === null ? "—" : totalPatients.toLocaleString(),
      badge: "All time",
      icon: (
        <svg className="w-5 h-5 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: "Daily Appointments",
      value: dailyAppointments === null ? "—" : dailyAppointments.toLocaleString(),
      badge: "Today",
      icon: (
        <svg className="w-5 h-5 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Monthly Revenue",
      value: monthlyRevenue === null ? "—" : fmtCurrency(monthlyRevenue),
      badge: new Date().toLocaleString("default", { month: "short" }),
      icon: (
        <svg className="w-5 h-5 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Patient Satisfaction",
      value: satisfaction === null ? "—" : `${satisfaction}%`,
      badge: "Reviews",
      icon: (
        <svg className="w-5 h-5 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6 lg:gap-10">

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-[#F0FDFA] rounded-lg flex items-center justify-center">
                  {stat.icon}
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-[#F0FDFA] text-[#0D9488]">
                  {stat.badge}
                </span>
              </div>
              <p className="text-sm sm:text-base text-[#3D4946]">{stat.label}</p>
              {loading ? (
                <div className="h-9 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
              ) : (
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B1C30]">
                  {stat.value}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Latest Appointments */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#0B1C30]">
              Latest Appointments
            </h3>
            <Link
              href="/admin/appointments"
              className="text-sm font-semibold text-[#0D9488] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] lg:min-w-[800px]">
                <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                  <tr>
                    {["PATIENT", "DOCTOR", "NOTE", "DATE", "STATUS"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-t border-[#F8FAFC]">
                        {[...Array(5)].map((__, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : recentAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
                        No appointments found.
                      </td>
                    </tr>
                  ) : (
                    recentAppointments.map((appt, i) => (
                      <tr
                        key={appt.id}
                        className={`${i > 0 ? "border-t border-[#F8FAFC]" : ""} hover:bg-[#F8FAFC] transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
                              {appt.initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#0B1C30]">{appt.patientName}</p>
                              <p className="text-xs text-[#94A3B8]">{appt.shortId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3D4946]">{appt.doctorName}</td>
                        <td className="px-6 py-4 text-sm text-[#3D4946] max-w-[180px] truncate">
                          {appt.note}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#0B1C30]">{appt.date}</p>
                          <p className="text-xs text-[#94A3B8]">{appt.time}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              STATUS_COLORS[appt.status] ?? "bg-[#F1F5F9] text-[#64748B]"
                            }`}
                          >
                            {appt.status.replace("_", " ")}
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
      </main>
    </div>
  );
}
