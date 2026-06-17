"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === "dark" ? (
        <>
          <Sun size={16} />
          Light Mode
        </>
      ) : (
        <>
          <Moon size={16} />
          Dark Mode
        </>
      )}
    </button>
  );
}