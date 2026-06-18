"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const { data } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", session.user.id)
      .single();

    if (data?.onboarding_completed) {
      router.replace("/dashboard");
    } else {
      router.replace("/onboarding");
    }
  }

  useEffect(() => {
    checkSession();
  }, []);

  async function handleSignup() {
    try {
      setError("");
      setSuccess("");

      if (!fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Unable to create account.");
        setLoading(false);
        return;
      }

      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        onboarding_completed: false,
      });

      setSuccess("Account created successfully.");

      setTimeout(() => {
        router.replace("/onboarding");
      }, 800);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function googleSignup() {
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/onboarding",
      },
    });

    if (error) {
      setError(error.message);
    }
  }

  return (
    <main
      className="
  min-h-screen
  flex items-center justify-center
  p-6
  bg-gradient-to-br
  from-slate-50 via-white to-emerald-50
  dark:from-zinc-950 dark:via-black dark:to-emerald-950/20
"
    >
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Start managing your finances smarter.
          </p>
        </div>

        {error && (
          <div
            className="
  mt-6
  bg-red-50 dark:bg-red-950/30
  border border-red-200 dark:border-red-900
  text-red-700 dark:text-red-400
  rounded-xl p-3
"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="
  mt-6
  bg-emerald-50 dark:bg-emerald-950/30
  border border-emerald-200 dark:border-emerald-900
  text-emerald-700 dark:text-emerald-400
  rounded-xl p-3
"
          >
            {success}
          </div>
        )}

        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
placeholder:text-gray-400 dark:placeholder:text-gray-500
rounded-xl
px-4 py-3
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
placeholder:text-gray-400 dark:placeholder:text-gray-500
rounded-xl
px-4 py-3
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
placeholder:text-gray-400 dark:placeholder:text-gray-500
rounded-xl
px-4 py-3
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              placeholder="********"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
placeholder:text-gray-400 dark:placeholder:text-gray-500
rounded-xl
px-4 py-3
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              placeholder="********"
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <button
            onClick={googleSignup}
            className="
w-full
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
py-3 rounded-xl
flex justify-center items-center gap-3
hover:bg-gray-50 dark:hover:bg-zinc-800
"
          >
            <div className="w-5 h-5 rounded-full bg-white border flex items-center justify-center text-xs font-bold">
              G
            </div>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-600 dark:text-emerald-400 font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
