"use client";

import { useEffect, useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

interface EventTrackerProps {
  eventName: string;
  eventParams?: Record<string, any>;
  triggerOnMount?: boolean;
  children?: React.ReactNode;
}

/**
 * Component that tracks an event when mounted or clicked
 */
export function EventTracker({
  eventName,
  eventParams = {},
  triggerOnMount = false,
  children,
}: EventTrackerProps) {
  const { track } = useAnalytics();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (triggerOnMount && !hasTracked.current) {
      track(eventName, eventParams);
      hasTracked.current = true;
    }
  }, [triggerOnMount, eventName, eventParams, track]);

  const handleClick = () => {
    track(eventName, eventParams);
  };

  if (!children) return null;

  return (
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      {children}
    </div>
  );
}