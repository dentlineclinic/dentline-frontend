"use client";

import { Suspense } from "react";
import AppointmentCalendar from "@/components/appointments/AppointmentCalendar";

export const dynamic = "force-dynamic";

export default function AppointmentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <Suspense fallback={<div className="p-8 text-center">Loading calendar...</div>}>
          <AppointmentCalendar />
        </Suspense>
      </main>
    </div>
  );
}