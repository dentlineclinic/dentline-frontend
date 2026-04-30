import type { Metadata } from "next";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";

export const metadata: Metadata = { title: "Create Doctor" };

export default function CreateDoctorPage() {
  return (
    <div className="flex flex-col min-h-screen">


      <main className="flex-1 p-10">
        <div className="max-w-2xl">
          <Link href="/admin/doctors" className="text-sm text-[#0D9488] hover:underline mb-6 inline-block">
            ← Back to Doctors
          </Link>

          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0B1C30] mb-6">Doctor Information</h3>

            <form className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">First Name</label>
                  <input type="text" placeholder="John" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">Last Name</label>
                  <input type="text" placeholder="Smith" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Email Address</label>
                <input type="email" placeholder="dr.smith@dentline.com" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Specialty</label>
                <select className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]">
                  <option value="">Select specialty</option>
                  <option>Orthodontist</option>
                  <option>Oral Surgeon</option>
                  <option>Periodontist</option>
                  <option>Endodontist</option>
                  <option>Pediatric Dentist</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">License Number</label>
                <input type="text" placeholder="DDS-12345" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
              </div>

             

              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors">
                  Create Doctor
                </button>
                <Link href="/admin/doctors" className="border border-[#F1F5F9] text-[#3D4946] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
