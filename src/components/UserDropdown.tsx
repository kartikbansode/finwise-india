"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ChevronDown, Settings, LogOut } from "lucide-react";

interface Props {
  name: string;
  userType?: string;
}

export default function UserDropdown({ name, userType }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();

    router.replace("/login");

    router.refresh();

    router.push("/login");
  }

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="
w-full
flex items-center
gap-3
bg-zinc-900
border border-zinc-800
rounded-2xl
px-4 py-3
hover:border-zinc-700
hover:bg-zinc-800/80
transition-all
duration-200
"
      >
        <div
          className="
  w-10 h-10
  rounded-full
  bg-gradient-to-br
  from-emerald-500
  to-emerald-700
  text-white
  flex items-center justify-center
  font-semibold
  shadow-lg
  "
        >
          {name?.charAt(0)}
        </div>

        <div className="text-left flex-1 min-w-0">
          <p className="font-medium text-sm text-white truncate">{name}</p>

          <p className="text-xs text-zinc-400 capitalize truncate">
            {userType}
          </p>
        </div>

        <ChevronDown
          size={18}
          className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="
  absolute bottom-full left-0 mb-3 w-full
bg-zinc-900
  border border-zinc-800
  backdrop-blur-xl
  rounded-xl shadow-lg
  z-50 overflow-hidden
"
        >
          <button
            onClick={() => router.push("/settings")}
            className="
w-full
px-4 py-3
text-left
flex items-center gap-3
text-white
hover:bg-zinc-800
transition
"
          >
            <Settings size={16} />
            Settings
          </button>

          <button
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to logout?",
              );

              if (confirmed) {
                logout();
              }
            }}
            className="
w-full
px-4 py-3
text-left
flex items-center gap-3
text-red-400
hover:bg-red-950/30
transition
"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
