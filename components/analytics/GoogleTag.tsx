"use client";

import Script from "next/script";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface GoogleTagProps {
  tagId: string;
  adsConversionId?: string;
}

// Inner component that uses useSearchParams — must be wrapped in Suspense
function GoogleTagPageTracker({ tagId }: { tagId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!tagId || typeof window === "undefined") return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (window.gtag) {
      window.gtag("config", tagId, { page_path: url, send_page_view: true });
    }
  }, [pathname, searchParams, tagId]);

  return null;
}

export function GoogleTag({ tagId, adsConversionId }: GoogleTagProps) {
  return (
    <>
      {/* Scripts don't need Suspense */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
          });
          gtag('config', '${tagId}', {
            send_page_view: true,
            allow_google_signals: true,
            allow_ad_personalization_signals: true
          });
          ${adsConversionId ? `gtag('config', '${adsConversionId}');` : ""}
        `}
      </Script>

      {/* Page tracker requires Suspense because of useSearchParams */}
      <Suspense fallback={null}>
        <GoogleTagPageTracker tagId={tagId} />
      </Suspense>
    </>
  );
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
