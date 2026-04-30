import type { Metadata } from "next";
import TopBar from "@/components/layout/TopBar";

export const metadata: Metadata = { title: "Notifications" };

const notifications = [
  { title: "New Lab Results", desc: "Patient: Mike Ross - 3D Scan uploaded", time: "12 min ago", type: "info", read: false },
  { title: "Supply Restock", desc: "Dental adhesive & orthodontic wires delivered", time: "2 hours ago", type: "success", read: false },
  { title: "Critical Alert", desc: "Room 03 X-Ray machine maintenance required", time: "4 hours ago", type: "error", read: false },
  { title: "New Patient Feedback", desc: '"Excellent care and very professional staff."', time: "Yesterday", type: "info", read: true },
  { title: "Appointment Reminder", desc: "Dr. Case has 5 appointments tomorrow", time: "Yesterday", type: "info", read: true },
  { title: "Payment Received", desc: "Invoice PAY-003 partially paid by Linda Wu", time: "2 days ago", type: "success", read: true },
];

const typeColors: Record<string, string> = {
  info: "bg-[#E5EEFF] text-[#435B7E]",
  success: "bg-[#F0FDFA] text-[#0F766E]",
  error: "bg-[#FFDAD6] text-[#93000A]",
};

const typeDots: Record<string, string> = {
  info: "bg-[#435B7E]",
  success: "bg-[#0D9488]",
  error: "bg-[#BA1A1A]",
};

export default function NotificationsPage() {
  return (
    <div className="flex flex-col min-h-screen">


      <main className="flex-1 p-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {["All", "Unread", "Alerts", "Updates"].map((f) => (
              <button key={f} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${f === "All" ? "bg-[#00685C] text-white" : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"}`}>
                {f}
              </button>
            ))}
          </div>
          <button className="text-sm text-[#0D9488] hover:underline font-semibold">
            Mark all as read
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {notifications.map((notif, i) => (
            <div
              key={i}
              className={`bg-white border rounded-xl p-5 flex items-start gap-4 shadow-sm transition-colors ${notif.read ? "border-[#F1F5F9] opacity-70" : "border-[#BDC9C5]/50"}`}
            >
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? "bg-[#E2E8F0]" : typeDots[notif.type]}`} />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${notif.read ? "text-[#3D4946]" : "text-[#0B1C30]"}`}>{notif.title}</p>
                    <p className="text-sm text-[#485F83] mt-0.5">{notif.desc}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${typeColors[notif.type]}`}>
                      {notif.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-[#94A3B8]">{notif.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
