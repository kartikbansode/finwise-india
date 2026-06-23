"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CookieConsent from "@/components/CookieConsent";
import { openCookiePreferences } from "@/lib/cookies";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Menu,
  X,
  FileText,
  DollarSign,
  PieChart,
  Check,
  IndianRupee,
  Calculator,
  TrendingUp,
  Receipt,
  ShieldCheck,
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroVideoLoaded, setHeroVideoLoaded] = useState(false);
  const { scrollYProgress } = useScroll();

  // Navbar shrink on scroll
  const navbarHeight = useTransform(scrollYProgress, [0, 0.1], [80, 64]);

  return (
    <>
      <CookieConsent />
      <div className="bg-zinc-950 text-white overflow-hidden">
        {!heroVideoLoaded && (
          <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Loading FinWise...</p>
            </div>
          </div>
        )}
        {/* Floating Glass Navbar */}
        <motion.nav
          style={{ height: navbarHeight }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-950/70 border-b border-zinc-800/50"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/logo/finwise-large-black1.png"
                alt="FinWise"
                width={180}
                height={50}
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm hover:text-emerald-600 transition"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm hover:text-emerald-600 transition"
              >
                Pricing
              </a>
              <a
                href="#why"
                className="text-sm hover:text-emerald-600 transition"
              >
                Why FinWise
              </a>
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-900 transition"
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
                className="md:hidden absolute top-full left-0 right-0 bg-zinc-900 border-b border-zinc-800"
              >
                <div className="px-4 py-4 space-y-4">
                  <a
                    href="#features"
                    className="block text-sm hover:text-emerald-600"
                  >
                    Features
                  </a>
                  <a
                    href="#tax"
                    className="block text-sm hover:text-emerald-600"
                  >
                    Tax Center
                  </a>
                  <a
                    href="#why"
                    className="block text-sm hover:text-emerald-600"
                  >
                    Why FinWise
                  </a>
                  <div className="flex gap-3 pt-4">
                    <Link
                      href="/login"
                      className="flex-1 text-center text-sm px-4 py-2 rounded-lg border border-zinc-800"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="flex-1 text-center text-sm px-4 py-2 rounded-lg bg-emerald-600 text-white"
                    >
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
          className="
relative
min-h-screen
flex
items-center
justify-center
overflow-hidden
"
        >
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setHeroVideoLoaded(true)}
            className="
absolute
inset-0
w-full
h-full
object-cover
"
          >
            <source src="/landing/hero-video-main.mp4" type="video/mp4" />
          </video>

          {/* Dark Overlay */}
          <div
            className="
absolute
inset-0
bg-black/65
"
          />

          {/* Floating Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/20 blur-[180px] rounded-full" />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="
text-5xl
md:text-7xl
lg:text-[90px]
font-bold
leading-[0.95]
tracking-tight
"
            >
              Run Your Entire
              <br />
              Business From
              <br />
              <span
                className="
            text-emerald-400
              font-bold
              text-5xl
              md:text-7xl
              inline-block
              -rotate-1
              "
                style={{ fontFamily: "EduNSW" }}
              >
                One Dashboard
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="
mt-8
max-w-3xl
mx-auto
text-lg
md:text-2xl
text-white/70
leading-relaxed
"
            >
              Track income, expenses, GST, invoices, tax obligations and
              business performance with complete financial clarity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="
flex
flex-col
sm:flex-row
justify-center
gap-4
mt-10
"
            >
              <Link
                href="/signup"
                className="
px-10
py-5
rounded-2xl
bg-emerald-600
hover:bg-emerald-700
font-semibold
text-lg
shadow-2xl
shadow-emerald-500/30
transition-all
duration-300
hover:scale-105
"
              >
                Start Free
              </Link>

              <Link
                href="#features"
                className="
px-10
py-5
rounded-2xl
border
border-white/20
bg-white/5
backdrop-blur-xl
font-semibold
text-lg
hover:bg-white/10
transition-all
duration-300
"
              >
                Explore Features
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="
grid
grid-cols-2
md:grid-cols-4
gap-8
mt-20
max-w-5xl
mx-auto
"
            >
              <div>
                <div className="text-3xl md:text-5xl font-bold text-emerald-400">
                  ₹1Cr+
                </div>
                <div className="text-white/60 mt-2">Invoices Processed</div>
              </div>

              <div>
                <div className="text-3xl md:text-5xl font-bold text-emerald-400">
                  ₹5Cr+
                </div>
                <div className="text-white/60 mt-2">Tax Calculated</div>
              </div>

              <div>
                <div className="text-3xl md:text-5xl font-bold text-emerald-400">
                  1K+
                </div>
                <div className="text-white/60 mt-2">Businesses</div>
              </div>

              <div>
                <div className="text-3xl md:text-5xl font-bold text-emerald-400">
                  99.8%
                </div>
                <div className="text-white/60 mt-2">Accuracy</div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 3D Dashboard Showcase. */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block py-32 px-6 max-w-7xl mx-auto"
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
                transformStyle: "preserve-3d",
              }}
            >
              <div className="rounded-3xl md:rounded-4xl overflow-hidden border border-emerald-800 shadow-2xl">
                <Image
                  src="/landing/dashboard-preview1.png"
                  alt="FinWise Dashboard Preview"
                  width={1200}
                  height={675}
                  priority
                  className="w-full h-auto"
                />
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -left-4 md:-left-8 top-1/4 w-40 md:w-48 bg-zinc-900 rounded-2xl p-4 md:p-6 shadow-xl border border-zinc-800"
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
                  delay: 0.5,
                }}
                className="absolute -right-4 md:-right-8 top-1/3 w-40 md:w-48 bg-zinc-900 rounded-2xl p-4 md:p-6 shadow-xl border border-zinc-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <p className="text-xs md:text-sm font-semibold">
                    Tax Estimate
                  </p>
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
                  delay: 1,
                }}
                className="absolute -left-4 md:-left-8 bottom-1/4 w-40 md:w-48 bg-zinc-900 rounded-2xl p-4 md:p-6 shadow-xl border border-zinc-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  <p className="text-xs md:text-sm font-semibold">
                    GST Payable
                  </p>
                </div>
                <p className="text-2xl md:text-3xl font-bold">₹45K</p>
                <p className="text-xs text-gray-500 mt-2">Next quarter</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Feature Sections - Alternating Layout */}
        <section
          id="features"
          className="
