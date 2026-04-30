import type { Metadata } from "next";
import TopBar from "@/components/layout/TopBar";

export const metadata: Metadata = { title: "My Profile" };

export default function PatientProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="My Profile" subtitle="Manage your personal information" userName="Sarah Mitchell" userRole="Patient" />

      <main className="flex-1 p-10">
        <div className="max-w-2xl flex flex-col gap-6">
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0B1C30] mb-6">Personal Information</h3>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#CCFBF1] flex items-center justify-center">
                <span className="text-2xl font-bold text-[#0F766E]">SM</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#0B1C30]">Sarah Mitchell</h4>
                <p className="text-sm text-[#3D4946]">Patient ID: P-001</p>
              </div>
            </div>

            <form className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">First Name</label>
                  <input type="text" defaultValue="Sarah" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#3D4946]">Last Name</label>
                  <input type="text" defaultValue="Mitchell" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Email</label>
                <input type="email" defaultValue="sarah.mitchell@email.com" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Phone</label>
                <input type="tel" defaultValue="(555) 123-4567" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Date of Birth</label>
                <input type="date" defaultValue="1992-03-15" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
              </div>

              <button type="submit" className="bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors w-fit">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
