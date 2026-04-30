import type { Metadata } from "next";
import TopBar from "@/components/layout/TopBar";

export const metadata: Metadata = { title: "Book Appointment" };

export default function BookAppointmentPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Book Appointment" subtitle="Schedule your next visit" userName="Sarah Mitchell" userRole="Patient" />

      <main className="flex-1 p-10">
        <div className="max-w-2xl">
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0B1C30] mb-6">Appointment Details</h3>

            <form className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Service Type</label>
                <select className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]">
                  <option value="">Select a service</option>
                  <option>Routine Cleaning</option>
                  <option>Root Canal Therapy</option>
                  <option>Teeth Whitening</option>
                  <option>Invisalign Checkup</option>
                  <option>Periodontal Exam</option>
                  <option>Emergency Care</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Preferred Doctor</label>
                <select className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]">
                  <option value="">No preference</option>
                  <option>Dr. Julianne Case (Orthodontist)</option>
                  <option>Dr. Marcus Reid (Oral Surgeon)</option>
                  <option>Dr. Sarah Chen (Periodontist)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">Preferred Date</label>
                  <input
                    type="date"
                    className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">Preferred Time</label>
                  <select className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]">
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>01:00 PM</option>
                    <option>02:00 PM</option>
                    <option>03:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Notes (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Any specific concerns or information for the doctor..."
                  className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00685C] text-white font-semibold text-base py-4 rounded-lg shadow-sm hover:bg-[#008375] transition-colors"
              >
                Confirm Appointment
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
