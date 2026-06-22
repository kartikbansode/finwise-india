"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import TaxDisclaimer from "@/components/TaxDisclaimer";
import { calculate44ADA, calculate44AD } from "@/lib/presumptiveTax";
import MobileBlocker from "@/components/MobileBlocker";

export default function TaxPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [annualIncome, setAnnualIncome] = useState(0);
  const [taxableIncome, setTaxableIncome] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    setProfile(profileData);

    const { data: incomeData } = await supabase
      .from("income_entries")
      .select("*")
      .eq("user_id", userData.user.id);

    const { data: expenseData } = await supabase
      .from("expense_entries")
      .select("*")
      .eq("user_id", userData.user.id);

    const totalIncome = (incomeData || []).reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const totalExpenses = (expenseData || []).reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const projectedAnnual = totalIncome * 12;

    setAnnualIncome(projectedAnnual);

    let calculatedTaxable = projectedAnnual;

    if (profileData?.tax_method === "44ada") {
      calculatedTaxable = calculate44ADA(projectedAnnual).taxableIncome;
    }

    if (profileData?.tax_method === "44ad") {
      calculatedTaxable = calculate44AD(projectedAnnual).taxableIncome;
    }

    setTaxableIncome(calculatedTaxable);

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading Tax & Compliance Center...
          </p>
        </div>
      </main>
    );
  }

  

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-10">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tax & Compliance Center
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage GST, Advance Tax, TDS and Presumptive Taxation
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div
            className="
rounded-xl
border border-blue-500/30
bg-blue-500/10
p-5
"
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Annual Revenue
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              ₹{annualIncome.toLocaleString("en-IN")}
            </h2>
          </div>

          <div
            className="
rounded-xl
border border-green-500/30
bg-green-500/10
p-5
"
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Taxable Income
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              ₹{taxableIncome.toLocaleString("en-IN")}
            </h2>
          </div>

          <div
            className="
rounded-xl
border border-purple-500/30
bg-purple-500/10
p-5
"
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Tax Method
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {profile?.tax_method === "44ada"
                ? "44ADA"
                : profile?.tax_method === "44ad"
                  ? "44AD"
                  : "Normal"}
            </h2>
          </div>
          <div
            className="
  rounded-xl
  border border-amber-500/30
  bg-amber-500/10
  p-5
  "
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              GST Status
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {profile?.gst_registered ? "Registered" : "Not Registered"}
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div
            className="bg-white dark:bg-zinc-900
border border-gray-200 dark:border-zinc-800
rounded-xl
p-6"
          >
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
              GST Overview
            </h3>

            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                Annual Turnover:
                <span className="font-medium ml-2 text-gray-900 dark:text-white">
                  ₹{annualIncome.toLocaleString("en-IN")}
                </span>
              </p>
            </div>
          </div>

          <div
            className="bg-white dark:bg-zinc-900
border border-gray-200 dark:border-zinc-800
rounded-xl
p-6"
          >
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
              Presumptive Taxation
            </h3>

            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                Current Method:
                <span className="font-medium ml-2 text-gray-900 dark:text-white">{profile?.tax_method}</span>
              </p>

              <p className="text-gray-700 dark:text-gray-300">
                Taxable Income:
                <span className="font-medium ml-2 text-gray-900 dark:text-white">
                  ₹{taxableIncome.toLocaleString("en-IN")}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div
            className="bg-white dark:bg-zinc-900
border border-gray-200 dark:border-zinc-800
rounded-xl
p-5"
          >
            <h3 className="font-semibold mb-3">Advance Tax</h3>

            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">15 June — Q1</p>

              <p className="text-gray-700 dark:text-gray-300">
                15 September — Q2
              </p>

              <p className="text-gray-700 dark:text-gray-300">
                15 December — Q3
              </p>

              <p className="text-gray-700 dark:text-gray-300">15 March — Q4</p>
            </div>
          </div>

          <div
            className="bg-white dark:bg-zinc-900
border border-gray-200 dark:border-zinc-800
rounded-xl
p-5"
          >
            <h3 className="font-semibold mb-3">TDS Tracker</h3>

            <p className="text-gray-500 dark:text-gray-400">Coming soon</p>
          </div>

          <div
            className="bg-white dark:bg-zinc-900
border border-gray-200 dark:border-zinc-800
rounded-xl
p-5"
          >
            <h3 className="font-semibold mb-3">Regime Comparison</h3>

            <p className="text-gray-500 dark:text-gray-400">Next phase</p>
          </div>
        </div>

        <TaxDisclaimer />
      </div>
    </main>
  );
}
