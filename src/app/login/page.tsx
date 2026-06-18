"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import AuthCard from "@/components/AuthCard";
import { createClient } from "@/lib/supabase";

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
  flex items-center justify-center
  bg-gradient-to-br
  from-slate-50 via-white to-emerald-50
  dark:from-zinc-950 dark:via-black dark:to-emerald-950/20
  p-6
"
    >
      <div className="w-full max-w-md">
        {errorMessage && (
          <div
            className="
  mb-4
  bg-red-50 dark:bg-red-950/30
  border border-red-200 dark:border-red-900
  text-red-700 dark:text-red-400
  px-4 py-3 rounded-xl
"
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            className="
  mb-4
  bg-emerald-50 dark:bg-emerald-950/30
  border border-emerald-200 dark:border-emerald-900
  text-emerald-700 dark:text-emerald-400
  px-4 py-3 rounded-xl
"
          >
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
    </main>
  );
}
