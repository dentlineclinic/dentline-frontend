import type { Metadata } from "next";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";

export const metadata: Metadata = { title: "Patient Dashboard" };

const upcomingAppointments = [
  { id: "#4423", procedure: "Invisalign Checkup", doctor: "Dr. Julianne Case", date: "Apr 23, 2026", time: "01:30 PM", status: "CONFIRMED" },
  { id: "#4430", procedure: "Routine Cleaning", doctor: "Dr. Marcus Reid", date: "May 5, 2026", time: "10:00 AM", status: "CONFIRMED" },
];

export default function PatientDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="My Dashboard"
        subtitle="Welcome back, Sarah"
        userName="Sarah Mitchell"
        userRole="Patient"
      />

      <main className="flex-1 p-10 flex flex-col gap-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#00685C] to-[#008375] rounded-xl p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-2xl font-bold mb-1">Good morning, Sarah! 👋</h2>
          <p className="text-white/80">You have 2 upcoming appointments this month.</p>
          <Link
            href="/patient/book"
            className="inline-block mt-4 bg-white text-[#00685C] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Book New Appointment
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Total Visits", value: "12", icon: "🦷" },
            { label: "Upcoming", value: "2", icon: "📅" },
            { label: "Next Visit", value: "Apr 23", icon: "⏰" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex items-center gap-4">
              <div className="text-3xl">{stat.icon}</div>
              <div>
                <p className="text-3xl font-bold text-[#0B1C30]">{stat.value}</p>
                <p className="text-sm text-[#3D4946]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Appointments */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#0B1C30]">Upcoming Appointments</h3>
            <Link href="/patient/history" className="text-sm text-[#0D9488] hover:underline">
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {upcomingAppointments.map((appt) => (
              <div key={appt.id} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[#0B1C30]">{appt.procedure}</p>
                    <p className="text-sm text-[#3D4946]">{appt.doctor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#0B1C30]">{appt.date}</p>
                  <p className="text-xs text-[#3D4946]">{appt.time}</p>
                </div>
                <span className="bg-[#F0FDFA] text-[#0F766E] text-xs font-bold px-3 py-1 rounded-full">
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold text-[#0B1C30]">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Book Appointment", href: "/patient/book", icon: "📅" },
              { label: "View History", href: "/patient/history", icon: "📋" },
              { label: "My Profile", href: "/patient/profile", icon: "👤" },
              { label: "Contact Clinic", href: "/contact", icon: "📞" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 text-center shadow-sm hover:shadow-md hover:border-[#00685C]/20 transition-all"
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <p className="text-sm font-semibold text-[#0B1C30]">{action.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
