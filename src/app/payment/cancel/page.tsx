
"use client";

import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl font-bold text-red-600">
          ×
        </div>

        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Payment Cancelled
        </h1>

        <p className="mb-8 text-gray-600">
          Your payment was cancelled. No payment has been completed. You can
          return to the pricing page and try again whenever you are ready.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/pricing"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Pricing
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
