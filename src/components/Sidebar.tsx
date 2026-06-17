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
      <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="font-bold text-xl text-gray-900 dark:text-white">
            FinWise India
          </h1>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Smart Finance for India
          </p>
        </div>
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
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-zinc-800">
        <Link
          href="/privacy"
          className="
block
text-sm
text-gray-500 dark:text-gray-400
hover:text-gray-900 dark:hover:text-white
py-2
"
        >
          Privacy Policy
        </Link>

        <Link
          href="/terms"
          className="
block
text-sm
text-gray-500 dark:text-gray-400
hover:text-gray-900 dark:hover:text-white
py-2
"
        >
          Terms & Conditions
        </Link>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          FinWise India v1.2.0
        </p>
      </div>
    </div>
  );
}
