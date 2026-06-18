"use client";

import AppointmentCalendar from "@/components/appointments/AppointmentCalendar";

export const dynamic = "force-dynamic";

export default function AppointmentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <AppointmentCalendar />
      </main>
    </div>
  );
}
