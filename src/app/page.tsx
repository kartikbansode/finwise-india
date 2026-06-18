"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Menu, X, TrendingUp, FileText, DollarSign, PieChart, Check } from "lucide-react";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [income, setIncome] = useState(500000);
  const [expenses, setExpenses] = useState(150000);
  const { scrollYProgress } = useScroll();

  // Navbar shrink on scroll
  const navbarHeight = useTransform(scrollYProgress, [0, 0.1], [80, 64]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Stats counter animation
  const StatCounter = ({ target, label, prefix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const increment = target / 50;
      const interval = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(Math.floor(start));
        }
      }, 20);
      return () => clearInterval(interval);
    }, [target]);

    return (
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">
          {prefix}
          {count.toLocaleString()}
          {target === 99.9 ? "%" : "+"}
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">{label}</p>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-950 text-gray-900 dark:text-white overflow-hidden">
      {/* Floating Glass Navbar */}
      <motion.nav
        style={{ height: navbarHeight }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-gray-200/50 dark:border-zinc-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
              FW
            </div>
            <span className="hidden sm:inline font-bold text-lg">FinWise</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:text-emerald-600 transition">
              Features
            </a>
            <a href="#tax" className="text-sm hover:text-emerald-600 transition">
              Tax Center
            </a>
            <a href="#why" className="text-sm hover:text-emerald-600 transition">
              Why FinWise
            </a>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800"
            >
              <div className="px-4 py-4 space-y-4">
                <a href="#features" className="block text-sm hover:text-emerald-600">
                  Features
                </a>
                <a href="#tax" className="block text-sm hover:text-emerald-600">
                  Tax Center
                </a>
                <a href="#why" className="block text-sm hover:text-emerald-600">
                  Why FinWise
                </a>
                <div className="flex gap-3 pt-4">
                  <Link href="/login" className="flex-1 text-center text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700">
                    Login
                  </Link>
                  <Link href="/signup" className="flex-1 text-center text-sm px-4 py-2 rounded-lg bg-emerald-600 text-white">
                    Start Free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-32 md:pt-40 pb-20 md:pb-32 px-4 md:px-6 max-w-7xl mx-auto text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="inline-flex mb-6 md:mb-8 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-xs md:text-sm font-medium"
        >
          Financial Operating System for Indian Businesses
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 md:mb-8"
        >
          Track Income.
          <br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Manage Taxes.
          </span>
          <br />
          Run Your Business Like a CFO.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 md:mb-12"
        >
          Know exactly how much money is yours. Built for Indian freelancers, agencies, consultants, and business owners who want clarity over their finances.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            href="/signup"
            className="px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl md:rounded-2xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition duration-300 text-center"
          >
            Create Free Account
          </Link>
          <button
            className="px-8 md:px-10 py-4 md:py-5 border-2 border-gray-300 dark:border-zinc-700 rounded-xl md:rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-zinc-900 transition"
          >
            Watch Demo
          </button>
        </motion.div>
      </motion.section>

      {/* 3D Dashboard Showcase */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto"
      >
        <div className="relative">
          {/* Main Dashboard Image with 3D effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1 }}
            className="relative"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d"
            }}
          >
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl md:rounded-4xl overflow-hidden border border-emerald-200 dark:border-emerald-800 shadow-2xl">
              {/* Placeholder for dashboard image */}
              <div className="aspect-video bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 md:w-20 md:h-20 mx-auto text-emerald-400 mb-4 opacity-50" />
                  <p className="text-emerald-300 text-sm md:text-base">Dashboard Preview</p>
                  <p className="text-gray-500 text-xs md:text-sm mt-2">Upload /public/landing/hero-dashboard.webp</p>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -left-4 md:-left-8 top-1/4 w-40 md:w-48 bg-white dark:bg-zinc-900 rounded-2xl p-4 md:p-6 shadow-xl border border-gray-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <p className="text-xs md:text-sm font-semibold">Income</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold">₹12.5L</p>
              <p className="text-xs text-gray-500 mt-2">This month</p>
            </motion.div>

            <motion.div
              animate={{
                y: [0, 20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute -right-4 md:-right-8 top-1/3 w-40 md:w-48 bg-white dark:bg-zinc-900 rounded-2xl p-4 md:p-6 shadow-xl border border-gray-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <p className="text-xs md:text-sm font-semibold">Tax Estimate</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold">₹1.8L</p>
              <p className="text-xs text-gray-500 mt-2">FY 2024-25</p>
            </motion.div>

            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -left-4 md:-left-8 bottom-1/4 w-40 md:w-48 bg-white dark:bg-zinc-900 rounded-2xl p-4 md:p-6 shadow-xl border border-gray-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                <p className="text-xs md:text-sm font-semibold">GST Payable</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold">₹45K</p>
              <p className="text-xs text-gray-500 mt-2">Next quarter</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Animated Stats Strip */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 py-16 md:py-20 px-4 md:px-6 border-y border-gray-200 dark:border-zinc-800"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <StatCounter target={120} prefix="₹" label="Cr+ Invoices Processed" />
          <StatCounter target={45} prefix="₹" label="Cr+ Tax Calculated" />
          <StatCounter target={25000} label="Businesses Using FinWise" />
          <StatCounter target={99.9} label="Accuracy Rate" />
        </div>
      </motion.section>

      {/* Feature Sections - Alternating Layout */}
      <section id="features" className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto space-y-20 md:space-y-32">
        
        {/* Feature 1 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-8 md:gap-16 items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Track Every Rupee.</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              See where your money comes from and where it goes. Real-time income tracking with support for all payment methods. Invoice management that doesn't feel like a burden.
            </p>
            <ul className="space-y-4">
              {["Multiple payment channels", "Invoice OCR", "Client tracking", "Payment reminders"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl aspect-square flex items-center justify-center border border-emerald-200 dark:border-emerald-800"
          >
            <div className="text-center">
              <TrendingUp className="w-20 h-20 mx-auto text-emerald-600 mb-4 opacity-60" />
              <p className="text-emerald-700 dark:text-emerald-400 font-semibold">Income Dashboard</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature 2 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-8 md:gap-16 items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl aspect-square flex items-center justify-center border border-blue-200 dark:border-blue-800 order-2 md:order-1"
          >
            <div className="text-center">
              <FileText className="w-20 h-20 mx-auto text-blue-600 mb-4 opacity-60" />
              <p className="text-blue-700 dark:text-blue-400 font-semibold">Tax Center</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1 md:order-2"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Know Your Tax Before Government Does.</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Accurate tax calculations for 44ADA, 44AD, GST, and advance tax. Built with India's tax rules in mind. No surprises during filing.
            </p>
            <ul className="space-y-4">
              {["GST Management", "44ADA/44AD Support", "Advance Tax Tracker", "ITR Readiness"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Feature 3 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-8 md:gap-16 items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Professional Invoicing Built In.</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Create and send invoices in seconds. Built-in templates for freelancers and agencies. Track payment status automatically.
            </p>
            <ul className="space-y-4">
              {["Instant Invoice Creation", "Custom Branding", "Recurring Invoices", "Payment Tracking"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl aspect-square flex items-center justify-center border border-purple-200 dark:border-purple-800"
          >
            <div className="text-center">
              <FileText className="w-20 h-20 mx-auto text-purple-600 mb-4 opacity-60" />
              <p className="text-purple-700 dark:text-purple-400 font-semibold">Invoice Generator</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Interactive Tax Calculator */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        id="tax"
        className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">
          See Your Tax Liability in Real Time
        </h2>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-10 border border-gray-200 dark:border-zinc-800"
          >
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3">Annual Income</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold">₹</span>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="50000"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <div className="text-right mt-3 text-2xl font-bold text-emerald-600">
                {(income / 100000).toFixed(1)}L
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3">Annual Expenses</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold">₹</span>
                <input
                  type="range"
                  min="0"
                  max={income}
                  step="50000"
                  value={expenses}
                  onChange={(e) => setExpenses(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <div className="text-right mt-3 text-2xl font-bold text-emerald-600">
                {(expenses / 100000).toFixed(1)}L
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-3xl p-8 md:p-10 border border-emerald-200 dark:border-emerald-800"
          >
            <h3 className="text-2xl font-bold mb-8">Tax Estimate</h3>

            {(() => {
              const netIncome = income - expenses;
              const taxableIncome = Math.max(0, netIncome - 250000); // Basic exemption
              let tax = 0;

              // Simple slab calculation
              if (taxableIncome > 1000000) {
                tax = 250000 + (taxableIncome - 1000000) * 0.3;
              } else if (taxableIncome > 500000) {
                tax = (taxableIncome - 500000) * 0.2;
              } else if (taxableIncome > 250000) {
                tax = (taxableIncome - 250000) * 0.05;
              }

              const gst = (income * 0.18) / 100;

              return (
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-emerald-200 dark:border-emerald-800">
                    <span>Net Income</span>
                    <span className="font-semibold">₹{(netIncome / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-emerald-200 dark:border-emerald-800">
                    <span>Estimated Income Tax</span>
                    <span className="font-semibold">₹{(tax / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-emerald-200 dark:border-emerald-800">
                    <span>GST (Approx)</span>
                    <span className="font-semibold">₹{(gst / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between py-3 bg-emerald-100 dark:bg-emerald-900/30 px-4 rounded-lg">
                    <span className="font-semibold">Total Tax Liability</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{((tax + gst) / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-6 pt-6 border-t border-emerald-200 dark:border-emerald-800">
                    This is an estimate based on standard tax slabs. Consult a tax professional for accurate calculations.
                  </p>
                </div>
              );
            })()}
          </motion.div>
        </div>
      </motion.section>

      {/* Why FinWise */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        id="why"
        className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Built for Indian Businesses
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-12 md:mb-16">
          Every feature is designed specifically for how you work and the taxes you pay.
        </p>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { icon: "🏦", title: "GST Support", desc: "Full GST registration, filing, and compliance tracking" },
            { icon: "📊", title: "44ADA/44AD", desc: "Presumptive income scheme for sole proprietors" },
            { icon: "⏰", title: "Advance Tax", desc: "Automated advance tax calculations and reminders" },
            { icon: "💰", title: "Cash Flow", desc: "Never run out of cash with predictive forecasting" },
            { icon: "📈", title: "Profit Tracking", desc: "Real-time visibility into your business profitability" },
            { icon: "🎯", title: "Business Goals", desc: "Set targets and track progress toward them" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-600 transition"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg md:text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20 md:py-32 px-4 md:px-6 bg-gray-50 dark:bg-zinc-900"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">
            Loved by Thousands
          </h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                quote: "Finally, I understand my tax liability. FinWise saved me thousands during filing.",
                author: "Priya Sharma",
                role: "Freelance Designer",
                location: "Bangalore"
              },
              {
                quote: "Keeps me aware of taxes every month. No surprises. No stress.",
                author: "Rajesh Kumar",
                role: "Web Developer",
                location: "Pune"
              },
              {
                quote: "Invoicing became a breeze. Clients love the professional look.",
                author: "Amit Patel",
                role: "Agency Owner",
                location: "Mumbai"
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-white dark:bg-zinc-800 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-zinc-700"
              >
                <p className="text-lg text-gray-900 dark:text-white mb-6 font-medium">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-br from-slate-900 to-emerald-900"
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Stop Guessing.
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-10">
            Start Running Your Business Like a CFO.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 md:px-12 py-5 md:py-6 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-semibold text-lg transition duration-300"
          >
            Create Free Account
          </Link>
          <p className="text-gray-400 text-sm mt-6">
            No credit card required. Start tracking today.
          </p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  FW
                </div>
                <span className="font-bold">FinWise</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Financial operating system for Indian businesses.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-emerald-600 transition">Features</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Tax Center</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-emerald-600 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Terms</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-emerald-600 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Email us</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-zinc-800 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2026 FinWise India. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}