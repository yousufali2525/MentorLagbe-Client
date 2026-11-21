"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { toast } from "@/components/ToastProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("MentorLagbe Error:", error);
    toast.error("Something went wrong. Please try again.");
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--warning)]">
          <AlertTriangle size={30} />
        </div>

        <h1 className="section-title mt-6 text-2xl">Something went wrong!</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          An unexpected error occurred. Try again, or return to the home page.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary h-11 justify-center px-5"
          >
            <RotateCcw size={16} />
            Try Again
          </button>
          <Link
            href="/"
            className="btn-secondary h-11 justify-center px-5"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
