"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
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
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setUserName(localStorage.getItem("userName") ?? "");
    setUserEmail(localStorage.getItem("userEmail") ?? "");
    setUserRole(localStorage.getItem("userRole") ?? "");
  }, []);

  // Lock / unlock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const openSidebar = useCallback(() => setIsMobileMenuOpen(true), []);
  const closeSidebar = useCallback(() => setIsMobileMenuOpen(false), []);

  // Swipe-right on the page body opens the sidebar
  const swipeOpenHandlers = useSwipeable({
    onSwipedRight: openSidebar,
    delta: 40,          // minimum px to register as a swipe
    trackTouch: true,
    trackMouse: false,
    preventScrollOnSwipe: false,
  });

  // Swipe-left on the sidebar itself closes it
  const swipeCloseHandlers = useSwipeable({
    onSwipedLeft: closeSidebar,
    delta: 40,
    trackTouch: true,
    trackMouse: false,
    preventScrollOnSwipe: false,
  });

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      // Even if the backend call fails, clear local state and redirect
    } finally {
      localStorage.clear();
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
      {/*
       * ─── MOBILE-ONLY SWIPE CAPTURE ZONE ────────────────────────────────────
       * A thin invisible strip on the left edge that captures swipe-right
       * gestures and shows a subtle "›" indicator so users know it's draggable.
       * Hidden on lg+ because the desktop sidebar is always visible.
       */}
      <div
        {...swipeOpenHandlers}
        onClick={openSidebar}
        aria-label="Open navigation"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && openSidebar()}
        className={`lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-[55] flex items-center justify-center
          w-5 h-16 rounded-r-xl bg-[#00685C]/80 shadow-md cursor-pointer
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/*
       * ─── MOBILE BACKDROP ────────────────────────────────────────────────────
       * Semi-transparent overlay behind the drawer. Tap to close.
       */}
      <div
        onClick={closeSidebar}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]
          transition-opacity duration-300 ease-in-out
          ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/*
       * ─── SIDEBAR ────────────────────────────────────────────────────────────
       * Desktop: always visible (translate-x-0 via lg:translate-x-0).
       * Mobile:  slides in/out based on isMobileMenuOpen.
       */}
      <aside
        {...swipeCloseHandlers}
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[#F8FAFC] border-r border-[#E2E8F0]
          flex flex-col justify-between z-50
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        aria-label="Main navigation"
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
                  onClick={closeSidebar}
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

        {/* Bottom: logout */}
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
