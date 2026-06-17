"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Settings, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface Props {
  name: string;
  userType?: string;
}

export default function UserDropdown({ name, userType }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);

  async function logout() {
    await supabase.auth.signOut();

    router.replace("/login");

    router.refresh();

    router.push("/login");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:shadow-md transition"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
          {name?.charAt(0)}
        </div>

        <div className="text-left">
          <p className="font-medium text-sm">{name}</p>

          <p className="text-xs text-gray-500 capitalize">{userType}</p>
        </div>

        <ChevronDown size={18} className="text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => router.push("/settings")}
            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50"
          >
            <Settings size={16} />
            Settings
          </button>

          <button
            onClick={() => router.push("/settings")}
            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50"
          >
            <User size={16} />
            Profile
          </button>

          <div className="border-t" />

          <button
            onClick={logout}
            className="w-full px-4 py-3 text-left flex items-center gap-3 text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