relative
overflow-hidden
py-24
md:py-36
"
        >
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="
    absolute
    inset-0
    w-full
    h-full
    object-cover
    "
          >
            <source src="/landing/feature-video.mp4" type="video/mp4" />
          </video>

          {/* Dark Overlay */}
          <div
            className="
    absolute
    inset-0
    bg-black/70
    backdrop-blur-[2px]
    "
          />

          {/* Content Container */}
          <div
            className="
    relative
    z-10
    max-w-7xl
    mx-auto
    px-4
    md:px-6
    space-y-20
    md:space-y-32
    "
          >
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
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Track Every{" "}
                  <span
                    className="
    text-emerald-400
    text-[1.2em]
    font-normal
    inline-block
    "
                    style={{ fontFamily: "EduNSW" }}
                  >
                    Rupee
                  </span>
                </h2>
                <p className="text-lg text-white/70 mb-6">
                  See where your money comes from and where it goes. Real-time
                  income tracking with support for all payment methods. Invoice
                  management that doesn't feel like a burden.
                </p>
                <ul className="space-y-4">
                  {[
                    "Multiple payment channels",
                    "Invoice OCR",
                    "Client tracking",
                    "Payment reminders",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                className="
rounded-3xl
overflow-hidden
border
border-white/10
bg-white/5
backdrop-blur-xl
shadow-2xl
shadow-black/50
"
              >
                <Image
                  src="/landing/income-dashboard.png"
                  alt="Income Tracking Dashboard"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
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
                className="
rounded-3xl
overflow-hidden
border
border-white/10
bg-white/5
backdrop-blur-xl
shadow-2xl
shadow-black/50
"
              >
                <Image
                  src="/landing/tax-dashboard1.png"
                  alt="Tax Tracking Dashboard"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="order-1 md:order-2"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Know Your{" "}
                  <span
                    className="
    text-emerald-400
    text-[1.2em]
    font-normal
    inline-block
    "
                    style={{ fontFamily: "EduNSW" }}
                  >
                    Tax
                  </span>{" "}
                  Before Government Does
                </h2>
                <p className="text-lg text-white/70 mb-6">
                  Accurate tax calculations for 44ADA, 44AD, GST, and advance
                  tax. Built with India's tax rules in mind. No surprises during
                  filing.
                </p>
                <ul className="space-y-4">
                  {[
                    "GST Management",
                    "44ADA/44AD Support",
                    "Advance Tax Tracker",
                    "ITR Readiness",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-white/80">{item}</span>
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
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Professional{" "}
                  <span
                    className="
    text-emerald-400
    text-[1.2em]
    font-normal
    inline-block
    "
                    style={{ fontFamily: "EduNSW" }}
                  >
                    Invoicing
                  </span>{" "}
                  Built In
                </h2>
                <p className="text-lg text-white/70 mb-6">
                  Create and send invoices in seconds. Built-in templates for
                  freelancers and agencies. Track payment status automatically.
                </p>
                <ul className="space-y-4">
                  {[
                    "Instant Invoice Creation",
                    "Custom Branding",
                    "Recurring Invoices",
                    "Payment Tracking",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                className="
rounded-3xl
overflow-hidden
border
border-white/10
bg-white/5
backdrop-blur-xl
shadow-2xl
shadow-black/50
"
              >
                <Image
                  src="/landing/invoice-dashboard.png"
                  alt="Invoice Dashboard"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Why FinWise */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          id="why"
          className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
            Built for Indian{" "}
            <span
              className="
    text-emerald-400
    text-[1.2em]
    font-normal
    inline-block
    "
              style={{ fontFamily: "EduNSW" }}
            >
              Businesses
            </span>
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-2xl mx-auto mb-12 md:mb-16">
            Every feature is designed specifically for how you work and the
            taxes you pay.
          </p>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: IndianRupee,
                title: "Income Tracking",
                desc: "Track every payment, invoice and revenue stream.",
              },
              {
                icon: Calculator,
                title: "Tax Center",
                desc: "GST, advance tax, 44ADA and tax planning tools.",
              },
              {
                icon: Receipt,
                title: "Expense Tracking",
                desc: "Monitor spending and control business costs.",
              },
              {
                icon: FileText,
                title: "Invoices",
                desc: "Create and manage professional invoices.",
              },
              {
                icon: TrendingUp,
                title: "Business Insights",
                desc: "Understand profit, cash flow and growth trends.",
              },
              {
                icon: ShieldCheck,
                title: "Compliance",
                desc: "Stay tax-ready and avoid costly mistakes.",
              },
            ].map((item, i) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="
        bg-zinc-900
        rounded-2xl
        p-6 md:p-8
        border border-zinc-800
        hover:border-emerald-500
        dark:hover:border-emerald-600
        transition
      "
                >
                  <Icon className="w-10 h-10 mb-4 text-emerald-500" />

                  <h3 className="text-lg md:text-xl font-bold mb-3">
                    {item.title}
                  </h3>

                  <p className="text-gray-400 text-sm md:text-base">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="py-20 md:py-32 px-4 md:px-6 bg-zinc-900"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16 text-white">
              Loved by{" "}
              <span
                className="
    text-emerald-400
    text-[1.2em]
    font-normal
    inline-block
    "
                style={{ fontFamily: "EduNSW" }}
              >
                Thousands
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  quote:
                    "Finally, I understand my tax liability. FinWise saved me thousands during filing.",
                  author: "Priya Sharma",
                  role: "Freelance Designer",
                  location: "Bangalore",
                },
                {
                  quote:
                    "Keeps me aware of taxes every month. No surprises. No stress.",
                  author: "Rajesh Kumar",
                  role: "Web Developer",
                  location: "Pune",
                },
                {
                  quote:
                    "Invoicing became a breeze. Clients love the professional look.",
                  author: "Amit Patel",
                  role: "Agency Owner",
                  location: "Mumbai",
                },
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800"
                >
                  <p className="text-lg text-white mb-6 font-medium">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold text-white">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                    <p className="text-sm text-gray-400">
                      {testimonial.location}
                    </p>
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
          className="
relative
min-h-[80vh]
flex
items-center
justify-center
overflow-hidden
"
        >
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="
absolute
top-0
left-0
w-full
h-full
object-cover
"
          >
            <source src="/landing/cta-video.mp4" type="video/mp4" />
          </video>

          {/* Dark Overlay */}
          <div
            className="
absolute
inset-0
bg-black/60
backdrop-blur-[2px]
"
          />

          {/* Content */}
          <div
            className="
relative
z-10
max-w-5xl
mx-auto
text-center
px-6
text-white
"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Stop Guessing.
            </h2>

            <p className="text-xl md:text-3xl text-white/80 mb-10 max-w-3xl mx-auto">
              Start Running Your Business Like a CFO.
            </p>

            <Link
              href="/signup"
              className="
inline-flex
items-center
justify-center
px-10
md:px-14
py-5
md:py-6
rounded-2xl
bg-emerald-600
hover:bg-emerald-700
text-lg
font-semibold
shadow-2xl
shadow-emerald-500/30
transition-all
duration-300
hover:scale-105
"
            >
              Create Free Account
            </Link>

            <p className="text-white/60 text-sm mt-6">
              No credit card required • Free forever plan available
            </p>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="bg-zinc-900 border-t border-zinc-800 py-12 md:py-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src="/logo/finwise-large-black1.png"
                    alt="FinWise"
                    width={180}
                    height={50}
                  />
                </div>
                <p className="text-sm text-gray-400">
                  Financial operating system for Indian businesses.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-emerald-600 transition"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-emerald-600 transition"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-emerald-600 transition"
                    >
                      Tax Center
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>

                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-emerald-600 transition"
                    >
                      Privacy
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/terms"
                      className="hover:text-emerald-600 transition"
                    >
                      Terms
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/cookie-policy"
                      className="hover:text-emerald-600 transition"
                    >
                      Cookie Policy
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={openCookiePreferences}
                      className="
        hover:text-emerald-600
        transition
        text-left
        "
                    >
                      Cookie Preferences
                    </button>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-emerald-600 transition"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-emerald-600 transition"
                    >
                      Email Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-emerald-600 transition"
                    >
                      Community
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-8 text-center text-sm text-gray-400">
              <p>© 2026 FinWise India. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
