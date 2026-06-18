"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

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
    <main className="min-h-screen bg-white dark:bg-black grid lg:grid-cols-2">
      {/* Left Side */}
      <div
        className="
hidden lg:flex
relative
flex-col
justify-between
p-16
bg-gradient-to-br
from-emerald-600
via-emerald-700
to-emerald-900
text-white
overflow-hidden
"
      >
        <div className="fixed top-6 right-6 z-50">
  <button
    onClick={() => router.back()}
    className="
    cursor-pointer

    flex items-center gap-2

    bg-white/90
    dark:bg-zinc-900/90

    backdrop-blur-md

    border
    border-gray-200
    dark:border-zinc-800

    text-gray-700
    dark:text-gray-300

    px-4 py-2.5
    rounded-xl

    shadow-sm
    hover:shadow-lg
    hover:scale-105

    transition-all
    duration-200
    "
  >
    <ArrowLeft size={16} />
    Back
  </button>
</div>
        <div>

          <div className="flex items-center gap-4 ">
            <Image
              src="/logo/finwise-icon.png"
              alt="FinWise"
              width={60}
              height={60} className="rounded-2xl border border-white/20 shadow-lg"
            />

            <div>
              <h1 className="text-3xl font-bold">FinWise</h1>

              <p className="text-emerald-100">India</p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-6xl font-bold leading-tight max-w-xl">
              Build Your Financial Command Center
            </h2>

            <p className="mt-6 text-xl text-emerald-100 max-w-lg">
              Join thousands of freelancers, consultants and business owners
              using FinWise to track income, manage taxes and stay compliant.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white" />
            GST & Tax Tracking
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white" />
            Professional Invoicing
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white" />
            Expense Management
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white" />
            Smart Business Insights
          </div>
        </div>

        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side */}
      <div
        className="
flex
items-center
justify-center
p-6
lg:p-16
bg-gray-50 dark:bg-zinc-950
"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/logo/finwise-icon.png"
              alt="FinWise"
              width={60}
              height={60}
              className="mx-auto mb-4 rounded-2xl border border-white/20 shadow-lg"
            />

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              FinWise
            </h1>
          </div>

          <div
            className="
bg-white dark:bg-zinc-900
border border-gray-200 dark:border-zinc-800
rounded-3xl
shadow-xl
p-8
"
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create your account
              </h1>

              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Start managing your business finances professionally.
              </p>
            </div>

            {error && (
              <div className="mt-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl p-3">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-xl p-3">
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
                  placeholder="John Doe"
                  className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-xl
px-4 py-3
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
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
                  placeholder="john@example.com"
                  className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-xl
px-4 py-3
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
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
                  placeholder="********"
                  className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-xl
px-4 py-3
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
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
                  placeholder="********"
                  className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-xl
px-4 py-3
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
                />
              </div>

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-zinc-700" />
                </div>

                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-zinc-900 px-3 text-sm text-gray-500 dark:text-gray-400">
                    OR
                  </span>
                </div>
              </div>

              <button
                onClick={googleSignup}
                className="
w-full
border border-gray-300 dark:border-zinc-700
bg-white dark:bg-zinc-900
text-gray-900 dark:text-white
py-3 rounded-xl
flex justify-center items-center gap-3
hover:bg-gray-50 dark:hover:bg-zinc-800
"
              >
                <Image src="/google.svg" alt="Google" width={20} height={20} />

                <span>Continue with Google</span>
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
        </div>
      </div>
    </main>
  );
}
