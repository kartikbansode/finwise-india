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

  async function handleSignup() {
    try {
      setError("");
      setSuccess("");

      if (!fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      if (!password.trim()) {
        setError("Please enter a password.");
        return;
      }

      if (!confirmPassword.trim()) {
        setError("Please confirm your password.");
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

      setSuccess("Account created successfully. Please wait!");

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
  relative
  min-h-screen
  overflow-hidden
  "
    >
      {/* Back Button */}
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
        <source src="/landing/signup-video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/65 pointer-events-none" />
      {!videoLoaded && (
        <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading FinWise...</p>
          </div>
        </div>
      )}
      {/* Left Side */}
      <div
        className="
  hidden
  lg:flex
  absolute
  left-0
  top-0
  h-full
  w-full
  max-w-xl
  flex-col
  justify-between
  p-16
  text-white
  z-10
  "
      >
        {/* Content */}
        <div className="relative z-10">
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
              Build Your Financial{" "}
              <span
                className="
    text-emerald-400
    text-[1.15em]
    font-normal
    inline-block
    "
                style={{ fontFamily: "EduNSW" }}
              >
                Command Center
              </span>
            </h2>

            <p className="mt-6 text-xl text-white/80 max-w-lg">
              Join thousands of freelancers, consultants and business owners
              using FinWise to track income, manage taxes and stay compliant.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-5">
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
      </div>

      {/* Right Side */}
      <div
        className="
  relative
  z-20
  min-h-screen

  flex
  items-center

  lg:ml-auto
  lg:w-1/2

  justify-center

  px-6
  "
      >
        <div className="w-full max-w-md lg:mb-0 mb-8">
          <div className="lg:hidden flex items-center justify-between mb-6">
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
    "
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>

          <div
            className="
bg-black/50
backdrop-blur-2xl
border border-white/10
rounded-3xl
shadow-[0_25px_80px_rgba(0,0,0,0.55)]
p-8
"
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">
                Create your account
              </h1>

              <p className="text-gray-300 mt-2">
                Start managing your business finances professionally.
              </p>
            </div>

            {error && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3">
                {success}
              </div>
            )}

            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  required
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="
w-full
bg-black/40
border border-white/10
text-white placeholder:text-gray-500
rounded-xl
px-4 py-3
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="
w-full
bg-black/40
border border-white/10
text-white placeholder:text-gray-500
rounded-xl
px-4 py-3
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="
w-full
bg-black/40
border border-white/10
text-white placeholder:text-gray-500
rounded-xl
px-4 py-3
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  className="
w-full
bg-black/40
border border-white/10
text-white placeholder:text-gray-500
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
                  <div className="w-full border-t border-white/10" />
                </div>

                <div className="relative flex justify-center">
                  <span
                    className="
  bg-black/40
  backdrop-blur-2xl
  px-3
  text-sm
  text-gray-400
"
                  >
                    OR
                  </span>
                </div>
              </div>

              <button
                onClick={googleSignup}
                className="
cursor-pointer
w-full
bg-black/40
text-white
py-3
rounded-xl
flex justify-center items-center gap-3
border border-white/10
hover:bg-black/60
transition-colors
"
              >
                <Image src="/google.svg" alt="Google" width={20} height={20} />

                <span>Continue with Google</span>
              </button>
            </div>

            <p className="text-center text-sm text-gray-400 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-400 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
