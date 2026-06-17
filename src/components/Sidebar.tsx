"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  IndianRupee,
  Receipt,
  Calculator,
  TrendingUp,
  Settings,
  FileText,
} from "lucide-react";

const items = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Income",
    href: "/income",
    icon: IndianRupee,
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    name: "Tax Center",
    href: "/tax",
    icon: Calculator,
  },
  {
    name: "Investments",
    href: "/investments",
    icon: TrendingUp,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/onboarding"
  ) {
    return null;
  }

  return (
    <div
      className="w-64 h-screen bg-white
dark:bg-zinc-950
border-r
dark:border-zinc-800 fixed left-0 top-0 flex flex-col"
    >
      <div className="p-6 border-b">
        <h1 className="font-bold text-xl">FinWise India</h1>
      </div>

      <div className="p-4 flex-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition ${
                pathname === item.href
                  ? "bg-emerald-50 text-emerald-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto p-4 border-t">
        <Link
          href="/privacy"
          className="block text-sm text-gray-500 hover:text-gray-900 py-2"
        >
          Privacy Policy
        </Link>

        <Link
          href="/terms"
          className="block text-sm text-gray-500 hover:text-gray-900 py-2"
        >
          Terms & Conditions
        </Link>

        <p className="text-xs text-gray-400 mt-4">FinWise India v1.1.0</p>
      </div>
    </div>
  );
}
