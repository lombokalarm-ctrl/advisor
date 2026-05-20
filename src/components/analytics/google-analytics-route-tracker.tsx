"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type GoogleAnalyticsRouteTrackerProps = {
  measurementId: string;
};

type GtagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

export function GoogleAnalyticsRouteTracker({
  measurementId,
}: GoogleAnalyticsRouteTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const gtagWindow = window as GtagWindow;

    if (!gtagWindow.gtag) {
      return;
    }

    const search = searchParams.toString();
    const pagePath = search ? `${pathname}?${search}` : pathname;

    gtagWindow.gtag("config", measurementId, {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [measurementId, pathname, searchParams]);

  return null;
}
