"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total_amount: number;
  status: string;
}

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const supabase = createClient();

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [loading, setLoading] = useState(true);

  async function loadInvoices() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    setInvoices(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  async function deleteInvoice(id: string) {
    await supabase.from("invoices").delete().eq("id", id);

    loadInvoices();
  }
  async function updateStatus(id: string, status: string) {
    await supabase.from("invoices").update({ status }).eq("id", id);

    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, status } : invoice,
      ),
    );
  }

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Invoice Tracker
          </h2>

          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Track invoice status and payments
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="
bg-emerald-600
hover:bg-emerald-700
text-white
px-5
py-3
rounded-xl
font-medium
transition
"
        >
          + New Invoice
        </Link>
      </div>

      <div
        className="
  bg-white dark:bg-zinc-900
  border border-gray-200 dark:border-zinc-800
  rounded-2xl
  p-6
"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Invoices
          </h1>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
    bg-white dark:bg-zinc-950
    border border-gray-300 dark:border-zinc-700
    text-gray-900 dark:text-white
    rounded-xl
    px-4 py-2
    pr-10
    appearance-none
    focus:outline-none
    focus:ring-2
    focus:ring-emerald-500
    "
            >
              <option value="all">All Invoices</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </span>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-blue-500/30 dark:bg-blue-950/30 p-5">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total</p>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </div>

          <div className="rounded-xl border border-green-500/30 dark:bg-green-950/30 p-5">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Paid</p>
            <p className="text-2xl font-bold text-green-600">
              {invoices.filter((i) => i.status === "paid").length}
            </p>
          </div>

          <div className="rounded-xl border border-yellow-500/30 dark:bg-amber-950/30 p-5">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {invoices.filter((i) => i.status === "pending").length}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-500/30 dark:bg-zinc-900 p-5">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Draft</p>
            <p className="text-2xl font-bold text-gray-600">
              {invoices.filter((i) => i.status === "draft").length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No invoices yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
              <tr>
                <th className="p-4 text-left">Invoice</th>

                <th className="p-4 text-left">Client</th>

                <th className="p-4 text-left">Amount</th>

                <th className="p-4 text-left">Status</th>

                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices
                .filter((invoice) =>
                  statusFilter === "all"
                    ? true
                    : invoice.status === statusFilter,
                )
                .map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="
  border-b border-gray-100 dark:border-zinc-800
  hover:bg-gray-50 dark:hover:bg-zinc-800/50
"
                  >
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {invoice.invoice_number}
                    </td>

                    <td className="p-4 text-gray-700 dark:text-gray-300">
                      {invoice.client_name}
                    </td>

                    <td className="p-4 font-semibold text-gray-900 dark:text-white">
                      ₹{Number(invoice.total_amount).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <div className="relative inline-block">
                        <select
                          value={invoice.status}
                          onChange={(e) =>
                            updateStatus(invoice.id, e.target.value)
                          }
                          className={`
px-3 py-2
rounded-lg
text-sm
font-medium
border
appearance-none
pr-8
focus:outline-none
cursor-pointer


${
  invoice.status === "paid"
    ? `
      bg-green-100
      text-green-800
      border-green-300

      dark:bg-green-950/40
      dark:text-green-300
      dark:border-green-700
    `
    : invoice.status === "pending"
      ? `
      bg-amber-100
      text-amber-800
      border-amber-300

      dark:bg-amber-950/40
      dark:text-amber-300
      dark:border-amber-700
    `
      : invoice.status === "draft"
        ? `
      bg-zinc-100
      text-zinc-700
      border-zinc-300

      dark:bg-zinc-800
      dark:text-zinc-300
      dark:border-zinc-700
    `
        : `
      bg-red-100
      text-red-800
      border-red-300

      dark:bg-red-950/40
      dark:text-red-300
      dark:border-red-700
    `
}
`}
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                        <span
                          className="
  absolute
  right-3
  top-1/2
  -translate-y-1/2
  pointer-events-none
  text-current
  text-xs
"
                        >
                          ▼
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-emerald-600 hover:text-emerald-500 mr-4"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
