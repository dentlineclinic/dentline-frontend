"use client";

import { useState } from "react";
import axios from "axios";
import TopBar from "@/components/layout/TopBar";
import { bookAppointment } from "@/services/patientService";
import { useAnalytics } from "@/hooks/useAnalytics";
import { trackAppointmentBooked } from "@/lib/analytics/events";

export const dynamic = "force-dynamic";

export default function BookAppointmentPage() {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { trackAdConversion } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!date) {
      setMessage({ type: "error", text: "Please select a date" });
      return;
    }

    setLoading(true);

    try {
      const res = await bookAppointment({ appointmentDate: date });

      if (res.success) {
        setMessage({ type: "success", text: "Appointment booked successfully!" });
        
        // 🎯 TRACK CONVERSION - Appointment Booked!
        // 1. Track as an event
        trackAppointmentBooked(
          "Patient", // You can get this from user context
          date,
          false,
          1
        );

        // 2. Track as a Google Ads conversion
        const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || "";
        const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || "";
        
        if (conversionId && conversionLabel) {
          trackAdConversion(conversionId, conversionLabel, 12000); // ₦12,000 appointment value
        }

        setDate("");
      } else {
        setMessage({ type: "error", text: res.message || "Booking failed" });
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        
        if (responseData) {
          if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData.detail) {
            errorMessage = responseData.detail;
          } else if (responseData.errors) {
            const firstError = Object.values(responseData.errors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0];
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            }
          } else {
            errorMessage = JSON.stringify(responseData);
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setMessage({
        type: "error",
        text: errorMessage
      });
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
            
            <div className="mb-6 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-4">
              <h4 className="text-sm font-bold text-[#00685C] mb-2">
                Important Information
              </h4>
              <p className="text-sm text-[#3D4946] leading-6">
                <span className="font-semibold">Note:</span> Each appointment costs{" "}
                <span className="font-semibold text-[#00685C]">₦12,000</span>. Payment
                will be made after the patient arrives at the clinic.
              </p>
              <p className="text-sm text-[#3D4946] leading-6 mt-3">
                Patients may also receive discounts or rewards through referral points
                for being loyal and wonderful patients.
              </p>
            </div>

            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message.type === "error" && (
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{message.text}</span>
                  </div>
                )}
                {message.type === "success" && (
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{message.text}</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00685C] text-white font-semibold text-base py-4 rounded-lg shadow-sm hover:bg-[#008375] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Booking...
                  </span>
                ) : (
                  "Confirm Appointment"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}