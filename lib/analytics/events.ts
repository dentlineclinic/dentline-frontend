"use client";

import { getConsent } from "./consent";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/* ============================================
   CONSENT CHECKS
============================================ */

/**
 * Check if analytics tracking is allowed.
 */
const isAnalyticsTrackingAllowed = (): boolean => {
  if (typeof window === "undefined") return false;
  return getConsent("analytics");
};

/**
 * Check if advertising/Google Ads tracking is allowed.
 */
const isAdvertisingTrackingAllowed = (): boolean => {
  if (typeof window === "undefined") return false;
  return getConsent("advertising");
};

/* ============================================
   GENERIC ANALYTICS EVENTS
============================================ */

/**
 * Track a custom analytics event.
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window === "undefined") return;

  // Normal analytics events require analytics consent
  if (!isAnalyticsTrackingAllowed()) return;

  if (window.gtag) {
    window.gtag("event", eventName, params);
  } else if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  }
};

/* ============================================
   GOOGLE ADS CONVERSION
============================================ */

/**
 * Track a Google Ads conversion.
 *
 * Google Ads conversions require advertising consent,
 * not analytics consent.
 */
export const trackConversion = (
  conversionId: string,
  conversionLabel: string,
  value?: number,
  currency: string = "NGN"
) => {
  if (typeof window === "undefined") return;

  // Google Ads conversions require advertising consent
  if (!isAdvertisingTrackingAllowed()) return;

  if (!conversionId || !conversionLabel) return;

  const params: Record<string, any> = {
    send_to: `${conversionId}/${conversionLabel}`,
  };

  // Only send a value if one was explicitly provided.
  // This prevents accidentally overriding the Google Ads
  // conversion's configured default value.
  if (value !== undefined) {
    params.value = value;
    params.currency = currency;
  }

  if (window.gtag) {
    window.gtag("event", "conversion", params);
  } else if (window.dataLayer) {
    window.dataLayer.push({
      event: "conversion",
      ...params,
    });
  }
};

/* ============================================
   PAGE VIEW
============================================ */

/**
 * Track a page view.
 */
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === "undefined") return;

  if (!isAnalyticsTrackingAllowed()) return;

  const tagId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;

  if (window.gtag && tagId) {
    window.gtag("config", tagId, {
      page_path: path,
      page_title: title,
      send_page_view: true,
    });
  }
};

/* ============================================
   DENTLINE SPECIFIC EVENTS
============================================ */

/**
 * Track when a patient books an appointment.
 *
 * This tracks the analytics event.
 * The Google Ads conversion can be added separately
 * once the Appointment Booking conversion is created
 * in Google Ads.
 */
export const trackAppointmentBooked = (
  patientName: string,
  appointmentDate: string,
  isFamily: boolean = false,
  memberCount: number = 1
) => {
  trackEvent("appointment_booked", {
    patient_name: patientName,
    appointment_date: appointmentDate,
    is_family: isFamily,
    member_count: memberCount,
  });
};

/**
 * Track when a patient books a family appointment.
 */
export const trackFamilyAppointmentBooked = (
  headPatientName: string,
  memberCount: number,
  appointmentDate: string
) => {
  trackEvent("family_appointment_booked", {
    head_patient: headPatientName,
    member_count: memberCount,
    appointment_date: appointmentDate,
  });
};

/**
 * Track phone call clicks.
 */
export const trackPhoneClick = (
  phoneNumber: string,
  source: string
) => {
  trackEvent("phone_click", {
    phone_number: phoneNumber,
    source: source,
  });
};

/**
 * Track WhatsApp clicks.
 */
export const trackWhatsAppClick = (
  phoneNumber: string,
  source: string
) => {
  trackEvent("whatsapp_click", {
    phone_number: phoneNumber,
    source: source,
  });
};

/**
 * Track product views.
 */
export const trackProductView = (
  productId: string,
  productName: string,
  price: number
) => {
  trackEvent("product_view", {
    product_id: productId,
    product_name: productName,
    price: price,
  });
};

/**
 * Track product added to cart.
 */
export const trackProductAddedToCart = (
  productId: string,
  productName: string,
  price: number
) => {
  trackEvent("add_to_cart", {
    product_id: productId,
    product_name: productName,
    price: price,
  });
};

/**
 * Track product purchase.
 */
export const trackProductPurchase = (
  orderId: string,
  total: number,
  items: any[]
) => {
  trackEvent("purchase", {
    order_id: orderId,
    value: total,
    currency: "NGN",
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

/**
 * Track broadcast sent.
 */
export const trackBroadcastSent = (
  recipientCount: number,
  subject: string
) => {
  trackEvent("broadcast_sent", {
    recipient_count: recipientCount,
    subject: subject,
  });
};

/* ============================================
   PATIENT REGISTRATION
============================================ */

/**
 * Track patient registration as an analytics event.
 */
export const trackPatientRegistration = (source?: string) => {
  trackEvent("patient_registered", {
    source: source || "direct",
  });
};

/**
 * Track patient sign-up as a Google Ads conversion.
 *
 * IMPORTANT:
 * This should only be called after the backend
 * confirms that registration was successful.
 */
export const trackPatientSignUp = (
  source?: string,
  value?: number
) => {
  /*
   * Track the normal analytics event.
   *
   * This uses analytics consent.
   */
  trackEvent("patient_sign_up", {
    source: source || "direct",
  });

  /*
   * Google Ads conversion configuration.
   */
  const conversionId =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || "";

  const conversionLabel =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL_PATIENT || "";

  /*
   * Track the Google Ads conversion.
   *
   * This uses advertising consent.
   */
  if (conversionId && conversionLabel) {
    trackConversion(
      conversionId,
      conversionLabel,
      value
    );
  }
};

/* ============================================
   NEWSLETTER
============================================ */

/**
 * Track newsletter subscription.
 */
export const trackNewsletterSubscription = (
  email: string
) => {
  trackEvent("newsletter_subscription", {
    email,
  });
};

/* ============================================
   EMERGENCY CALL
============================================ */

/**
 * Track emergency call.
 */
export const trackEmergencyCall = (
  source: string
) => {
  trackEvent("emergency_call", {
    source,
  });
};

/* ============================================
   LOCATION / DIRECTIONS
============================================ */

/**
 * Track location/directions click.
 */
export const trackLocationClick = (
  branch: string
) => {
  trackEvent("location_click", {
    branch,
  });
};