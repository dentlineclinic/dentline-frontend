"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logoutUser } from "@/services/authService";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  actionLabel?: string;
  actionHref?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  PATIENT: "Patient",
};

export default function Sidebar({
  title,
  subtitle,
  navItems,
  actionLabel,
  actionHref,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") ?? "");
    setUserEmail(localStorage.getItem("userEmail") ?? "");
    setUserRole(localStorage.getItem("userRole") ?? "");
  }, []);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      // Even if the backend call fails, clear local state and redirect
    } finally {
      // Clear all stored user data
      localStorage.clear();
      // Expire auth cookies
      document.cookie = "token=; path=/; max-age=0; samesite=strict";
      document.cookie = "role=; path=/; max-age=0; samesite=strict";
      router.push("/login");
    }
  };

  const displayName = userName || "User";
  const initials = getInitials(displayName);
  const roleLabel = ROLE_LABELS[userRole] ?? userRole;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] bg-white p-2 rounded-lg shadow-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0 z-50" : "-translate-x-full lg:translate-x-0 z-50"
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Portal title */}
          <div className="px-8 py-6 border-b border-[#E2E8F0]">
            <h1 className="text-xl font-extrabold text-[#0F172A]">{title}</h1>
            <p className="text-xs font-bold text-[#0D9488] tracking-widest uppercase mt-1">
              {subtitle}
            </p>
          </div>

          

          {/* Nav */}
          <nav className="px-4 py-4 flex flex-col gap-2 overflow-y-auto flex-1">
            {navItems.map((item) => {
              const isDashboard = item.href.split("/").length === 2;
              const isActive = isDashboard
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-[#0D9488] shadow-sm font-semibold"
                      : "text-[#64748B] hover:text-[#0B1C30] hover:bg-white/60"
                  }`}
                >
                  <span className={isActive ? "text-[#0D9488]" : "text-[#64748B]"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: optional action + logout */}
        <div className="px-4 pb-6 flex flex-col gap-2">
          
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-center gap-2 w-full bg-[#93000A] text-white font-semibold text-sm py-3 rounded-lg hover:bg-[#BA1A1A] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loggingOut ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
