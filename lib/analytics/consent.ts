"use client";

const CONSENT_KEY = "dentline-consent";

export type ConsentType = "analytics" | "advertising" | "functional";

export interface ConsentSettings {
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
  lastUpdated: string;
}

/**
 * Get consent settings from localStorage
 */
export const getConsentSettings = (): ConsentSettings | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Check if a specific consent type is granted
 */
export const getConsent = (type: ConsentType): boolean => {
  if (typeof window === "undefined") return false;
  
  const settings = getConsentSettings();
  if (!settings) return false;
  
  // If user hasn't set preferences, deny by default
  return settings[type] || false;
};

/**
 * Save consent settings
 */
export const setConsent = (settings: Partial<ConsentSettings>) => {
  if (typeof window === "undefined") return;
  
  const current = getConsentSettings() || {
    analytics: false,
    advertising: false,
    functional: true,
    lastUpdated: new Date().toISOString(),
  };
  
  const updated = {
    ...current,
    ...settings,
    lastUpdated: new Date().toISOString(),
  };
  
  localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
  
  // Update Google tag consent
  if (window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: updated.analytics ? "granted" : "denied",
      ad_storage: updated.advertising ? "granted" : "denied",
      ad_user_data: updated.advertising ? "granted" : "denied",
      ad_personalization: updated.advertising ? "granted" : "denied",
    });
  }
};

/**
 * Accept all consent types
 */
export const acceptAllConsent = () => {
  setConsent({
    analytics: true,
    advertising: true,
    functional: true,
  });
};

/**
 * Decline all non-functional consent types
 */
export const declineNonFunctionalConsent = () => {
  setConsent({
    analytics: false,
    advertising: false,
    functional: true,
  });
};