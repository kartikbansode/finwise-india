export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">
        Privacy Policy
      </h1>

      <p className="text-gray-600 mb-6">
        Last Updated: 17 June 2026
      </p>

      <div className="space-y-6 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold mb-2">
            Information We Collect
          </h2>

          <p>
            FinWise India collects information you provide,
            including profile information, financial data,
            income records, expense records, invoices,
            and tax-related information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            How We Use Your Data
          </h2>

          <p>
            We use your information to provide financial
            tracking, tax calculations, reporting,
            analytics, and platform functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            Data Security
          </h2>

          <p>
            We take reasonable measures to protect your
            information. However, no online service can
            guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            Third Party Services
          </h2>

          <p>
            FinWise India uses trusted third-party
            services such as Supabase, Google
            Authentication, and Vercel for platform
            functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            Contact
          </h2>

          <p>
            For privacy-related concerns contact:
            support@finwiseindia.com
          </p>
        </section>

      </div>
    </main>
  );
}