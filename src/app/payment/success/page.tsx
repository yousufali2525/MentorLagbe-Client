
"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
};

function getDashboardPath(role?: string) {
  switch (String(role || "").toLowerCase()) {
    case "student":
      return "/dashboard/student";

    case "tutor":
      return "/dashboard/tutor";

    case "admin":
      return "/dashboard/admin";

    default:
      return "/sign-in";
  }
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [message, setMessage] = useState("Verifying your payment...");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [dashboardPath, setDashboardPath] = useState("/sign-in");

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      const token = localStorage.getItem("mentorlagbe-token");

      const storedUser = localStorage.getItem("mentorlagbe-user");

      if (storedUser) {
        try {
          const user: User = JSON.parse(storedUser);
          setDashboardPath(getDashboardPath(user.role));
        } catch {
          localStorage.removeItem("mentorlagbe-user");
        }
      }

      if (!sessionId || !token) {
        if (cancelled) return;

        setMessage(
          "Payment information could not be verified. Please sign in and check your payment history."
        );
        setStatus("error");
        return;
      }

      try {
        let paymentConfirmed = false;

        for (let attempt = 0; attempt < 8; attempt++) {
          if (cancelled) return;

          const response = await fetch(
            `${API_URL}/api/payments/my-payments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }
          );

          if (!response.ok) {
            throw new Error("Unable to verify payment");
          }

          const data = await response.json();

          const payment = data.payments?.find(
            (item: {
              stripeSessionId: string;
              paymentStatus: string;
            }) =>
              item.stripeSessionId === sessionId &&
              item.paymentStatus === "paid"
          );

          if (payment) {
            paymentConfirmed = true;
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        if (cancelled) return;

        if (paymentConfirmed) {
          const userResponse = await fetch(`${API_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            const user: User = userData.user || userData;

            if (user && user.role) {
              localStorage.setItem(
                "mentorlagbe-user",
                JSON.stringify(user)
              );

              setDashboardPath(getDashboardPath(user.role));
            }
          }

          if (cancelled) return;

          setMessage(
            "Your payment was successful. Your Pro membership is now active."
          );
          setStatus("success");
        } else {
          setMessage(
            "Your payment was received, but confirmation is still processing. Please check your dashboard again shortly."
          );
          setStatus("error");
        }
      } catch {
        if (cancelled) return;

        setMessage(
          "We could not verify your payment right now. Please check your payment history or try again later."
        );
        setStatus("error");
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
        <div
          className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
            status === "success"
              ? "bg-green-100 text-green-600"
              : status === "error"
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-600"
          }`}
        >
          {status === "success" ? "✓" : status === "error" ? "!" : "…"}
        </div>

        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          {status === "success"
            ? "Payment Successful!"
            : status === "error"
              ? "Payment Verification"
              : "Verifying Payment"}
        </h1>

        <p className="mb-8 text-gray-600">{message}</p>

        {status === "loading" ? (
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        ) : (
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={dashboardPath}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              {dashboardPath === "/sign-in"
                ? "Sign In"
                : "Go to Dashboard"}
            </Link>

            <Link
              href="/pricing"
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              View Plans
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div 
         className="flex min-h-screen items-center justify-center">
          Loading payment information...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
