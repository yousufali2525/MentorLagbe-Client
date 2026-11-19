"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("MentorLagbe Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mb-4 text-5xl">⚠️</div>

        <h2 className="mb-3 text-2xl font-bold text-gray-800">
          Something went wrong!
        </h2>

        <p className="mb-6 text-gray-600">
          An unexpected error occurred. Please try again.
        </p>

        <button
          onClick={() => reset()}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}