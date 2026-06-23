import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-300">
      <div className="max-w-4xl mx-auto px-6 py-16 md:px-10 md:py-24">
        <div className="text-center mb-16">
          <Image
            src="/logo/finwise-large-black1.png"
            alt="FinWise"
            width={240}
            height={65}
            className="mx-auto mb-8"
          />

          <h1 className="mt-2 text-5xl md:text-6xl font-bold text-white">
            Privacy Policy
          </h1>

          <p className="mt-5 text-lg text-zinc-400 max-w-2xl mx-auto">
            Your privacy and financial data security are important to us. This
            policy explains how FinWise collects, uses and protects information
            when you use our platform.
          </p>

          <p className="mt-6 text-sm text-zinc-500">
            Effective Date: 23 June 2026
          </p>
        </div>

        <div className="space-y-12 leading-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              1. Information We Collect
            </h2>

            <p>
              FinWise may collect information you provide directly while using
              the platform, including:
            </p>

            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Name and account information</li>
              <li>Email address</li>
              <li>Authentication details</li>
              <li>Income records</li>
              <li>Expense records</li>
              <li>Invoice information</li>
              <li>GST and tax-related information</li>
              <li>Platform usage information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              2. How We Use Information
            </h2>

            <p>
              Information is used solely to operate and improve FinWise,
              including:
            </p>

            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Providing dashboard functionality</li>
              <li>Generating financial insights</li>
              <li>Calculating tax estimates</li>
              <li>Creating invoices and reports</li>
              <li>Maintaining account security</li>
              <li>Providing support and troubleshooting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              3. Data Storage & Security
            </h2>

            <p>
              FinWise uses trusted infrastructure providers and industry
              standard security practices to store and process data. While we
              take reasonable measures to protect information, no online service
              can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              4. Third-Party Services
            </h2>

            <p>
              Certain platform functionality relies on third-party service
              providers including authentication, hosting and database
              infrastructure providers. These services may process information
              only as required to deliver their services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              5. Data Retention
            </h2>

            <p>
              Information may be retained while an account remains active and
              for reasonable periods necessary for security, operational,
              compliance and legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              6. Account Deletion
            </h2>

            <p>
              Users may permanently delete their FinWise account through the
              Settings page. Upon successful account deletion, associated
              profile information and platform data are removed from our active
              systems in accordance with our data management processes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              7. Your Rights
            </h2>

            <p>
              You may review, update or request deletion of information
              associated with your account subject to applicable laws and
              operational requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              8. Policy Changes
            </h2>

            <p>
              This Privacy Policy may be updated periodically. Continued use of
              FinWise after updates constitutes acceptance of the revised
              policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              9. Contact
            </h2>

            <p>Questions regarding this Privacy Policy may be directed to:</p>

            <p className="mt-4 text-emerald-400 font-medium">
              bansodekartik@hotmail.com
            </p>
          </section>
        </div>

        <div className="mt-20 pt-8 border-t border-zinc-800 text-center">
          <Link
            href="/"
            className="
    inline-flex
    items-center
    gap-2

    px-6 py-3

    rounded-xl

    border border-zinc-700
    bg-zinc-900

    text-white

    hover:bg-zinc-800
    transition
    "
          >
            ← Back to Home
          </Link>

          <p className="mt-6 text-sm text-zinc-500">
            © 2026 FinWise. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
