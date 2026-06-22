"use client";

import { usePathname } from "next/navigation";
import MobileBlocker from "@/components/MobileBlocker";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const publicPages =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/onboarding" ||
    pathname === "/privacy" ||
    pathname === "/terms";

  if (publicPages) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      {/* Mobile Users */}
      <MobileBlocker />

      {/* Desktop Users */}
      <main className="hidden lg:block min-h-screen ml-64 bg-gray-50 dark:bg-zinc-950">
        {children}
      </main>
    </>
  );
}