"use client";

import { useEffect, useRef } from "react";
import { AuthErrorCode } from "@/features/auth/types/auth.types";

export function SessionGuard() {
  const isTerminating = useRef(false);

  const handleSessionExpired = async () => {
    if (isTerminating.current) return;
    isTerminating.current = true;

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue even if logout API fails
    }

    // Force full page redirect to login with query param so login page shows notification
    window.location.href = "/login?sessionExpired=true";
  };

  useEffect(() => {
    // 1. Intercept client fetch to catch 401 / SESSION_EXPIRED_OTHER_DEVICE from any API call
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 401) {
        try {
          const clone = response.clone();
          const data = await clone.json();
          if (
            data.sessionExpired ||
            data.errorCode === AuthErrorCode.SESSION_EXPIRED_OTHER_DEVICE ||
            data.errorCode === 2008 ||
            (typeof data.errorMessage === "string" &&
              data.errorMessage.toLowerCase().includes("session"))
          ) {
            handleSessionExpired();
          }
        } catch {
          // If clone parsing fails on a 401, check session validity
          handleSessionExpired();
        }
      }

      return response;
    };

    // 2. Periodic heartbeat & visibility/focus listener
    const verifySession = async () => {
      if (isTerminating.current) return;
      try {
        const res = await originalFetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
        });

        if (res.status === 401) {
          const data = await res.json().catch(() => ({}));
          if (
            data.sessionExpired ||
            data.errorCode === AuthErrorCode.SESSION_EXPIRED_OTHER_DEVICE ||
            data.errorCode === 2008
          ) {
            handleSessionExpired();
          }
        }
      } catch {
        // Network blip, ignore
      }
    };

    // Check periodically every 30 seconds
    const intervalId = setInterval(verifySession, 30000);

    // Check immediately when user switches tabs or window gains focus
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        verifySession();
      }
    };
    const onFocus = () => {
      verifySession();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    return () => {
      window.fetch = originalFetch;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return null;
}
