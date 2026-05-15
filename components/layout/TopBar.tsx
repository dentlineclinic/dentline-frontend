"use client";

import { useEffect, useState } from "react";
import { avatarSmall } from "@/lib/cloudinary";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  PATIENT: "Patient",
};

export default function TopBar({ title, subtitle }: TopBarProps) {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    const loadUser = () => {
      setUserName(localStorage.getItem("userName") ?? "");
      setUserRole(localStorage.getItem("userRole") ?? "");
      setPhotoUrl(localStorage.getItem("profilePhotoUrl") ?? "");
    };

    loadUser();
    window.addEventListener("user-auth-updated", loadUser);
    return () => window.removeEventListener("user-auth-updated", loadUser);
  }, []);

  const displayName = userName || "User";
  const roleLabel = ROLE_LABELS[userRole] ?? userRole;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-30 bg-white/80 border-b border-[#F1F5F9] px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex items-center justify-between"
      style={{ backdropFilter: "blur(12px)" }}
    >
      {/* Left: page title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#0B1C30] truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm font-semibold text-[#0D9488] tracking-wide mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 ml-4">
        {/* Notifications bell */}
        <button
          className="relative p-2 text-[#3D4946] hover:text-[#0D9488] transition-colors"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0D9488] rounded-full" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 lg:pl-6 border-l border-[#E2E8F0]">
          {/* Name + role — hidden on very small screens */}
          <div className="text-right hidden sm:block">
            <p className="text-sm lg:text-base font-semibold text-[#0B1C30] truncate max-w-[140px] lg:max-w-[200px] leading-tight">
              {displayName}
            </p>
            {roleLabel && (
              <p className="text-xs font-bold text-[#0D9488] tracking-widest uppercase leading-tight mt-0.5">
                {roleLabel}
              </p>
            )}
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#00685C] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSmall(photoUrl)}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={() => setPhotoUrl("")}
              />
            ) : (
              <span className="text-xs sm:text-sm font-bold text-white">{initials}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
