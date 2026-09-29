"use client";

import { toast } from "react-toastify";
import {
  usePilatesSessionsByDate,
  useCancelSession,
} from "@/hooks/usePilates";
import type { PilatesSession } from "@/services/pilatesService";
import {
  SESSION_STATUS_COLORS,
  formatDisplayDate,
  formatLongDate,
  formatTime,
} from "./types";

interface Props {
  date: string;
  onClose: () => void;
  onRefresh: () => void;
  onCancelSession: (session: PilatesSession) => void;
}

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin text-[#0D9488]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

export default function SessionDayDrawer({
  date,
  onClose,
  onRefresh,
  onCancelSession,
}: Props) {
  const { data, isLoading, isError } = usePilatesSessionsByDate(date);

  const sessions: PilatesSession[] = data?.data ?? [];

  return (
    <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
        <div>
          <h2 className="text-base font-bold text-[#0B1C30]">
            {formatLongDate(date)}
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {isLoading
              ? "Loading…"
              : `${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[#94A3B8] hover:text-[#475569]"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#F1F5F9] rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-[#F1F5F9] rounded w-1/2 mb-2" />
              <div className="h-3 bg-[#F1F5F9] rounded w-2/3" />
            </div>
          ))
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#93000A]">Failed to load sessions.</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-[#F0FDFA] rounded-full flex items-center justify-center mx-auto mb-3">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-[#94A3B8]">
              No sessions on this day.
            </p>
          </div>
        ) : (
          sessions.map((session) => {
            const isFull = session.bookedCount >= session.capacity;
            const available = Math.max(0, session.capacity - session.bookedCount);
            const isCancellable = session.status === "SCHEDULED";

            return (
              <div
                key={session.id}
                className="bg-white border border-[#F1F5F9] rounded-xl p-4 hover:border-[#00685C]/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0B1C30] truncate">
                      {session.className ?? "Session"}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {formatTime(session.startTime)} ·{" "}
                      {session.durationMinutes}min
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      SESSION_STATUS_COLORS[session.status] ??
                      "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-sm font-semibold ${
                      isFull ? "text-[#93000A]" : "text-[#0B1C30]"
                    }`}
                  >
                    {session.bookedCount} / {session.capacity}
                  </span>
                  {isFull && (
                    <span className="text-xs font-bold text-[#93000A] bg-[#FFDAD6] px-2 py-0.5 rounded">
                      Full
                    </span>
                  )}
                  {!isFull && available <= 3 && (
                    <span className="text-xs font-bold text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded">
                      {available} left
                    </span>
                  )}
                </div>

                {/* Action */}
                {isCancellable && (
                  <button
                    onClick={() => onCancelSession(session)}
                    className="text-xs font-semibold text-[#93000A] hover:underline"
                  >
                    Cancel session →
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}