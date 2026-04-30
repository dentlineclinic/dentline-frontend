import type { Metadata } from "next";
import TopBar from "@/components/layout/TopBar";

export const metadata: Metadata = { title: "Account Settings" };

export default function DoctorSettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Account Settings" subtitle="Manage your profile and preferences" userName="Dr. Julianne Case" userRole="Orthodontist" />

      <main className="flex-1 p-10">
        <div className="max-w-2xl flex flex-col gap-6">
        
          

          {/* Password */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0B1C30] mb-6">Change Password</h3>
            <form className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Current Password</label>
                <input type="password" placeholder="••••••••" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">New Password</label>
                <input type="password" placeholder="••••••••" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#3D4946]">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="bg-[#EFF4FF] border border-[#BDC9C5] rounded-lg px-4 py-3 text-sm text-[#6B7280] outline-none focus:border-[#00685C]" />
              </div>
              <button type="submit" className="bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors w-fit">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
