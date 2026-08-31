"use client";

import { useState, useEffect } from "react";
import { getConsentSettings, acceptAllConsent, declineNonFunctionalConsent } from "@/lib/analytics/consent";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const settings = getConsentSettings();
    if (!settings) {
      // Show banner if no consent settings exist
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAllConsent();
    setShowBanner(false);
  };

  const handleDecline = () => {
    declineNonFunctionalConsent();
    setShowBanner(false);
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
              <h3 className="text-base font-bold text-[#0B1C30]">🍪 We Value Your Privacy</h3>
              <p className="text-sm text-[#485F83] mt-1">
                We use cookies to enhance your experience, analyze site traffic, and serve personalized content.
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-[#94A3B8] hover:text-[#0B1C30] transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Details */}
          {showDetails && (
            <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#0B1C30] font-semibold">Essential (Functional)</span>
                <span className="text-[#0D9488] text-xs font-semibold">Always On</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#0B1C30] font-semibold">Analytics</span>
                <button
                  onClick={() => {
                    const settings = getConsentSettings();
                    const current = settings?.analytics || false;
                    setConsent({ analytics: !current });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    getConsentSettings()?.analytics ? "bg-[#0D9488]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      getConsentSettings()?.analytics ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#0B1C30] font-semibold">Advertising</span>
                <button
                  onClick={() => {
                    const settings = getConsentSettings();
                    const current = settings?.advertising || false;
                    setConsent({ advertising: !current });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    getConsentSettings()?.advertising ? "bg-[#0D9488]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      getConsentSettings()?.advertising ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
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

// Import for the toggle
import { setConsent } from "@/lib/analytics/consent";