"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

type Provider = { id: string; name: string };

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.4l-6.5 5C9.6 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.1 36.4 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
  </svg>
);

const AppleIcon = () => (
  <svg width="16" height="18" viewBox="0 0 384 512" aria-hidden fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

export default function SocialLogin({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);

  useEffect(() => {
    getProviders().then((p) => setProviders(p as Record<string, Provider> | null));
  }, []);

  const hasGoogle = !!providers?.google;
  const hasApple = !!providers?.apple;
  if (!hasGoogle && !hasApple) return null;

  // Ziel nach Login: zuerst ?callbackUrl= aus der URL, sonst die übergebene Prop
  function target() {
    if (typeof window !== "undefined") {
      const cb = new URLSearchParams(window.location.search).get("callbackUrl");
      if (cb && cb.startsWith("/") && !cb.startsWith("//")) return cb;
    }
    return callbackUrl;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-xs text-neutral-400 uppercase tracking-wider">oder</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
      <div className="space-y-3">
        {hasGoogle && (
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: target() })}
            className="w-full flex items-center justify-center gap-3 border border-neutral-300 rounded-xl py-3 px-4 font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <GoogleIcon /> Weiter mit Google
          </button>
        )}
        {hasApple && (
          <button
            type="button"
            onClick={() => signIn("apple", { callbackUrl: target() })}
            className="w-full flex items-center justify-center gap-3 bg-black text-white rounded-xl py-3 px-4 font-medium hover:bg-neutral-800 transition-colors"
          >
            <AppleIcon /> Weiter mit Apple
          </button>
        )}
      </div>
    </div>
  );
}
