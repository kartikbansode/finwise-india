"use client";

import { MonitorSmartphone, Laptop } from "lucide-react";

export default function MobileBlocker() {
  return (
    <div className="lg:hidden min-h-screen flex items-center justify-center p-6 bg-zinc-950">
      <div
        className="
        max-w-md
        w-full
        text-center

        bg-zinc-900/80
        backdrop-blur-xl

        border border-zinc-800
        rounded-3xl

        p-8
        "
      >
        <div
          className="
          w-20 h-20
          mx-auto mb-6

          rounded-2xl

          bg-emerald-500/10
          border border-emerald-500/20

          flex items-center justify-center
          "
        >
          <MonitorSmartphone
            size={40}
            className="text-emerald-400"
          />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Desktop Experience Required
        </h1>

        <p className="text-zinc-400 leading-relaxed">
          FinWise dashboard is currently optimized for desktop and laptop
          screens. Please open FinWise on a larger device for the best
          experience.
        </p>

        <div
          className="
          mt-8

          bg-zinc-950
          border border-zinc-800

          rounded-2xl
          p-4

          flex items-center gap-3
          "
        >
          <Laptop
            size={22}
            className="text-emerald-400 flex-shrink-0"
          />

          <div className="text-left">
            <p className="text-white font-medium">
              Recommended
            </p>

            <p className="text-zinc-500 text-sm">
              Laptop, Desktop or Tablet Landscape
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}