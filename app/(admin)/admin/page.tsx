"use client";

import { useEffect, useState } from "react";

type Stat = {
  label: string;
  value: string;
  badge: string;
};

type Appointment = {
  patient: string;
  id: string;
  initials: string;
  doctor: string;
  note: string;
  date: string;
  time: string;
  status: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const result = await res.json();

        if (result.success) {
          setStats(result.data.stats);
          setAppointments(result.data.appointments);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Status styling
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "book":
        return { label: "BOOK", color: "bg-[#E5EEFF] text-[#1E40AF]" };
      case "arrive":
        return { label: "ARRIVE", color: "bg-[#F0FDFA] text-[#0F766E]" };
      case "assign":
        return { label: "ASSIGN", color: "bg-[#FEF3C7] text-[#92400E]" };
      case "complete":
        return { label: "COMPLETE", color: "bg-[#DCFCE7] text-[#166534]" };
      case "missed":
        return { label: "MISSED", color: "bg-[#FFDAD6] text-[#93000A]" };
      case "cancel":
        return { label: "CANCEL", color: "bg-[#F1F5F9] text-[#475569]" };
      default:
        return { label: status.toUpperCase(), color: "bg-gray-100 text-gray-600" };
    }
  };

  // Get icon based on stat label
  const getStatIcon = (label: string) => {
    switch (label) {
      case "Total Patients":
        return (
          <svg className="w-5 h-5 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case "Daily Appointments":
        return (
          <svg className="w-5 h-5 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "Monthly Revenue":
        return (
          <svg className="w-5 h-5 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "Patient Satisfaction":
        return (
          <svg className="w-5 h-5 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  if (loading) {
    return <div className="p-10">Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6 lg:gap-10">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-[#F0FDFA] rounded-lg flex items-center justify-center">
                  {getStatIcon(stat.label)}
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-[#F0FDFA] text-[#0D9488]">
                  {stat.badge}
                </span>
              </div>
              <p className="text-sm sm:text-base text-[#3D4946]">{stat.label}</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B1C30]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Appointments Table */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#0B1C30]">
              Recent Appointments
            </h3>
          </div>

          <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] lg:min-w-[800px]">
                <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                  <tr>
                    {["PATIENT", "DOCTOR", "NOTE", "DATE", "STATUS", ""].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-sm font-bold text-[#3D4946]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => {
                    const statusConfig = getStatusConfig(appt.status);
                    return (
                      <tr key={appt.id} className="border-t">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E]">
                              {appt.initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{appt.patient}</p>
                              <p className="text-xs text-[#3D4946]">{appt.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{appt.doctor}</td>
                        <td className="px-6 py-4 text-sm truncate max-w-[200px]">
                          {appt.note}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{appt.date}</div>
                          <div className="text-xs text-[#3D4946]">{appt.time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-3 py-1 rounded-full ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">...</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}