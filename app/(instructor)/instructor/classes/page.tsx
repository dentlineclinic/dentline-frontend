"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useMyInstructorClasses } from "@/hooks/usePilates";
import type { PilatesClass } from "@/services/pilatesService";

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

export default function InstructorClassesPage() {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ACTIVE");

  const { data, isLoading, error: queryError } = useMyInstructorClasses();

  const classes: PilatesClass[] = data?.data ?? [];

  const filteredClasses = useMemo(() => {
    if (filter === "ALL") return classes;
    if (filter === "ACTIVE") return classes.filter((c) => c.isActive);
    return classes.filter((c) => !c.isActive);
  }, [classes, filter]);

  const activeCount = classes.filter((c) => c.isActive).length;
  const inactiveCount = classes.length - activeCount;

  const error = queryError
    ? typeof queryError === "string"
      ? queryError
      : (queryError as Error).message || "Failed to load your classes."
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="My Classes"
        subtitle={`${classes.length} class${classes.length === 1 ? "" : "es"}`}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#3D4946] uppercase tracking-widest mr-2">
            Filter:
          </span>
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              filter === "ACTIVE"
                ? "bg-[#00685C] text-white"
                : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter("INACTIVE")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              filter === "INACTIVE"
                ? "bg-[#00685C] text-white"
                : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
            }`}
          >
            Inactive ({inactiveCount})
          </button>
          <button
            onClick={() => setFilter("ALL")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              filter === "ALL"
                ? "bg-[#00685C] text-white"
                : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
            }`}
          >
            All ({classes.length})
          </button>
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Cards grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm"
              >
                <div className="h-5 bg-[#F1F5F9] rounded animate-pulse w-2/3 mb-3" />
                <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-1/2 mb-2" />
                <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-10 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto bg-[#F0FDFA] rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-[#0D9488]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#0B1C30] mb-1">
              {filter !== "ALL"
                ? `No ${filter.toLowerCase()} classes.`
                : "No classes assigned to you yet."}
            </p>
            {filter === "ALL" && (
              <p className="text-xs text-[#94A3B8]">
                Contact an admin to have classes assigned to you.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#94A3B8] mb-1">
                      {cls.programName ?? "Program"}
                    </p>
                    <p className="text-base font-bold text-[#0B1C30] truncate">
                      {cls.name}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                      cls.isActive
                        ? "bg-[#DCFCE7] text-[#166534]"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    {cls.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {cls.description && (
                  <p className="text-xs text-[#485F83] leading-relaxed line-clamp-2">
                    {cls.description}
                  </p>
                )}

                <div className="bg-[#F8FAFC] rounded-lg p-3 flex flex-col gap-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-xs">Day</span>
                    <span className="font-semibold text-[#0B1C30]">
                      {DAY_LABELS[cls.dayOfWeek] ?? `Day ${cls.dayOfWeek}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-xs">Time</span>
                    <span className="font-semibold text-[#0B1C30]">
                      {formatTime(cls.startTime)} · {cls.durationMinutes}min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-xs">Capacity</span>
                    <span className="font-semibold text-[#0B1C30]">
                      {cls.defaultCapacity} students
                    </span>
                  </div>
                </div>

                <Link
                  href="/instructor/attendance"
                  className="flex items-center justify-center gap-2 text-xs font-semibold text-[#00685C] bg-[#F0FDFA] rounded-lg py-2 hover:bg-[#D1FAE5] transition-colors"
                >
                  Mark Attendance →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}