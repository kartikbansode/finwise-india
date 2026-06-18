"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AuthCard from "@/components/AuthCard";
import { createClient } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  async function login() {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setErrorMessage("Unable to login. Please try again.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Login successful. Redirecting...");

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.onboarding_completed) {
        router.replace("/dashboard");
        return;
      }

      router.replace("/onboarding");
    } catch {
      setErrorMessage("Something went wrong.");
      setLoading(false);
    }
  }

  async function googleLogin() {
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/onboarding",
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <main
      className="
min-h-screen
bg-white dark:bg-black
grid lg:grid-cols-2
"
    >
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
          

          <div className="flex items-center gap-4">
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
              India's Smartest Tax & Finance Platform
            </h2>

            <p className="mt-6 text-xl text-emerald-100 max-w-lg">
              Manage income, GST, invoices, taxes and cash flow from one
              powerful dashboard.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white" />
            GST & Tax Intelligence
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white" />
            Invoice Tracking
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white" />
            Expense Management
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white" />
            Real Financial Insights
          </div>
        </div>

        {/* Decorative Blur */}
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
          {/* Mobile Logo */}
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

          {errorMessage && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl">
              {successMessage}
            </div>
          )}
          

          <AuthCard
            email={email}
            password={password}
            loading={loading}
            setEmail={setEmail}
            setPassword={setPassword}
            onLogin={login}
            onGoogle={googleLogin}
          />

          <button
            onClick={() => router.push("/")}
            className="
lg:hidden
w-full
mt-4
text-sm
text-gray-500
dark:text-gray-400
hover:text-emerald-600
"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
