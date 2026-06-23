import Link from "next/link";
import Image from "next/image";

export default function CookiePolicyPage() {
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

          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Cookie Policy
          </h1>

          <p className="mt-5 text-lg text-zinc-400 max-w-2xl mx-auto">
            Learn how FinWise uses cookies and similar technologies to
            improve security, functionality and user experience.
          </p>

          <p className="mt-6 text-sm text-zinc-500">
            Effective Date: 23 June 2026
          </p>
        </div>

        <div className="space-y-12 leading-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              1. What Are Cookies?
            </h2>

            <p>
              Cookies are small text files stored on your device that help
              websites remember information about your visit and improve
              functionality and performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              2. How FinWise Uses Cookies
            </h2>

            <p>
              FinWise uses cookies and similar technologies to maintain
              account security, remember preferences and improve platform
              performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              3. Essential Cookies
            </h2>

            <p>
              Essential cookies are required for core platform functionality
              and cannot be disabled.
            </p>

            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>User authentication</li>
              <li>Session management</li>
              <li>Security protection</li>
              <li>Theme preferences</li>
              <li>Platform functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              4. Analytics Cookies
            </h2>

            <p>
              Analytics cookies help us understand how visitors use FinWise,
              identify performance issues and improve the user experience.
            </p>

            <p className="mt-4">
              These cookies are optional and can be accepted or rejected by
              users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              5. Managing Cookie Preferences
            </h2>

            <p>
              Users can choose whether to allow optional analytics cookies.
              Essential cookies remain active because they are necessary for
              the operation and security of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              6. Updates to This Policy
            </h2>

            <p>
              We may update this Cookie Policy periodically to reflect
              changes in technology, legal requirements or platform
              functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              7. Contact
            </h2>

            <p>
              Questions regarding this Cookie Policy may be directed to:
            </p>

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