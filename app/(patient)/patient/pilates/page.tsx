"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import {
  useActiveClassesPublic,
  useUpcomingSessionsForClass,
  useMyActiveSubscriptions,
  useBookSession,
} from "@/hooks/usePilates";
import type {
  PilatesClass,
  PilatesSession,
  Subscription,
} from "@/services/pilatesService";
import { avatarSmall } from "@/lib/cloudinary";

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

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const getInitials = (name?: string | null) => {
  if (!name) return "PI";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function PatientPilatesPage() {
  const [patientId, setPatientId] = useState<string>("");
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  // Booking modal state
  const [bookingSession, setBookingSession] = useState<PilatesSession | null>(null);
  const [bookingClassName, setBookingClassName] = useState<string>("");
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>("");
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    setPatientId(localStorage.getItem("userId") ?? "");
  }, []);

  // Load active classes
  const {
    data: classesData,
    isLoading: loadingClasses,
    error: classesError,
  } = useActiveClassesPublic();

  const classes: PilatesClass[] = classesData?.data ?? [];

  // Load patient's active subscriptions (for the summary + booking dropdown)
  const { data: subsData } = useMyActiveSubscriptions();
  const activeSubscriptions: Subscription[] = subsData?.data ?? [];

  // Load upcoming sessions for the expanded class
  const {
    data: sessionsData,
    isLoading: loadingSessions,
  } = useUpcomingSessionsForClass(expandedClassId);

  const sessions: PilatesSession[] = sessionsData?.data ?? [];

  // Booking mutation
  const bookSession = useBookSession();

  const error = classesError
    ? typeof classesError === "string"
      ? classesError
      : (classesError as Error).message || "Failed to load classes."
    : null;

  const totalCredits = activeSubscriptions.reduce(
    (sum, s) => sum + s.creditsRemaining,
    0
  );

  const openBookingModal = (session: PilatesSession, className: string) => {
    setBookingSession(session);
    setBookingClassName(className);
    setSelectedSubscriptionId(activeSubscriptions[0]?.id ?? "");
    setShowBookingModal(true);
  };

  const handleBook = async () => {
    if (!bookingSession) return;
    if (!patientId) {
      toast.error("Please log in again");
      return;
    }

    try {
      await bookSession.mutateAsync({
        sessionId: bookingSession.id,
        patientId,
        subscriptionId: selectedSubscriptionId || undefined,
      });
      toast.success("Session booked!");
      setShowBookingModal(false);
      setBookingSession(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to book session");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Pilates" subtitle="Browse and book classes" />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-[#00685C] to-[#008375] rounded-xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            Move, breathe, strengthen 🧘
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            Browse available Pilates classes and book a session that fits your
            schedule.
          </p>
        </div>

        {/* Subscription summary card */}
        {activeSubscriptions.length > 0 && (
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-[#00685C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">
                    Active Subscriptions
                  </p>
                  <p className="text-lg font-bold text-[#0B1C30]">
                    {totalCredits} credit{totalCredits === 1 ? "" : "s"} available
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Across {activeSubscriptions.length} package
                    {activeSubscriptions.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <Link
                href="/patient/pilates/subscriptions"
                className="text-sm font-semibold text-[#00685C] hover:underline"
              >
                View Subscriptions →
              </Link>
            </div>
          </div>
        )}

        {activeSubscriptions.length === 0 && !loadingClasses && (
          <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-xl p-5">
            <p className="text-sm text-[#92400E]">
              <strong>No active subscription.</strong> You can still book
              sessions by paying per class at the clinic.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Classes list */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-[#0B1C30]">
            Available Classes
          </h3>

          {loadingClasses ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-[#F1F5F9] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : classes.length === 0 ? (
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
                No classes available yet
              </p>
              <p className="text-xs text-[#94A3B8]">
                Check back soon — the studio is setting up its schedule.
              </p>
            </div>
          ) : (
            classes.map((cls) => {
              const isExpanded = expandedClassId === cls.id;

              return (
                <div
                  key={cls.id}
                  className="bg-white border border-[#F1F5F9] rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Class header */}
                  <button
                    onClick={() =>
                      setExpandedClassId(isExpanded ? null : cls.id)
                    }
                    className="w-full text-left p-5 hover:bg-[#F8FAFC] transition-colors flex items-center gap-4"
                  >
                    {/* Instructor avatar */}
                    {cls.instructorProfilePhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarSmall(cls.instructorProfilePhotoUrl)}
                        alt={cls.instructorName ?? "Instructor"}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-[#E2E8F0]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 border-[#E2E8F0]">
                        {getInitials(cls.instructorName)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-[#0B1C30]">
                        {cls.name}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        {cls.programName ?? "Program"} ·{" "}
                        {DAY_LABELS[cls.dayOfWeek] ?? `Day ${cls.dayOfWeek}`} at{" "}
                        {formatTime(cls.startTime)}
                      </p>
                      {cls.instructorName && (
                        <p className="text-xs text-[#0D9488] font-semibold mt-0.5">
                          with {cls.instructorName}
                        </p>
                      )}
                      {cls.description && (
                        <p className="text-xs text-[#485F83] mt-1 line-clamp-1">
                          {cls.description}
                        </p>
                      )}
                    </div>
                    <svg
                      className={`w-5 h-5 text-[#94A3B8] transition-transform flex-shrink-0 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Expanded sessions */}
                  {isExpanded && (
                    <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] p-5">
                      {loadingSessions ? (
                        <div className="flex flex-col gap-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="h-16 bg-white rounded-lg animate-pulse"
                            />
                          ))}
                        </div>
                      ) : sessions.length === 0 ? (
                        <p className="text-sm text-[#94A3B8] italic text-center py-4">
                          No upcoming sessions for this class.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {sessions.map((session) => {
                            const available = Math.max(
                              0,
                              session.capacity - session.bookedCount
                            );
                            const isFull = available === 0;

                            return (
                              <div
                                key={session.id}
                                className="bg-white border border-[#E2E8F0] rounded-lg p-4 flex items-center gap-4"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[#0B1C30]">
                                    {formatDisplayDate(session.sessionDate)}
                                  </p>
                                  <p className="text-xs text-[#94A3B8] mt-0.5">
                                    {formatTime(session.startTime)} ·{" "}
                                    {session.durationMinutes}min
                                  </p>
                                </div>

                                <div className="text-right flex-shrink-0">
                                  <p
                                    className={`text-sm font-bold ${
                                      isFull
                                        ? "text-[#93000A]"
                                        : available <= 3
                                        ? "text-[#92400E]"
                                        : "text-[#0F766E]"
                                    }`}
                                  >
                                    {available} / {session.capacity}
                                  </p>
                                  <p className="text-xs text-[#94A3B8]">
                                    {isFull
                                      ? "Full"
                                      : `${available} slot${
                                          available === 1 ? "" : "s"
                                        } left`}
                                  </p>
                                </div>

                                <button
                                  onClick={() =>
                                    openBookingModal(session, cls.name)
                                  }
                                  disabled={isFull}
                                  className="bg-[#00685C] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                >
                                  {isFull ? "Full" : "Book"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/patient/pilates/bookings"
            className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-[#F0FDFA] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-[#00685C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0B1C30]">
                My Bookings
              </p>
              <p className="text-xs text-[#94A3B8]">
                View and manage your class bookings
              </p>
            </div>
          </Link>

          <Link
            href="/patient/pilates/subscriptions"
            className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-[#F0FDFA] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-[#00685C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0B1C30]">
                My Subscriptions
              </p>
              <p className="text-xs text-[#94A3B8]">
                View your packages and credits
              </p>
            </div>
          </Link>
        </div>
      </main>

      {/* ── Booking Modal ────────────────────────────────────────────────── */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book a Session"
        subtitle={bookingClassName}
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowBookingModal(false)}
              className="text-sm font-semibold text-[#3D4946] px-4 py-2 rounded-lg hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              onClick={handleBook}
              disabled={bookSession.isPending}
              className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] disabled:opacity-50"
            >
              {bookSession.isPending ? "Booking…" : "Confirm Booking"}
            </button>
          </>
        }
      >
        {bookingSession && (
          <div className="flex flex-col gap-4">
            {/* Session details */}
            <div className="bg-[#F8FAFC] rounded-lg p-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#94A3B8]">Class</span>
                <span className="font-semibold text-[#0B1C30]">
                  {bookingClassName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#94A3B8]">Date</span>
                <span className="font-semibold text-[#0B1C30]">
                  {formatDisplayDate(bookingSession.sessionDate)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#94A3B8]">Time</span>
                <span className="font-semibold text-[#0B1C30]">
                  {formatTime(bookingSession.startTime)} ·{" "}
                  {bookingSession.durationMinutes}min
                </span>
              </div>
            </div>

            {/* Subscription choice */}
            {activeSubscriptions.length > 0 ? (
              <div>
                <label className="block text-sm font-semibold text-[#0B1C30] mb-1.5">
                  Payment Method
                </label>
                <select
                  value={selectedSubscriptionId}
                  onChange={(e) => setSelectedSubscriptionId(e.target.value)}
                  className="w-full bg-white border border-[#F1F5F9] rounded-lg px-3 py-2.5 text-sm text-[#0B1C30] outline-none focus:border-[#00685C]"
                >
                  <option value="">
                    Pay per class at the clinic
                  </option>
                  {activeSubscriptions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      Use subscription ({sub.packageName ?? "Package"}) —{" "}
                      {sub.creditsRemaining} credit
                      {sub.creditsRemaining === 1 ? "" : "s"} remaining
                    </option>
                  ))}
                </select>

                {selectedSubscriptionId ? (
                  <p className="text-xs text-[#0F766E] mt-2 flex items-start gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    1 credit will be deducted from your subscription.
                  </p>
                ) : (
                  <p className="text-xs text-[#92400E] mt-2 flex items-start gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    You'll be expected to pay at the clinic for this class.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-4">
                <p className="text-sm text-[#92400E]">
                  You have no active subscription. Please pay at the clinic for
                  this class.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}