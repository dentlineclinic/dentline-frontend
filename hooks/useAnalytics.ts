"use client";

import { useCallback } from "react";
import { trackEvent, trackConversion, trackPageView } from "@/lib/analytics/events";

interface AnalyticsEvent {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export function useAnalytics() {
  /**
   * Track a custom event
   */
  const track = useCallback((eventName: string, params?: AnalyticsEvent) => {
    trackEvent(eventName, params);
  }, []);

  /**
   * Track a Google Ads conversion
   */
  const trackAdConversion = useCallback((conversionId: string, conversionLabel: string, value?: number) => {
    trackConversion(conversionId, conversionLabel, value);
  }, []);

  /**
   * Track a page view
   */
  const trackPage = useCallback((path: string, title?: string) => {
    trackPageView(path, title);
  }, []);

  return {
    track,
    trackAdConversion,
    trackPage,
  };
}