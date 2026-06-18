"use client";

import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  email: string;
  password: string;
  loading: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onLogin: () => void;
  onGoogle: () => void;
}

export default function AuthCard({
  email,
  password,
  loading,
  setEmail,
  setPassword,
  onLogin,
  onGoogle,
}: Props) {
  return (
    <div
      className="
  w-full max-w-md
  bg-white dark:bg-zinc-900
  border border-gray-200 dark:border-zinc-800
  rounded-3xl
  shadow-xl
  p-8
"
    >
      <div className="text-center mb-8">
        <div className="flex flex-col items-center">
          <Image
            src="/logo/finwise-icon.png"
            alt="FinWise"
            className="w-16 h-16 mb-4"
            width={64}
            height={64}
          />

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            FinWise
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Financial Operating System
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>

          <div
            className="
  mt-1 flex items-center
  bg-white dark:bg-zinc-950
  border border-gray-300 dark:border-zinc-700
  rounded-xl px-3
"
          >
            <Mail size={18} className="text-gray-500 dark:text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
w-full px-3 py-3
bg-transparent
text-gray-900 dark:text-white
placeholder:text-gray-400 dark:placeholder:text-gray-500
outline-none
"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>

          <div
            className="
  mt-1 flex items-center
  bg-white dark:bg-zinc-950
  border border-gray-300 dark:border-zinc-700
  rounded-xl px-3
"
          >
            <Lock size={18} className="text-gray-500 dark:text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
w-full px-3 py-3
bg-transparent
text-gray-900 dark:text-white
placeholder:text-gray-400 dark:placeholder:text-gray-500
outline-none
"
              placeholder="********"
            />
          </div>
        </div>

        <button
          onClick={onLogin}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <Link
          href="/signup"
          className="
w-full
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
py-3 rounded-xl
font-medium
hover:bg-gray-50 dark:hover:bg-zinc-800
text-center block
"
        >
          Create Account
        </Link>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-zinc-700"></div>
          </div>

          <div className="relative flex justify-center">
            <span
              className="
  bg-white dark:bg-zinc-900
  px-3
  text-sm
  text-gray-500 dark:text-gray-400
"
            >
              OR
            </span>
          </div>
        </div>

        <button
          onClick={onGoogle}
          className="
w-full
border border-gray-300 dark:border-zinc-700
bg-white dark:bg-zinc-900
text-gray-900 dark:text-white
py-3 rounded-xl
flex justify-center items-center gap-3
hover:bg-gray-50 dark:hover:bg-zinc-800
transition-colors
"
        >
          <Image src="/google.svg" alt="Google" width={20} height={20} />

          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
