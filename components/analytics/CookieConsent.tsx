"use client";

import { useState, useEffect } from "react";
import {
  getConsentSettings,
  acceptAllConsent,
  declineNonFunctionalConsent,
  setConsent,
} from "@/lib/analytics/consent";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [advertisingEnabled, setAdvertisingEnabled] = useState(false);

  useEffect(() => {
    const settings = getConsentSettings();

    if (!settings) {
      setShowBanner(true);
    } else {
      setAnalyticsEnabled(settings.analytics);
      setAdvertisingEnabled(settings.advertising);
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAllConsent();

    setAnalyticsEnabled(true);
    setAdvertisingEnabled(true);

    setShowBanner(false);
  };

  const handleDecline = () => {
    declineNonFunctionalConsent();

    setAnalyticsEnabled(false);
    setAdvertisingEnabled(false);

    setShowBanner(false);
  };

  const handleAnalyticsToggle = () => {
    const newValue = !analyticsEnabled;

    setConsent({
      analytics: newValue,
    });

    setAnalyticsEnabled(newValue);
  };

  const handleAdvertisingToggle = () => {
    const newValue = !advertisingEnabled;

    setConsent({
      advertising: newValue,
    });

    setAdvertisingEnabled(newValue);
  };

  const handleCustomize = () => {
    setShowDetails(!showDetails);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-[#E2E8F0] p-6 md:p-8">
        <div className="flex flex-col gap-4">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#0B1C30]">
                🍪 We Value Your Privacy
              </h3>

              <p className="text-sm text-[#485F83] mt-1">
                We use cookies to enhance your experience, analyze site
                traffic, and serve personalized content.
              </p>
            </div>

            <button
              onClick={() => setShowBanner(false)}
              className="text-[#94A3B8] hover:text-[#0B1C30] transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

          {/* Consent Details */}
          {showDetails && (
            <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-4 text-sm">

              {/* Functional */}
              <div className="flex items-center justify-between">
                <span className="text-[#0B1C30] font-semibold">
                  Essential (Functional)
                </span>

                <span className="text-[#0D9488] text-xs font-semibold">
                  Always On
                </span>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <span className="text-[#0B1C30] font-semibold">
                  Analytics
                </span>

                <button
                  type="button"
                  onClick={handleAnalyticsToggle}
                  aria-label="Toggle analytics consent"
                  aria-pressed={analyticsEnabled}
                  className={`relative flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    analyticsEnabled
                      ? "bg-[#0D9488]"
                      : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
                      analyticsEnabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Advertising */}
              <div className="flex items-center justify-between">
                <span className="text-[#0B1C30] font-semibold">
                  Advertising
                </span>

                <button
                  type="button"
                  onClick={handleAdvertisingToggle}
                  aria-label="Toggle advertising consent"
                  aria-pressed={advertisingEnabled}
                  className={`relative flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    advertisingEnabled
                      ? "bg-[#0D9488]"
                      : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
                      advertisingEnabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">

            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-[#00685C] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#008375] transition-colors"
            >
              Accept All
            </button>

            <button
              onClick={handleDecline}
              className="flex-1 border border-[#E2E8F0] text-[#3D4946] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#F8FAFC] transition-colors"
            >
              Decline Non-Essential
            </button>

            <button
              onClick={handleCustomize}
              className="text-[#0D9488] font-semibold text-sm px-4 py-3 rounded-lg hover:bg-[#F0FDFA] transition-colors"
            >
              {showDetails ? "Hide Details" : "Customize"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}