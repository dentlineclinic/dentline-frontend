"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useMyInstructorClasses } from "@/hooks/usePilates";
import type { PilatesClass } from "@/services/pilatesService";
import { STORAGE_KEYS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

const formatTime = (time: string) => time?.slice(0, 5) ?? "—";

export default function InstructorDashboardPage() {
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    setDisplayName(localStorage.getItem(STORAGE_KEYS.USER_NAME) ?? "");
  }, []);

  const {
    data: classesData,
    isLoading: loadingClasses,
    error: classesError,
  } = useMyInstructorClasses();

  const classes: PilatesClass[] = classesData?.data ?? [];

  const activeClasses = useMemo(
    () => classes.filter((c) => c.isActive),
    [classes]
  );

  const uniquePrograms = useMemo(
    () => new Set(classes.map((c) => c.programId)).size,
    [classes]
  );

  const error = classesError
    ? typeof classesError === "string"
      ? classesError
      : (classesError as Error).message || "Failed to load your classes."
    : null;

  const stats = [
    {
      label: "My Classes",
      value: loadingClasses ? "—" : classes.length.toString(),
      color: "text-[#0B1C30]",
      icon: "📚",
    },
    {
      label: "Active Classes",
      value: loadingClasses ? "—" : activeClasses.length.toString(),
      color: "text-[#0F766E]",
      icon: "✅",
    },
    {
      label: "Programs Covered",
      value: loadingClasses ? "—" : uniquePrograms.toString(),
      color: "text-[#0D9488]",
      icon: "📋",
    },
    {
      label: "Class Hours",
      value: loadingClasses
        ? "—"
        : (activeClasses.reduce((sum, c) => sum + c.durationMinutes, 0) / 60).toFixed(1),
      color: "text-[#435B7E]",
      icon: "⏱️",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Pilates Instructor"
        subtitle={displayName ? `Welcome, ${displayName.split(" ")[0]}` : "Overview"}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6 lg:gap-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#00685C] to-[#008375] rounded-xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            Hello{displayName ? `, ${displayName.split(" ")[0]}` : ""} 🧘
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            {loadingClasses
              ? "Loading your classes…"
              : classes.length === 0
                ? "You have no classes assigned yet."
                : `You currently teach ${activeClasses.length} active class${
                    activeClasses.length === 1 ? "" : "es"
                  }.`}
          </p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <Link
              href="/instructor/classes"
              className="inline-block bg-white text-[#00685C] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View My Classes
            </Link>
            <Link
              href="/instructor/attendance"
              className="inline-block bg-white/20 text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-white/30 transition-colors border border-white/30"
            >
              Mark Attendance
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">{stat.icon}</div>
              </div>
              {loadingClasses ? (
                <div className="h-8 bg-[#F1F5F9] rounded animate-pulse mb-2" />
              ) : (
                <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              )}
              <p className="text-xs sm:text-sm text-[#3D4946] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* My Classes Table */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold text-[#0B1C30]">
              My Classes
            </h3>
            <Link
              href="/instructor/classes"
              className="text-xs sm:text-sm text-[#0D9488] hover:underline"
            >
              View Full List →
            </Link>
          </div>

          <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                  <tr>
                    {["CLASS", "PROGRAM", "SCHEDULE", "CAPACITY", "STATUS"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingClasses ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-t border-[#F8FAFC]">
                        {[...Array(5)].map((__, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : activeClasses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-sm text-[#94A3B8]"
                      >
                        No active classes assigned to you yet.
                      </td>
                    </tr>
                  ) : (
                    activeClasses.slice(0, 5).map((cls, i) => (
                      <tr
                        key={cls.id}
                        className={`${
                          i > 0 ? "border-t border-[#F8FAFC]" : ""
                        } hover:bg-[#F8FAFC] transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-[#0B1C30]">
                            {cls.name}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3D4946]">
                          {cls.programName || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#3D4946]">
                            {DAY_LABELS[cls.dayOfWeek] ?? `Day ${cls.dayOfWeek}`}
                          </p>
                          <p className="text-xs text-[#94A3B8]">
                            {formatTime(cls.startTime)} · {cls.durationMinutes}min
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3D4946]">
                          {cls.defaultCapacity}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534]">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <QuickLink
            href="/instructor/classes"
            title="My Classes"
            description="View all classes you teach"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            }
          />
          <QuickLink
            href="/instructor/attendance"
            title="Attendance"
            description="Mark who attended your sessions"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            }
          />
        </div>
      </main>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-10 h-10 bg-[#F0FDFA] rounded-lg flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <h4 className="text-base font-semibold text-[#0B1C30]">{title}</h4>
      <p className="text-sm text-[#3D4946] mt-1">{description}</p>
    </Link>
  );
}