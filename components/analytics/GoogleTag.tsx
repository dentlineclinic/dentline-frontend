"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface GoogleTagProps {
  tagId: string;
  adsConversionId?: string;
}

export function GoogleTag({ tagId, adsConversionId }: GoogleTagProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route changes
  useEffect(() => {
    if (!tagId || typeof window === "undefined") return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    
    if (window.gtag) {
      window.gtag("config", tagId, {
        page_path: url,
        send_page_view: true,
      });
    }
  }, [pathname, searchParams, tagId]);

  return (
    <>
      {/* Google Tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
        strategy="afterInteractive"
      />
      
      <Script id="google-tag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Default consent mode
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
          });

          // Configure GA4
          gtag('config', '${tagId}', {
            send_page_view: true,
            allow_google_signals: true,
            allow_ad_personalization_signals: true
          });

          ${adsConversionId ? `
            // Configure Google Ads conversion tracking
            gtag('config', '${adsConversionId}');
          ` : ''}
        `}
      </Script>
    </>
  );
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}