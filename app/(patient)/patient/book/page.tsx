"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { bookAppointment } from "@/services/patientService";

export default function BookAppointmentPage() {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!date) {
      setMessage({ type: "error", text: "Please select a date" });
      return;
    }

    setLoading(true);

    try {
      // Send only the date (Format: YYYY-MM-DD)
      const appointmentDate = date;

      const res = await bookAppointment({ appointmentDate });

      if (res.success) {
        setMessage({ type: "success", text: "Appointment booked successfully!" });
        // Reset form
        setDate("");
      } else {
        setMessage({ type: "error", text: res.message || "Booking failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Book Appointment" subtitle="Schedule your next visit" />

      <main className="flex-1 p-10">
        <div className="max-w-2xl">
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0B1C30] mb-6">Appointment Details</h3>

            {/* Message Display */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Appointment Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00685C] text-white font-semibold text-base py-4 rounded-lg shadow-sm hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Booking..." : "Confirm Appointment"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}