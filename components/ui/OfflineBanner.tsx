"use client";

import { useEffect, useState } from "react";

/**
 * Shows a persistent banner when the user loses internet connection.
 * Automatically hides when connection is restored.
 * Designed for Nigerian mobile networks where connections drop frequently.
 */
export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Set initial state — navigator.onLine can be wrong on first render
    setIsOnline(navigator.onLine);

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      // Show "back online" briefly so users know their connection recovered
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Nothing to show when fully online and no recent reconnect
  if (isOnline && !showRestored) return null;

  if (!isOnline) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="fixed top-0 left-0 right-0 z-[200] bg-[#93000A] text-white px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 15.536a5 5 0 010-7.072M5.636 18.364a9 9 0 010-12.728" />
        </svg>
        No internet connection — please check your network
      </div>
    );
  }

  // Briefly show "back online" confirmation
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[200] bg-[#166534] text-white px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg"
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Back online
    </div>
  );
}
