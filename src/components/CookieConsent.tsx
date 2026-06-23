"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function openCookiePreferences() {
  window.dispatchEvent(new Event("open-cookie-preferences"));
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");

    if (!consent) {
      setShow(true);
    }

    const handleOpen = () => {
      setShow(true);
    };

    window.addEventListener("open-cookie-preferences", handleOpen);

    return () => {
      window.removeEventListener("open-cookie-preferences", handleOpen);
    };
  }, []);

  function acceptAll() {
    localStorage.setItem(
      "cookieConsent",
      JSON.stringify({
        essential: true,
        analytics: true,
        date: new Date().toISOString(),
      }),
    );

    setShow(false);
  }

  function rejectOptional() {
    localStorage.setItem(
      "cookieConsent",
      JSON.stringify({
        essential: true,
        analytics: false,
        date: new Date().toISOString(),
      }),
    );

    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      className="
      fixed
      bottom-4
      left-4
      right-4

      z-[9999]

      flex
      justify-center
      "
    >
      <div
        className="
        w-full
        max-w-6xl

        bg-zinc-950/95
        backdrop-blur-xl

        border border-zinc-800

        rounded-2xl

        p-5 md:p-6

        shadow-2xl
        "
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="max-w-3xl">
            <h3 className="text-white font-semibold text-lg">
              Cookie Preferences
            </h3>

            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              FinWise uses essential cookies for security and account
              functionality. Optional analytics cookies help us improve
              performance and user experience.
            </p>

            <Link
              href="/cookie-policy"
              className="text-emerald-400 text-sm mt-2 inline-block hover:text-emerald-300"
            >
              Read Cookie Policy
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={rejectOptional}
              className="
              px-5 py-3

              rounded-xl

              border border-zinc-700

              text-white

              hover:bg-zinc-900

              transition
              "
            >
              Reject Optional
            </button>

            <button
              onClick={acceptAll}
              className="
              px-5 py-3

              rounded-xl

              bg-emerald-600

              hover:bg-emerald-700

              text-white

              transition
              "
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
