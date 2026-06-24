"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import UserDropdown from "@/components/UserDropdown";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

import {
  LayoutDashboard,
  IndianRupee,
  Receipt,
  Calculator,
  TrendingUp,
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
];

export default function Sidebar() {
  const pathname = usePathname();

  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);

  const hiddenRoutes = new Set([
    "/",
    "/login",
    "/signup",
    "/onboarding",
    "/privacy",
    "/terms",
    "/cookie-policy",
  ]);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name,user_type")
        .eq("id", userData.user.id)
        .single();

      setProfile(data);
    }

    loadProfile();
  }, []);

  if (hiddenRoutes.has(pathname)) {
    return null;
  }

  return (
    <div className="hidden lg:flex w-64 h-screen bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 fixed left-0 top-0 flex-col">
      <div className="w-full flex justify-center items-center">
        <div className="flex items-center gap-3">
          {/* Light Mode Logo */}
          <Image
            src="/logo/finwise-large-white.png"
            alt="FinWise"
            width={180}
            height={50}
            className="block dark:hidden shrink-0"
          />

          {/* Dark Mode Logo */}
          <Image
            src="/logo/finwise-large-black1.png"
            alt="FinWise"
            width={180}
            height={50}
            className="hidden dark:block shrink-0"
          />
        </div>
      </div>

      <div className="p-4 pt-5 flex-1">
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
        <div className="mb-4">
          {profile && (
            <UserDropdown
              name={profile.full_name}
              userType={profile.user_type}
            />
          )}
        </div>
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
          FinWise India v1.4.1
        </p>
      </div>
    </div>
  );
}
