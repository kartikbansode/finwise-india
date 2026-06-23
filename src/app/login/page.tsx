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
  const [videoLoaded, setVideoLoaded] = useState(false);

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

      if (!email.trim()) {
        setErrorMessage("Please enter your email address.");
        setLoading(false);
        return;
      }

      if (!password.trim()) {
        setErrorMessage("Please enter your password.");
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
  relative
  min-h-screen
  overflow-hidden
  "
    >
      <div className="hidden lg:block fixed top-6 right-6 z-50">
        <button
          onClick={() => router.back()}
          className="
    cursor-pointer
    flex items-center gap-2
    px-4 py-2.5
    rounded-xl

    bg-black/50
    backdrop-blur-xl

    border border-white/10

    text-white

    hover:bg-black/70
    transition-all
    "
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
      <video
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className="
  absolute
  inset-0
  w-full
  h-full
  object-cover
  blur-md
  scale-110
  "
      >
        <source src="/landing/login-video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/65" />
      {!videoLoaded && (
        <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading FinWise...</p>
          </div>
        </div>
      )}
      {/* Left Side */}
      {/* Left Content */}
      <div
        className="
  hidden
  lg:flex
  absolute
  left-0
  top-0
  h-full
  flex-col
  justify-between
  p-16
  text-white
  z-10
  "
      >
        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-4">
              <Image
                src="/logo/finwise-large-black1.png"
                alt="FinWise"
                width={180}
                height={50}
              />
            </div>

            <div className="mt-16">
              <h2 className="text-6xl font-bold leading-tight max-w-xl">
                India's Smartest Tax & Finance Platform
              </h2>

              <p className="mt-6 text-xl text-white/80 max-w-lg">
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
      </div>

      {/* Right Side */}
      <div
        className="
  relative
  z-10
  min-h-screen
  flex
  items-start
lg:items-center
  justify-center
  lg:justify-end
  lg:pr-24
  px-4
  sm:px-6
  "
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <Image
              src="/logo/finwise-large-black1.png"
              alt="FinWise"
              width={160}
              height={45}
            />

            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/");
                }
              }}
              className="
cursor-pointer
flex items-center gap-2
px-4 py-2
rounded-xl

bg-black/50
backdrop-blur-xl

border border-white/10

text-white

hover:bg-black/70
transition-all
"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl">
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
        </div>
      </div>
    </main>
  );
}
