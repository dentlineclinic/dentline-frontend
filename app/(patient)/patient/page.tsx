"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";
import { usePatientFullDashboard } from "@/hooks/useDashboard";
import type { PatientHistoryDto } from "@/services/patientService";
import { STATUS_COLORS } from "@/lib/constants";
import { formatDateSplit } from "@/lib/utils";

export const dynamic = "force-dynamic";

// ── Status colors for Pilates bookings ──────────────────────────────────────
const PILATES_STATUS_COLORS: Record<string, string> = {
  BOOKED: "bg-[#E5EEFF] text-[#1E40AF]",
  ATTENDED: "bg-[#DCFCE7] text-[#166534]",
  CANCELLED: "bg-[#F1F5F9] text-[#64748B]",
  NO_SHOW: "bg-[#FFDAD6] text-[#93000A]",
};

// ── Status colors for dermatology records ───────────────────────────────────
const DERM_STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  IN_PROGRESS: "bg-[#FEF3C7] text-[#92400E]",
};

const DERM_PAYMENT_COLORS: Record<string, string> = {
  PAID: "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  UNPAID: "bg-[#FFDAD6] text-[#93000A]",
};

export default function PatientDashboard() {
  const { data: response, isLoading: loading, isError } = usePatientFullDashboard();
  const [copied, setCopied] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [localName, setLocalName] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // Check if user must change password
  useEffect(() => {
    const mustChange = localStorage.getItem("mustChangePassword") === "true";
    setMustChangePassword(mustChange);

    if (mustChange) {
      toast.warning(
        "🔒 Please change your temporary password before accessing the dashboard",
        {
          position: "top-center",
          autoClose: false,
          toastId: "must-change-password-dashboard",
        }
      );
    }
  }, []);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    setLocalName(localStorage.getItem("userName") ?? "");
  }, []);

  useEffect(() => {
    if (!response?.success || !response.data) return;
    const { patientName, profilePhotoUrl } = response.data;
    if (patientName) localStorage.setItem("userName", patientName);
    if (profilePhotoUrl) localStorage.setItem("profilePhotoUrl", profilePhotoUrl);
    window.dispatchEvent(new Event("user-auth-updated"));
  }, [response]);

  const copyReferenceCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const data = response?.data;
  const displayName = data?.patientName || localName || "there";

  const recentHistories = (data?.recentHistories ?? []).map((h: PatientHistoryDto) => {
    const { date, time } = formatDateSplit(h.appointmentDate);
    return {
      id: h.id,
      diagnosis: h.diagnosis || "General Checkup",
      doctorName: h.doctorName || "Unassigned",
      date,
      time,
      status: h.status || "PENDING",
    };
  });

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="My Dashboard" subtitle="Welcome back" />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6 lg:gap-8">
        {/* MUST CHANGE PASSWORD OVERLAY */}
        {mustChangePassword ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center border-2 border-[#FFEAA7]">
            <div className="w-24 h-24 bg-[#FFF3CD] rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-[#856404]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1C30] mb-3">
              Password Change Required
            </h2>
            <p className="text-[#485F83] max-w-md mb-6">
              You are using a temporary password provided by the clinic. For security reasons,
              you must change it before you can access the dashboard.
            </p>
            <div className="bg-[#FFF3CD] border border-[#FFEAA7] rounded-lg p-4 mb-6 max-w-md text-left">
              <p className="text-sm text-[#856404]">
                <span className="font-bold">📌 Note:</span> This is a one-time requirement.
                After you change your password, you'll have full access to all features.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/patient/profile"
                className="bg-[#00685C] text-white font-semibold text-base px-8 py-3 rounded-lg hover:bg-[#008375] transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Change Password Now
              </Link>
              <button
                onClick={() => {
                  localStorage.clear();
                  document.cookie = "token=; path=/; max-age=0; samesite=strict";
                  document.cookie = "role=; path=/; max-age=0; samesite=strict";
                  window.location.href = "/login";
                }}
                className="bg-gray-200 text-[#485F83] font-semibold text-base px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors inline-flex items-center justify-center gap-2"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <>
            {isError && (
              <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
                Failed to load your dashboard. Please refresh the page.
              </div>
            )}

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#00685C] to-[#008375] rounded-xl p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h2 className="text-xl sm:text-2xl font-bold mb-1">
                {greeting}, {displayName}! 👋
              </h2>
              <p className="text-white/80 text-sm sm:text-base">
                {loading
                  ? "Loading your activity…"
                  : `You have ${data?.totalAppointments ?? 0} dental appointment${
                      (data?.totalAppointments ?? 0) === 1 ? "" : "s"
                    } and ${data?.upcomingPilatesBookings?.length ?? 0} upcoming Pilates booking${
                      (data?.upcomingPilatesBookings?.length ?? 0) === 1 ? "" : "s"
                    }.`}
              </p>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                STATS GRID — 4 cards
            ═══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                icon="🦷"
                label="Dental Appointments"
                value={loading ? null : String(data?.totalAppointments ?? 0)}
                href="/patient/book"
              />
              <StatCard
                icon="🧴"
                label="Dermatology Visits"
                value={loading ? null : String(data?.dermatologyAppointmentsTotal ?? 0)}
                href="/patient/dermatology"
              />
              <StatCard
                icon="🧘"
                label="Pilates Credits"
                value={loading ? null : String(data?.totalCreditsRemaining ?? 0)}
                href="/patient/pilates"
              />
              <StatCard
                icon="⭐"
                label="Reference Points"
                value={loading ? null : String(data?.referencePoints ?? 0)}
              />
            </div>

            {/* ═══════════════════════════════════════════════════════════
                REFERRAL CODE
            ═══════════════════════════════════════════════════════════ */}
            {(loading || data?.referenceCode) && (
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#00685C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-0.5">Your Referral Code</p>
                    {loading ? (
                      <div className="h-6 w-24 bg-[#F1F5F9] rounded animate-pulse" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-bold text-[#0B1C30] tracking-widest font-mono">
                          {data?.referenceCode ?? "—"}
                        </span>
                        {data?.referenceCode && (
                          <button
                            onClick={() => copyReferenceCode(data.referenceCode!)}
                            className="p-1.5 rounded-lg hover:bg-[#F0FDFA] transition-colors group"
                          >
                            {copied ? (
                              <svg className="w-4 h-4 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-[#94A3B8] mt-0.5">Share with friends to earn points</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-xs text-[#94A3B8] mb-0.5">Points</p>
                    {loading ? (
                      <div className="h-8 w-16 bg-[#F1F5F9] rounded animate-pulse" />
                    ) : (
                      <p className="text-2xl sm:text-3xl font-bold text-[#00685C]">
                        {data?.referencePoints ?? 0}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                DENTAL — Recent Histories
            ═══════════════════════════════════════════════════════════ */}
            <Section
              title="Recent Dental Histories"
              actionLabel="View All"
              actionHref="/patient/history"
              loading={loading}
              empty={recentHistories.length === 0}
              emptyText="No dental histories yet."
              emptyCtaLabel="Book your first appointment →"
              emptyCtaHref="/patient/book"
            >
              {recentHistories.map((h) => (
                <div
                  key={h.id}
                  className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🦷</span>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-[#0B1C30]">
                        {h.diagnosis}
                      </p>
                      <p className="text-xs sm:text-sm text-[#3D4946]">{h.doctorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#0B1C30]">{h.date}</p>
                      <p className="text-xs text-[#94A3B8]">{h.time}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                        STATUS_COLORS[h.status] ?? "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      {h.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </Section>

            {/* ═══════════════════════════════════════════════════════════
                DERMATOLOGY — Recent Records
            ═══════════════════════════════════════════════════════════ */}
            <Section
              title="Recent Dermatology Records"
              actionLabel="View All"
              actionHref="/patient/dermatology"
              loading={loading}
              empty={(data?.recentDermatologyRecords ?? []).length === 0}
              emptyText="No dermatology records yet."
            >
              {(data?.recentDermatologyRecords ?? []).map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FCE7F3] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🧴</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-[#0B1C30] truncate">
                        {r.observation || "Dermatology visit"}
                      </p>
                      <p className="text-xs sm:text-sm text-[#3D4946]">
                        {r.doctorName || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-[#94A3B8]">Status</p>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block mt-0.5 ${
                          DERM_STATUS_COLORS[r.status] ??
                          "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#94A3B8]">Payment</p>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block mt-0.5 ${
                          DERM_PAYMENT_COLORS[r.paymentStatus] ??
                          "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {r.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </Section>

            {/* ═══════════════════════════════════════════════════════════
                PILATES — Upcoming Bookings + Credits
            ═══════════════════════════════════════════════════════════ */}
            <Section
              title="Upcoming Pilates Classes"
              actionLabel="Browse Classes"
              actionHref="/patient/pilates"
              loading={loading}
              empty={(data?.upcomingPilatesBookings ?? []).length === 0}
              emptyText="You have no upcoming Pilates bookings."
              emptyCtaLabel="Book a class →"
              emptyCtaHref="/patient/pilates"
            >
              {/* Credits summary banner */}
              {!loading && (data?.activeSubscriptionsCount ?? 0) > 0 && (
                <div className="bg-[#F0FDFA] border border-[#D1FAE5] rounded-xl p-4 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎟️</span>
                    <div>
                      <p className="text-sm font-bold text-[#0F766E]">
                        {data?.totalCreditsRemaining ?? 0} credit
                        {(data?.totalCreditsRemaining ?? 0) === 1 ? "" : "s"} available
                      </p>
                      <p className="text-xs text-[#0F766E]">
                        Across {data?.activeSubscriptionsCount ?? 0} active package
                        {(data?.activeSubscriptionsCount ?? 0) === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/patient/pilates/subscriptions"
                    className="text-xs font-semibold text-[#0F766E] hover:underline"
                  >
                    View Subscriptions →
                  </Link>
                </div>
              )}

              {(data?.upcomingPilatesBookings ?? []).map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#CCFBF1] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🧘</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-[#0B1C30] truncate">
                        {b.sessionName || "Pilates session"}
                      </p>
                      <p className="text-xs text-[#94A3B8]">Booking ID: {b.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        PILATES_STATUS_COLORS[b.status] ??
                        "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      {b.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </Section>

            {/* ═══════════════════════════════════════════════════════════
                QUICK ACTIONS
            ═══════════════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg sm:text-xl font-semibold text-[#0B1C30]">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Book Dental", href: "/patient/book", icon: "🦷" },
                  { label: "Dermatology", href: "/patient/dermatology", icon: "🧴" },
                  { label: "Pilates Classes", href: "/patient/pilates", icon: "🧘" },
                  { label: "My Profile", href: "/patient/profile", icon: "👤" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 text-center shadow-sm hover:shadow-md hover:border-[#00685C]/20 transition-all"
                  >
                    <div className="text-2xl sm:text-3xl mb-2">{action.icon}</div>
                    <p className="text-xs sm:text-sm font-semibold text-[#0B1C30]">{action.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string | null;
  href?: string;
}) {
  const inner = (
    <div className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-5 shadow-sm flex items-center gap-3 h-full">
      <div className="text-2xl sm:text-3xl flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        {value === null ? (
          <div className="h-7 w-12 bg-[#F1F5F9] rounded animate-pulse mb-1" />
        ) : (
          <p className="text-xl sm:text-2xl font-bold text-[#0B1C30] leading-tight">
            {value}
          </p>
        )}
        <p className="text-xs text-[#3D4946] leading-tight mt-0.5">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {inner}
      </Link>
    );
  }
  return inner;
}

function Section({
  title,
  actionLabel,
  actionHref,
  loading,
  empty,
  emptyText,
  emptyCtaLabel,
  emptyCtaHref,
  children,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  loading: boolean;
  empty: boolean;
  emptyText: string;
  emptyCtaLabel?: string;
  emptyCtaHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold text-[#0B1C30]">{title}</h3>
        {actionHref && actionLabel && (
          <Link href={actionHref} className="text-sm text-[#0D9488] hover:underline">
            {actionLabel}
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
              <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-1/2 mb-2" />
              <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/3" />
            </div>
          ))}
        </div>
      ) : empty ? (
        <div className="bg-white border border-[#F1F5F9] rounded-xl p-8 shadow-sm text-center">
          <p className="text-sm text-[#94A3B8]">{emptyText}</p>
          {emptyCtaLabel && emptyCtaHref && (
            <Link
              href={emptyCtaHref}
              className="inline-block mt-3 text-sm font-semibold text-[#00685C] hover:underline"
            >
              {emptyCtaLabel}
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">{children}</div>
      )}
    </div>
  );
}