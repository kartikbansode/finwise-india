"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  BarChart3, 
  Calculator, 
  ShieldCheck, 
  Wallet, 
  ReceiptIndianRupee,
  Activity
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [checkingSession, setCheckingSession] = useState(true);

  // LOGIC REMAINS UNCHANGED
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setCheckingSession(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.replace("/dashboard");
        return;
      }

      router.replace("/onboarding");
    };

    init();
  }, [router, supabase]);

  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center flex flex-col items-center">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mb-6 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
          />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
            Loading FinWise...
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Preparing your secure workspace</p>
        </div>
      </main>
    );
  }

  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <main className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* 🌟 1. Glassmorphism Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              FinWise <span className="text-emerald-600">India</span>
            </h1>
          </div>

          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-slate-600 font-medium hover:text-emerald-600 transition-colors">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* 🌟 2. 3D Floating Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-400/20 blur-[100px]" />
          <div className="absolute top-40 -left-40 w-[500px] h-[500px] rounded-full bg-teal-300/20 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Hero Content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white border border-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Built specifically for Indian Freelancers & Businesses
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900 tracking-tight">
              Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">Cash Flow</span> & Taxes
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl text-slate-600 mt-6 max-w-2xl mx-auto lg:mx-0">
              FinWise helps freelancers, agencies, and consultants automate invoices, predict GST, track 44ADA taxes, and make smarter financial decisions effortlessly.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mt-10">
              <Link
                href="/signup"
                className="group relative flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl text-lg font-semibold overflow-hidden shadow-xl hover:shadow-slate-900/20 transition-all hover:scale-105"
              >
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating 3D Dashboard Mockups */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex-1 relative w-full h-[400px] lg:h-[500px] perspective-1000 hidden md:block"
          >
            {/* Card 1: Main Balance */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-10 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-20"
              style={{ transform: "rotateY(-15deg) rotateX(10deg)" }}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg"><Wallet className="text-emerald-600 w-6 h-6"/></div>
                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+14.5%</span>
              </div>
              <p className="text-slate-500 font-medium">Total Revenue (FY 23-24)</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">₹ 14,50,000</h3>
            </motion.div>

            {/* Card 2: Tax Alert */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 left-0 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-6 z-30"
              style={{ transform: "rotateY(15deg) rotateX(5deg)" }}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg"><Calculator className="text-red-400 w-6 h-6"/></div>
                <span className="text-xs text-slate-400">Due in 12 days</span>
              </div>
              <p className="text-slate-400 font-medium">Est. Advance Tax</p>
              <h3 className="text-2xl font-bold text-white mt-1">₹ 45,000</h3>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-orange-400 w-3/4 h-full rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 🌟 3. Features Section with Hover 3D Tilt */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Everything You Need to Succeed</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Stop using messy spreadsheets. Get a unified view of your freelance business.</p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Feature 1 */}
          <motion.div variants={fadeUp} whileHover={{ y: -10, scale: 1.02 }} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50 transition-all">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <ReceiptIndianRupee className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-bold text-2xl text-slate-900">Income Tracking</h3>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Track all client payments, generate professional invoices, and monitor pending revenue instantly.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={fadeUp} whileHover={{ y: -10, scale: 1.02 }} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50 transition-all">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-2xl text-slate-900">Smart Tax Center</h3>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Automated calculations for GST, Advance Tax, and dedicated support for Section 44ADA / 44AD.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={fadeUp} whileHover={{ y: -10, scale: 1.02 }} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50 transition-all">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <BarChart3 className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-bold text-2xl text-slate-900">Business Insights</h3>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Know exactly where your money goes, identify your most profitable clients, and see safe-to-spend balances.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 🌟 4. Call To Action (Bottom) */}
      <section className="px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl"
        >
          {/* CTA Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-[-50%] left-[20%] w-96 h-96 bg-emerald-500/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-50%] right-[20%] w-96 h-96 bg-teal-500/20 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Stop Guessing Your Taxes
            </h2>
            <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-10">
              Join thousands of Indian freelancers, creators, and agency owners who have ultimate clarity over their finances.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-900 px-10 py-5 rounded-full text-lg font-bold shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
