"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { ChevronDown, Settings, LogOut } from "lucide-react";

interface Props {
  name: string;
  userType?: string;
  profileImageUrl?: string;
}

export default function UserDropdown({ 
  name, 
  userType, 
  profileImageUrl 
}: Props) {
  
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update cache buster when profileImageUrl changes
  useEffect(() => {
    if (profileImageUrl) {
      setCacheBuster(Date.now());
    }
  }, [profileImageUrl]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const imageSrc = profileImageUrl 
    ? `${profileImageUrl}?t=${cacheBuster}` 
    : null;

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all duration-200"
      >
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt="Profile"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-zinc-700"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-semibold shadow">
                      ${name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-semibold shadow">
              {name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
        </div>

        <div className="text-left flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {name || "User"}
          </p>
          <p className="text-xs text-zinc-400 capitalize truncate">
            {userType === "business" ? "Business" : "Freelancer"}
          </p>
        </div>

        <ChevronDown
          size={18}
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute bottom-full left-0 mb-3 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 backdrop-blur-xl rounded-xl shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
            className="w-full px-4 py-3 text-left flex items-center gap-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
          >
            <Settings size={16} />
            Settings
          </button>

          <button
            onClick={() => {
              setOpen(false);
              setShowLogoutModal(true);
            }}
            className="w-full px-4 py-3 text-left flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Logout</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to logout from FinWise?</p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700"
              >
                Cancel
              </button>
              <button 
                disabled={loggingOut} 
                onClick={logout} 
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}