"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Home, XCircle } from "lucide-react";
import { toast } from "@/components/ToastProvider";

export default function PaymentCancelPage() {
  useEffect(() => {
    toast.info("Checkout was cancelled. No charge was made.");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="card w-full max-w-lg p-8 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <XCircle size={38} />
        </div>

        <h1 className="text-2xl font-extrabold sm:text-3xl">
          Payment Cancelled
        </h1>

        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Your checkout was cancelled and no payment was completed. You can
          return to the pricing page and try again whenever you are ready.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/pricing" className="btn-primary h-12 justify-center px-6">
            Back to Pricing
            <ArrowRight size={16} />
          </Link>
          <Link href="/" className="btn-secondary h-12 justify-center px-6">
            <Home size={16} />
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
