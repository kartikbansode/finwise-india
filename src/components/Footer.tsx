import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-12">
      <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-center">

        <p className="text-sm text-gray-500">
          © 2026 FinWise India. All rights reserved.
        </p>

        <div className="flex gap-6 mt-4 md:mt-0">

          <Link
            href="/privacy"
            className="text-sm text-gray-600 hover:text-black"
          >
            Privacy Policy
          </Link>

          <Link
            href="/terms"
            className="text-sm text-gray-600 hover:text-black"
          >
            Terms & Conditions
          </Link>

        </div>
      </div>
    </footer>
  );
}