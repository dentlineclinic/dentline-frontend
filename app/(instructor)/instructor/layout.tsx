"use client";

import Sidebar from "@/components/layout/Sidebar";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMyPilatesInstructorProfile } from "@/hooks/usePilates";

const instructorNavItems = [
  {
    label: "Dashboard",
    href: "/instructor",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "My Classes",
    href: "/instructor/classes",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: "Attendance",
    href: "/instructor/attendance",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/instructor/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  // ── Sync instructor name + photo to localStorage for the TopBar ────────
  // Runs on every instructor page. Ensures the TopBar always shows the
  // current name and profile photo, even on a fresh device or after refresh.
  const { data: profileRes } = useMyPilatesInstructorProfile();
  const instructor = profileRes?.data;

  useEffect(() => {
    if (!instructor) return;

    let changed = false;

    if (instructor.name && instructor.name !== localStorage.getItem("userName")) {
      localStorage.setItem("userName", instructor.name);
      changed = true;
    }

    if (
      instructor.profilePhotoUrl &&
      instructor.profilePhotoUrl !== localStorage.getItem("profilePhotoUrl")
    ) {
      localStorage.setItem("profilePhotoUrl", instructor.profilePhotoUrl);
      changed = true;
    }

    if (changed) {
      window.dispatchEvent(new Event("user-auth-updated"));
    }
  }, [instructor]);

  // ── Auth + role gate + must-change-password enforcement ────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const mustChange = localStorage.getItem("mustChangePassword") === "true";

    if (!token) {
      router.push("/login");
      setIsLoading(false);
      return;
    }

    if (role !== "PILATES_INSTRUCTOR") {
      const roleRoutes: Record<string, string> = {
        ADMIN: "/admin",
        DOCTOR: "/doctor",
        DERMATOLOGIST: "/dermatologist",
        PILATES_INSTRUCTOR: "/instructor",
        PATIENT: "/patient",
      };
      router.push(roleRoutes[role ?? ""] ?? "/login");
      return;
    }

    if (mustChange && pathname !== "/instructor/profile") {
      router.push("/instructor/profile?reason=must_change_password");
      return;
    }

    setIsLoading(false);
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#00685C] border-t-transparent"></div>
          <p className="mt-2 text-sm text-[#485F83]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <Sidebar
        title="Pilates Studio"
        subtitle="Dentline Clinic"
        navItems={instructorNavItems}
      />
      <div className="min-h-screen lg:pl-64">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}